# turupurun-site

フランチャイズLP・トレカDX LP・コーポレートサイトの3サイトをまとめたリポジトリ。配信先と起動設定は [DEPLOYMENT_TARGETS.md](DEPLOYMENT_TARGETS.md) が正。

## 使い方

- フランチャイズLP: `npm run start:franchise`（Railway: `railway.json`）
- トレカDX LP: `npm run start:toreca-dx`（Railway: `railway.toreca-dx.json`）
- コーポレートサイト: `npm run start:corporate`（Railway: `railway.corporate.json`）
- 公開前に `npm run check` を通し、各サイトの `/health` の `site` を確認する。

## 作り方・技術メモ

- 静的HTML（`index.html` ほか）+ Node サーバー（`server*.js`）。Railway で3プロジェクトに分けて配信。
- `vercel.json` / `wrangler.*.toml`（Cloudflare）も残っている。
