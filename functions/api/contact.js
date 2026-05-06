import { EmailMessage } from "cloudflare:email";

const JSON_HEADERS = {
  "content-type": "application/json; charset=UTF-8",
};

const categoryLabels = {
  "フランチャイズ": "Franchise",
  "システム開発": "System Development",
  "業務提携": "Business Alliance",
  "その他": "Other",
};

function getLanguage(payload) {
  return payload?.lang === "en" ? "en" : "ja";
}

function requiredFieldsValid(payload) {
  const categories = Array.isArray(payload.categories) ? payload.categories : [];
  return (
    categories.length > 0 &&
    Boolean(payload.lastName?.trim()) &&
    Boolean(payload.firstName?.trim()) &&
    Boolean(payload.email?.trim()) &&
    Boolean(payload.emailConfirm?.trim()) &&
    Boolean(payload.message?.trim()) &&
    payload.email.trim() === payload.emailConfirm.trim() &&
    payload.privacyAgreed === true
  );
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderLines(payload, lang) {
  const labels =
    lang === "en"
      ? {
          category: "Category",
          name: "Name",
          company: "Company",
          department: "Department",
          phone: "Phone Number",
          website: "Website",
          email: "Email",
          message: "Inquiry Details",
        }
      : {
          category: "カテゴリ",
          name: "お名前",
          company: "貴社名",
          department: "部署名",
          phone: "電話番号",
          website: "ウェブサイト",
          email: "Email",
          message: "お問合せ内容",
        };

  const categories = (payload.categories || []).map((item) =>
    lang === "en" ? categoryLabels[item] || item : item,
  );

  return [
    [labels.category, categories.join(" / ") || "-"],
    [labels.name, `${payload.lastName || ""} ${payload.firstName || ""}`.trim() || "-"],
    [labels.company, payload.companyName || "-"],
    [labels.department, payload.departmentName || "-"],
    [labels.phone, payload.phoneNumber || "-"],
    [labels.website, payload.website || "-"],
    [labels.email, payload.email || "-"],
    [labels.message, payload.message || "-"],
  ];
}

function createEmailContent(payload, lang) {
  const subject =
    lang === "en"
      ? `[TURUPURUN] New contact inquiry`
      : `【株式会社ツルプルン】お問い合わせを受け付けました`;

  const intro =
    lang === "en"
      ? "A new inquiry has been submitted from the contact form."
      : "お問い合わせフォームから新しいお問い合わせが送信されました。";

  const lines = renderLines(payload, lang);

  const text = [
    intro,
    "",
    ...lines.map(([label, value]) => `${label}: ${value}`),
  ].join("\n");

  const html = `
    <div style="font-family: Arial, 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; color: #111;">
      <p>${escapeHtml(intro)}</p>
      <table style="border-collapse: collapse; width: 100%; max-width: 720px;">
        <tbody>
          ${lines
            .map(
              ([label, value]) => `
                <tr>
                  <th style="text-align: left; vertical-align: top; padding: 8px 12px 8px 0; border-bottom: 1px solid #ddd; width: 180px;">
                    ${escapeHtml(label)}
                  </th>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd; white-space: pre-wrap;">
                    ${escapeHtml(value)}
                  </td>
                </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  return { subject, text, html };
}

function toBase64Utf8(value) {
  return btoa(unescape(encodeURIComponent(value)));
}

function createRawMessage({ subject, text, html, from, to }) {
  const boundary = `boundary_${crypto.randomUUID()}`;
  return [
    `From: K.K. TURUPURUN <${from}>`,
    `To: <${to}>`,
    `Subject: =?UTF-8?B?${toBase64Utf8(subject)}?=`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    text,
    "",
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    html,
    "",
    `--${boundary}--`,
    "",
  ].join("\r\n");
}

export async function onRequestPost(context) {
  try {
    const payload = await context.request.json();
    const lang = getLanguage(payload);

    if (!requiredFieldsValid(payload)) {
      return new Response(
        JSON.stringify({
          ok: false,
          message:
            lang === "en"
              ? "Required fields are missing or invalid."
              : "必須項目が不足しているか、入力内容に誤りがあります。",
        }),
        { status: 400, headers: JSON_HEADERS },
      );
    }

    const { subject, text, html } = createEmailContent(payload, lang);
    const sender = "info@turupurun.com";
    const rawMessage = createRawMessage({
      subject,
      text,
      html,
      from: sender,
      to: "info@turupurun.com",
    });

    const message = new EmailMessage(sender, "info@turupurun.com", rawMessage);
    await context.env.CONTACT_EMAIL.send(message);

    return new Response(
      JSON.stringify({
        ok: true,
        message:
          lang === "en"
            ? "Your inquiry has been sent successfully."
            : "お問い合わせを送信しました。",
      }),
      { status: 200, headers: JSON_HEADERS },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: "Failed to send inquiry.",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: JSON_HEADERS },
    );
  }
}
