# 訪問介護シフトAIデモ / Cloudflare Workers Builds

現在の GitHub Pages の代わりに、Cloudflare Workers Builds が push を受けて静的サイトを組み立て、公開するための構成。既存の GitHub Pages の URL は GitHub 所有のため、Cloudflare Worker と同じ URL にはできない。**切替前に新しい公開先への案内が必要**。GitHub側の移行設定は先にmainへ統合するが、Cloudflareの公開とURLの導線が確認できるまではGitHub Pagesによる自動公開を維持する。

## Cloudflare 側で接続

Workers & Pages で Worker **`careshift-ai-demo-ci`** を作成し、Settings → Builds から `charukun/homecare-shift-ai-demo` を接続。Worker 名は `wrangler.jsonc` と同一にする。

| 設定 | 値 |
| --- | --- |
| Production branch | `main` |
| Root directory | `/` |
| Build command | `node scripts/build-static.mjs` |
| Deploy command | `npx --yes wrangler@4.92.0 deploy --config wrangler.jsonc` |
| Preview command | `npx --yes wrangler@4.92.0 preview --config wrangler.jsonc` |
| Build variables | `NODE_VERSION=22`, `SKIP_DEPENDENCY_INSTALL=1`（npmの依存なし） |
| Build watch paths (include) | `index.html`, `scripts/*`, `wrangler.jsonc` |

ビルドはNodeでHTMLの構造を確認し、`site/index.html` と `site/release.json` を生成するだけ。DB、個人情報、GPU・ブラウザの描画テストは扱わない。Workerの配信対象は `site/` のみ。

CloudflareのPreviewにてHTMLが実際に配信され、`release.json` に対応コミットが入っていることを確認する。この準備PRをマージしても `.github/workflows/pages.yml` の自動公開は止めない。Cloudflareでの実ビルドと配信を確認し、新しい公開先への導線ができてから **別PRで** Pages自動公開を停止する。現行GitHub PagesのURLは引き続き古い版を表示するため、周知・リダイレクトなしで公開URLの置換が済んだとは扱わない。
