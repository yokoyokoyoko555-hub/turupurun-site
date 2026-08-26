# Deployment targets

配信先を混同しないため、以下を固定の運用ルールとする。

| サイト | 配信先 | 起動設定 |
| --- | --- | --- |
| フランチャイズLP | Railway（フランチャイズLP専用プロジェクト） | `railway.json` / `npm run start:franchise` |
| トレカDX LP | Railway（トレカDX LP専用プロジェクト） | `railway.toreca-dx.json` / `npm run start:toreca-dx` |
| コーポレートサイト | Vercel | `vercel.json` |

## Railwayの設定

- フランチャイズLPは、Railwayの **Config file path** に `/railway.json` を指定する。
- トレカDX LPは、Railwayの **Config file path** に `/railway.toreca-dx.json` を指定する。
- Railwayで `npm run start:corporate` を設定しない。
- VercelのコーポレートサイトをRailwayへ接続しない。

## 公開前の確認

1. `npm run check` が成功すること。
2. 各Railwayプロジェクトの `/health` を開き、`site` が意図した値であること。
   - フランチャイズLP: `franchise`
   - トレカDX LP: `toreca-dx`
3. 公開URLのタイトルとファーストビューを目視確認すること。
