import { type NextRequest, NextResponse } from "next/server"

const TRELLO_API_KEY = process.env.TRELLO_API_KEY
const TRELLO_TOKEN = process.env.TRELLO_TOKEN
const TRELLO_BOARD_ID = process.env.TRELLO_BOARD_ID

const CARD_NAMES = ["行政調査", "図面作成ライト", "本図面", "書類(特定/水質etc)", "見積もり依頼", "契約書作成"]

const CARD_ASSIGNEES: Record<string, string | null> = {
  行政調査: "65509e2e84d03bffe0151207", // Aidien Ramezani
  図面作成ライト: "68f855c5926d9902d51625ad", // harumichi shimoda
  本図面: null, // 割当無し
  "書類(特定/水質etc)": "65509e2e84d03bffe0151207", // Aidien Ramezani
  見積もり依頼: "5d6cf098db985d3dab0b4b3b", // Masaki Okamura
  契約書作成: "5d6cf098db985d3dab0b4b3b", // Masaki Okamura
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] 環境変数チェック:", {
      hasApiKey: !!TRELLO_API_KEY,
      hasToken: !!TRELLO_TOKEN,
      hasBoardId: !!TRELLO_BOARD_ID,
      apiKeyLength: TRELLO_API_KEY?.length,
      tokenLength: TRELLO_TOKEN?.length,
      boardId: TRELLO_BOARD_ID,
    })

    if (!TRELLO_API_KEY || !TRELLO_TOKEN || !TRELLO_BOARD_ID) {
      return NextResponse.json(
        { error: "Trello APIの設定が不足しています。環境変数を確認してください。" },
        { status: 500 },
      )
    }

    const formData = await request.formData()
    const projectName = formData.get("projectName") as string
    const siteUrl = formData.get("siteUrl") as string
    const tsuboArea = formData.get("tsuboArea") as string
    const clientCompany = formData.get("clientCompany") as string

    console.log("[v0] フォームデータ:", { projectName, siteUrl, tsuboArea, clientCompany })

    const files: File[] = []
    for (let i = 1; i <= 4; i++) {
      const file = formData.get(`file${i}`) as File | null
      if (file) files.push(file)
    }

    console.log("[v0] 添付ファイル数:", files.length)

    // 1. リストを作成
    const listUrl = `https://api.trello.com/1/lists?name=${encodeURIComponent(projectName)}&idBoard=${TRELLO_BOARD_ID}&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
    console.log(
      "[v0] リスト作成URL:",
      listUrl.replace(TRELLO_TOKEN, "***TOKEN***").replace(TRELLO_API_KEY, "***KEY***"),
    )

    const listResponse = await fetch(listUrl, { method: "POST" })

    console.log("[v0] リスト作成レスポンスステータス:", listResponse.status)
    const listResponseText = await listResponse.text()
    console.log("[v0] リスト作成レスポンス内容:", listResponseText)

    if (!listResponse.ok) {
      throw new Error(`Trelloリストの作成に失敗しました: ${listResponse.status} - ${listResponseText}`)
    }

    const list = JSON.parse(listResponseText)
    const listId = list.id
    console.log("[v0] 作成されたリストID:", listId)

    // 2. 各カードを作成
    for (const cardName of CARD_NAMES) {
      let cardDescription = `候補地URL: ${siteUrl}\n坪数: ${tsuboArea}坪`
      if (clientCompany) {
        cardDescription += `\n取引先企業: ${clientCompany}`
      }

      const cardResponse = await fetch(
        `https://api.trello.com/1/cards?idList=${listId}&name=${encodeURIComponent(cardName)}&desc=${encodeURIComponent(cardDescription)}&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
        { method: "POST" },
      )

      if (!cardResponse.ok) {
        const errorText = await cardResponse.text()
        console.log("[v0] カード作成エラー:", errorText)
        throw new Error(`カード「${cardName}」の作成に失敗しました: ${cardResponse.status}`)
      }

      const card = await cardResponse.json()
      const cardId = card.id
      console.log("[v0] カード作成成功:", cardName, cardId)

      const assigneeId = CARD_ASSIGNEES[cardName]
      if (assigneeId) {
        const assignResponse = await fetch(
          `https://api.trello.com/1/cards/${cardId}/idMembers?value=${assigneeId}&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
          { method: "POST" },
        )

        if (!assignResponse.ok) {
          const errorText = await assignResponse.text()
          console.log("[v0] 担当者割当エラー:", errorText)
        } else {
          console.log("[v0] 担当者割当成功:", cardName, "→", assigneeId)
        }
      }

      // 3. ファイルを各カードに添付
      for (const file of files) {
        const attachmentFormData = new FormData()
        attachmentFormData.append("file", file)

        const attachResponse = await fetch(
          `https://api.trello.com/1/cards/${cardId}/attachments?setCover=false&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
          {
            method: "POST",
            body: attachmentFormData,
          },
        )

        if (!attachResponse.ok) {
          const errorText = await attachResponse.text()
          console.log("[v0] 添付ファイルエラー:", errorText)
        } else {
          console.log("[v0] ファイル添付成功:", file.name, "to card:", cardName)
        }
      }
    }

    return NextResponse.json({ success: true, listId })
  } catch (error) {
    console.error("[v0] Trello API Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "サーバーエラーが発生しました" },
      { status: 500 },
    )
  }
}
