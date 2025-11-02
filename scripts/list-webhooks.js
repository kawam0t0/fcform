// Webhook一覧表示スクリプト
// 使い方: node scripts/list-webhooks.js

const TRELLO_API_KEY = process.env.TRELLO_API_KEY
const TRELLO_TOKEN = process.env.TRELLO_TOKEN

async function listWebhooks() {
  console.log("[v0] 登録済みWebhook一覧を取得します...")

  const url = `https://api.trello.com/1/tokens/${TRELLO_TOKEN}/webhooks?key=${TRELLO_API_KEY}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] エラー:", response.status, errorText)
      return
    }

    const webhooks = await response.json()
    console.log(`[v0] 登録済みWebhook数: ${webhooks.length}`)

    webhooks.forEach((webhook, index) => {
      console.log(`\n[v0] Webhook ${index + 1}:`)
      console.log("  ID:", webhook.id)
      console.log("  Description:", webhook.description)
      console.log("  Callback URL:", webhook.callbackURL)
      console.log("  Active:", webhook.active)
      console.log("  Board ID:", webhook.idModel)
    })
  } catch (error) {
    console.error("[v0] エラーが発生しました:", error.message)
  }
}

listWebhooks()
