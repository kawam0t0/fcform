# プロジェクト登録フォーム with Trello連携

スマートフォンで使いやすいプロジェクト登録フォームです。入力された情報を自動的にTrelloに反映します。

## 機能

- プロジェクト名、候補地URL、坪数の入力
- 最大4つのファイル添付
- Trelloへの自動登録
  - プロジェクト名でリストを自動生成
  - 6枚のカードを自動生成（行政調査、図面作成ライト、本図面、書類、見積もり依頼、契約書作成）
  - 各カードに候補地URLと添付資料を自動添付

## セットアップ

### 1. Trello APIキーとトークンの取得

1. [Trello Power-Ups Admin](https://trello.com/power-ups/admin) にアクセス
2. 「New」をクリックして新しいPower-Upを作成
3. APIキーを取得
4. トークンを生成（リンクをクリック）

### 2. Trello ボードIDの取得

1. Trelloボードを開く
2. URLから取得: `https://trello.com/b/BOARD_ID/board-name`
3. または、ボードのメニュー > その他 > メールでボードに送信 > メールアドレスからIDを確認

### 3. 環境変数の設定

`.env.local`ファイルを作成し、以下を設定：

\`\`\`
TRELLO_API_KEY=your_api_key
TRELLO_TOKEN=your_token
TRELLO_BOARD_ID=your_board_id
\`\`\`

### 4. 起動

\`\`\`bash
npm install
npm run dev
\`\`\`

## 使い方

1. フォームに必要事項を入力
2. 必要に応じてファイルを添付
3. 「Trelloに登録」ボタンをクリック
4. Trelloボードに自動的にリストとカードが作成されます
