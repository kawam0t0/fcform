// Webhook登録スクリプト
// 使い方: node scripts/register-webhook.js

const TRELLO_API_KEY = process.env.TRELLO_API_KEY
const TRELLO_TOKEN = process.env.TRELLO_TOKEN
const BOARD_ID = process.env.TRELLO_BOARD_ID
const CALLBACK_URL = "https://fcform.vercel.app/api/trello/webhook"

async function registerWebhook() {
  console.log("[v0] Webhook登録を開始します...")
  console.log("[v0] ボードID:", BOARD_ID)
  console.log("[v0] コールバックURL:", CALLBACK_URL)

  const url = new URL("https://api.trello.com/1/webhooks")
  url.searchParams.append("key", TRELLO_API_KEY)
  url.searchParams.append("token", TRELLO_TOKEN)
  url.searchParams.append("callbackURL", CALLBACK_URL)
  url.searchParams.append("idModel", BOARD_ID)
  url.searchParams.append("description", "FC Contract Board Monitor")

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] エラー:", response.status, errorText)
      return
    }

    const webhook = await response.json()
    console.log("[v0] ✓ Webhook登録成功!")
    console.log("[v0] Webhook ID:", webhook.id)
    console.log("[v0] Active:", webhook.active)
    console.log("[v0] Callback URL:", webhook.callbackURL)
  } catch (error) {
    console.error("[v0] エラーが発生しました:", error.message)
  }
}

registerWebhook()
