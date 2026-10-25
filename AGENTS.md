# 作業ルール

## 公開前SEOチェック（ユーザー指示 2026-10-26）

新規公開・URL変更・公開ページ追加時は、検索対象ページについて以下を確認する。これは運用ルールの保存であり、既存サイトの実検査・修正完了を意味しない。管理画面・個人情報・認証後・検証環境の非公開設定や意図した noindex は保持する。

1. **HTMLと描画**：検索対象の本文・見出し・通常のリンクをクローラーが取得できるか確認する。静的HTML・SSG・SSRを用途に応じて選ぶ。GoogleはJavaScriptも描画するためSSRは必須ではない。ゲーム本体をSEOだけのためにSSR化せず、紹介ページのHTMLを整える。
2. **SitemapとSearch Console**：正規の公開URLだけをsitemap.xmlへ収録し、ページ増減時に更新する（静的生成でも可）。Search Consoleの所有権確認・提出・URL検査は実施状況を記録し、未実施を済みと書かない。
3. **robots.txt**：本番の検索対象ページと必要なJS/CSSを誤って遮断していないか確認する。robots.txtはアクセス制御や確実な検索除外の代用にしない。
4. **noindex**：meta robots/googlebot、HTTPのX-Robots-Tag、配信設定を検索し、本番の検索対象に残る意図しないnoindexを除く。意図した除外は削除しない。noindexを認識させるURLはクロール可能にする。
5. **HTTP・リンク**：リンク切れ、循環・多段リダイレクトを解消。移転は適切な301/308、存在しないURLは404/410を返す。404画面に復帰導線を設けても、200やトップへの一律転送によるsoft 404を作らない。
6. **正規URLとメタ情報（原文にない補足）**：HTTPS・ドメイン・末尾スラッシュ等の正規URLとcanonicalを揃え、ページ固有のtitle・説明・見出し・内部リンクを確認。多言語公開では実在する対応ページ間のhreflangも確認する。
7. **公開後の確認（原文にない補足）**：本番URLの応答・配信HTML・描画内容を確認し、Search Consoleでインデックス状況・クロール障害を確認する。ローカル成功と本番成功、提出と登録を区別する。検索登録・順位・所要時間は保証しない。

原文は「7項目」としつつ列挙は5項目だったため、6・7を補足した。技術設定だけで検索掲載が保証されるわけではなく、内容の品質も評価対象。公開前チェックの証拠にはURL・確認日・コード版・結果・未確認事項を残す。

一次資料：
- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics?hl=ja
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview?hl=ja
- https://developers.google.com/search/docs/crawling-indexing/block-indexing?hl=ja
