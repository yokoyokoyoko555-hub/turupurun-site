const { Resend } = require("resend");

const categoryLabels = {
  フランチャイズ: "Franchise",
  システム開発: "System Development",
  業務提携: "Business Alliance",
  その他: "Other",
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createEmailContent(payload, lang) {
  const subject =
    lang === "en"
      ? "[TURUPURUN] New contact inquiry"
      : "【株式会社ツルプルン】お問い合わせを受け付けました";

  const intro =
    lang === "en"
      ? "A new inquiry has been submitted from the contact form."
      : "お問い合わせフォームから新しいお問い合わせが送信されました。";

  const lines = renderLines(payload, lang);
  const text = [intro, "", ...lines.map(([label, value]) => `${label}: ${value}`)].join("\n");

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

function createResendClient() {
  const { RESEND_API_KEY, RESEND_FROM } = process.env;

  if (!RESEND_API_KEY || !RESEND_FROM) {
    return null;
  }

  return new Resend(RESEND_API_KEY);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed." });
  }

  const payload = req.body || {};
  const lang = getLanguage(payload);

  if (!requiredFieldsValid(payload)) {
    return res.status(400).json({
      ok: false,
      message:
        lang === "en"
          ? "Required fields are missing or invalid."
          : "必須項目が不足しているか、入力内容に誤りがあります。",
    });
  }

  const resend = createResendClient();
  if (!resend) {
    return res.status(500).json({
      ok: false,
      message:
        lang === "en"
          ? "Email settings are not configured on the server."
          : "サーバー側のメール設定が未完了です。",
    });
  }

  try {
    const { subject, text, html } = createEmailContent(payload, lang);
    const fromAddress = process.env.RESEND_FROM;
    const toAddress = process.env.MAIL_TO || "info@turupurun.com";

    const response = await resend.emails.send({
      from: `K.K. TURUPURUN <${fromAddress}>`,
      to: [toAddress],
      replyTo: payload.email,
      subject,
      text,
      html,
    });

    if (response.error) {
      throw new Error(response.error.message || "Failed to send inquiry.");
    }

    return res.status(200).json({
      ok: true,
      message:
        lang === "en"
          ? "Your inquiry has been sent successfully."
          : "お問い合わせを送信しました。",
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";

    return res.status(500).json({
      ok: false,
      message:
        lang === "en"
          ? detail
          : `お問い合わせの送信に失敗しました。 ${detail}`,
      error: detail,
    });
  }
};
