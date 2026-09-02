# トレカDX LP review

## Implemented

- コアメッセージを「カードショップDXを、必要な分だけ。」へ変更
- ブランドメッセージをページ中心部に配置
- `MODULE` と `INTEGRATION` を視覚・文言の両方で区別
- POS、EC／通販を外部サービス連携として表示
- 問題提起を「不要機能を含む契約」「システム都合に合わせる運営」へ変更
- Before／Afterをパッケージ対モジュール構成の比較へ変更
- モジュールカード、店舗中心の接続図、段階導入フローを追加
- FAQで既存POS、単体導入、後からの追加、ECの扱いを説明
- システム事業ページから専用LPへの導線を追加
- Corporateサーバー、Cloudflareビルド、サイトマップへページを追加
- Before／After画像を同一人物・同一店舗・同一画風の対になる構成へ更新
- 過度な発光や写実的なAIイラスト表現を避け、低彩度の手描きエディトリアル調へ統一
- Beforeは業務負担が伝わる疲れた表情、Afterは接客を楽しむ自然な笑顔へ調整

## Validation

- `npm run check`: passed
- `npm run build:cloudflare:corporate`: passed
- Local HTTP response for `/toreca-dx.html`: 200
- Prohibited phrase scan on published HTML and system overview: no matches

## Human decisions still needed

- 正式な提供モジュール一覧と各モジュールの正確な機能範囲
- 対応可能なPOS、EC／通販、外部サービスと連携条件
- 料金体系（モジュール単位の料金であることを含む）
- 導入事例、実績、画面画像など掲載可能な証拠
- 問い合わせ後の具体的な対応フローと所要期間

Until these items are approved, the LP labels module content as examples and
does not make compatibility, pricing, or performance guarantees.
