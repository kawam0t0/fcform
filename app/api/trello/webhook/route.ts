import { type NextRequest, NextResponse } from "next/server"

const TRELLO_API_KEY = process.env.TRELLO_API_KEY
const TRELLO_TOKEN = process.env.TRELLO_TOKEN
const TARGET_BOARD_ID = "6906c2a91d3d2a7086fc95f2" // 契約〜OPEN ボード

const CARD_TITLES = [
  "洗車機発注",
  "キュービクル発注",
  "洗車機搬入連絡@伊佐",
  "ラフター手配@伊佐",
  "阪神ロジ依頼",
  "洗車機搬入連絡",
  "ガラス屋手配",
  "ラッピング発注",
  "コーキング屋さんへ依頼",
  "ラフター手配@候補地",
  "トラック手配＠候補地",
  "コンプレッサー発注",
  "エアードライヤー発注",
  "設営協力業者へ依頼",
  "ハイロック",
  "事務所場内の誘導ライン",
  "アルミ合板",
  "MCステッカー",
  "サブスクカード",
  "コースシール",
  "サブスクフライヤー",
  "ポイントカード",
  "利用規約",
  "新規販促物",
  "運営備品手配",
  "スクエアレジ購入",
  "Googleアカウント",
  "DialPad",
  "Instagram",
  "Squareアカウント",
  "GoogleMap",
  "エアシフト",
  "インスタ広告",
  "インフルエンサー",
  "PR Times",
  "チラシ",
  "地元メディア掲載",
  "群ラボ",
  "社員採用準備",
  "社員面接",
  "社員採用",
  "アルバイト採用準備",
  "アルバイト面接",
  "アルバイト採用",
  "座学",
  "既存店舗での実務",
  "設営",
  "新店舗での実務",
]

export async function HEAD() {
  // Trello Webhookの検証用
  return new Response(null, { status: 200 })
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    console.log("[v0] Webhook受信:", payload.action?.type)

    // カードが完了状態になったことを検知
    if (
      payload.action?.type === "updateCard" &&
      payload.action?.data?.card?.dueComplete === true &&
      payload.action?.data?.card?.name === "契約書作成"
    ) {
      console.log("[v0] 契約書作成カードが完了しました")

      const card = payload.action.data.card
      const oldCard = payload.action.data.old

      // 既に完了していた場合はスキップ（重複防止）
      if (oldCard?.dueComplete === true) {
        console.log("[v0] 既に完了済みのため、スキップします")
        return NextResponse.json({ message: "Already completed" })
      }

      // カードの詳細情報を取得
      const cardDetailsResponse = await fetch(
        `https://api.trello.com/1/cards/${card.id}?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
      )

      if (!cardDetailsResponse.ok) {
        throw new Error("カード詳細の取得に失敗しました")
      }

      const cardDetails = await cardDetailsResponse.json()

      // リスト名を取得（プロジェクト名）
      const listResponse = await fetch(
        `https://api.trello.com/1/lists/${cardDetails.idList}?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
      )

      if (!listResponse.ok) {
        throw new Error("リスト情報の取得に失敗しました")
      }

      const listData = await listResponse.json()
      const projectName = listData.name

      console.log("[v0] プロジェクト名:", projectName)

      // 別のボードに同じ名前のリストを作成
      const newListResponse = await fetch(
        `https://api.trello.com/1/lists?name=${encodeURIComponent(projectName)}&idBoard=${TARGET_BOARD_ID}&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
        { method: "POST" },
      )

      if (!newListResponse.ok) {
        const errorText = await newListResponse.text()
        throw new Error(`新しいリストの作成に失敗しました: ${errorText}`)
      }

      const newList = await newListResponse.json()
      console.log("[v0] 新しいリスト作成成功:", newList.id)

      const createdCards = []
      for (const title of CARD_TITLES) {
        const newCardResponse = await fetch(
          `https://api.trello.com/1/cards?idList=${newList.id}&name=${encodeURIComponent(title)}&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
          { method: "POST" },
        )

        if (newCardResponse.ok) {
          const newCard = await newCardResponse.json()
          createdCards.push(newCard.id)
          console.log("[v0] カード作成成功:", title)
        } else {
          console.error("[v0] カード作成失敗:", title)
        }
      }

      console.log("[v0] 合計", createdCards.length, "枚のカードを作成しました")

      return NextResponse.json({
        success: true,
        message: `新しいボードにリスト「${projectName}」と${createdCards.length}枚のカードを作成しました`,
        newListId: newList.id,
        createdCardsCount: createdCards.length,
      })
    }

    return NextResponse.json({ message: "No action taken" })
  } catch (error) {
    console.error("[v0] Webhook処理エラー:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "エラーが発生しました" },
      { status: 500 },
    )
  }
}
