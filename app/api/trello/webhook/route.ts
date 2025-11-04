import { type NextRequest, NextResponse } from "next/server"

const TRELLO_API_KEY = process.env.TRELLO_API_KEY
const TRELLO_TOKEN = process.env.TRELLO_TOKEN

const DEFAULT_MEMBERS = [
  "65509e2e84d03bffe0151207", // Aidien Ramezani
  "5d6cf098db985d3dab0b4b3b", // Masaki Okamura
]

const LIST_CARDS = {
  人事系: [
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
  ],
  プロモーション系: ["インスタ広告", "インフルエンサー", "PR Times", "チラシ", "地元メディア掲載", "群ラボ"],
  通信系: ["Googleアカウント", "DialPad", "Instagram", "Squareアカウント", "GoogleMap", "エアシフト"],
  販促物備品系: [
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
  ],
  連携系: [
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
  ],
}

const LIST_LABEL_COLORS: Record<string, string> = {
  連携系: "green",
  販促物備品系: "yellow",
  通信系: "orange",
  プロモーション系: "red",
  人事系: "purple",
}

const CARD_CHECKLISTS: Record<string, string[]> = {
  洗車機発注: ["洗車機仕様確認", "関連機器確認", "マットクリーナー", "スペアパーツリスト"],
  キュービクル発注: ["キュービクル仕様確認"],
  "洗車機搬入連絡@伊佐": ["女屋さん(伊佐建設)電話", "日程が分かり次第安藤さんへ"],
  "ラフター手配@伊佐": ["内山クレーン（内山さん）へ電話"],
  阪神ロジ依頼: ["メールにて送る", "LivからPL/BL/PIをもらう"],
  洗車機搬入連絡: ["女屋さん(伊佐建設)電話", "日程が分かり次第安藤さんへ"],
  ガラス屋手配: ["マキヤマ（櫻井さん）へ電話"],
  ラッピング発注: ["大木さんへ電話"],
  コーキング屋さんへ依頼: ["佐々木さんへ電話"],
  "ラフター手配@候補地": ["内山クレーン（内山さん）へ電話"],
  "トラック手配＠候補地": ["美心（新井さん）へ電話"],
  コンプレッサー発注: ["下田さんへ発注依頼"],
  エアードライヤー発注: ["下田さんへ発注依頼"],
  設営協力業者へ依頼: ["下田さん/女屋さん/吉田さん"],
  ハイロック: ["HP変更の連絡"],
  事務所場内の誘導ライン: ["雨宮さんへ図面送付"],
  アルミ合板: ["料金表看板", "利用規約看板", "出口看板", "タオル看板"],
  MCステッカー: ["1セット", "発注", "納期確認"],
  サブスクカード: ["3000枚"],
  コースシール: ["プレ2500枚", "プラス1000枚", "ナイ1000枚", "セラ1000枚"],
  サブスクフライヤー: ["1000枚"],
  ポイントカード: ["2000枚"],
  利用規約: ["2500枚"],
  新規販促物: ["横断幕", "各種指示看板", "豆腐看板", "アパレル", "39用フライヤー", "のぼり", "事務所シール"],
  運営備品手配: [
    "https://docs.google.com/spreadsheets/d/1Axw-xl56HQuPugajb4F3sNAN6htw7PinSxVvCpACmZA/edit?usp=sharing",
  ],
  スクエアレジ購入: ["ターミナル", "ドロワー", "ハブ"],
  Googleアカウント: ["アカウント作成", "chatスペース作成"],
  DialPad: ["プラン選定", "申し込み", "発番"],
  Instagram: ["アカウント開設"],
  Squareアカウント: ["アカウント開設", "リテール開設", "電子マネー申請", "商品名追加", "レシート等の設定"],
  GoogleMap: ["アカウント開設"],
  エアシフト: ["アカウント開設", "シフトボード連携"],
  インスタ広告: ["動画作成", "展開"],
  インフルエンサー: ["内容打ち合わせ", "展開"],
  "PR Times": ["投稿文作成", "入稿", "展開"],
  チラシ: ["デザイン作成", "入稿", "配布"],
  地元メディア掲載: ["内容打ち合わせ", "展開"],
  群ラボ: ["内容打ち合わせ", "展開"],
  社員採用準備: ["内容打ち合わせ", "文章作成"],
  社員面接: ["社員面接"],
  社員採用: ["社員採用"],
  アルバイト採用準備: ["内容打ち合わせ", "文章作成"],
  アルバイト面接: ["アルバイト面接"],
  アルバイト採用: ["アルバイト採用"],
  座学: ["どこで実施か", "誰に座学するのか", "何を教えるのか", "誰が研修するのか", "資料作成"],
  既存店舗での実務: ["どこで実施か", "誰が研修するのか"],
  設営: ["誰が設営参加か", "設営スケジュール"],
  新店舗での実務: ["新店舗での実務"],
}

export async function GET() {
  console.log("[v0] Webhook GET request received")
  return NextResponse.json({
    status: "ok",
    message: "Webhook endpoint is ready",
  })
}

export async function HEAD() {
  console.log("[v0] Webhook HEAD request received")
  return new Response(null, { status: 200 })
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    console.log("[v0] ===== Webhook受信 =====")
    console.log("[v0] アクションタイプ:", payload.action?.type)
    console.log("[v0] カード名:", payload.action?.data?.card?.name)
    console.log("[v0] ラベル情報:", payload.action?.data?.label)
    console.log("[v0] ========================")

    if (
      payload.action?.type === "addLabelToCard" &&
      payload.action?.data?.card?.name === "契約書作成" &&
      payload.action?.data?.label?.color === "green" &&
      payload.action?.data?.label?.name === "完了"
    ) {
      console.log("[v0] 契約書作成カードに完了ラベルが追加されました")

      const card = payload.action.data.card

      const cardDetailsResponse = await fetch(
        `https://api.trello.com/1/cards/${card.id}?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
      )

      if (!cardDetailsResponse.ok) {
        throw new Error("カード詳細の取得に失敗しました")
      }

      const cardDetails = await cardDetailsResponse.json()

      const listResponse = await fetch(
        `https://api.trello.com/1/lists/${cardDetails.idList}?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
      )

      if (!listResponse.ok) {
        throw new Error("リスト情報の取得に失敗しました")
      }

      const listData = await listResponse.json()
      const projectName = listData.name

      console.log("[v0] プロジェクト名:", projectName)

      console.log("[v0] 既存のボードを確認中...")
      const existingBoardsResponse = await fetch(
        `https://api.trello.com/1/members/me/boards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
      )

      if (!existingBoardsResponse.ok) {
        throw new Error("既存ボードの取得に失敗しました")
      }

      const existingBoards = await existingBoardsResponse.json()
      const duplicateBoard = existingBoards.find(
        (board: { name: string; closed: boolean }) => board.name === projectName && !board.closed,
      )

      if (duplicateBoard) {
        console.log(`[v0] ボード「${projectName}」は既に存在します。作成をスキップします。`)
        return NextResponse.json({
          success: false,
          message: `ボード「${projectName}」は既に存在するため、作成をスキップしました`,
          existingBoardId: duplicateBoard.id,
          existingBoardUrl: duplicateBoard.url,
        })
      }

      console.log(`[v0] ボード「${projectName}」は存在しないため、新規作成します`)
      // </CHANGE>

      const newBoardResponse = await fetch(
        `https://api.trello.com/1/boards/?name=${encodeURIComponent(projectName)}&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
        { method: "POST" },
      )

      if (!newBoardResponse.ok) {
        const errorText = await newBoardResponse.text()
        throw new Error(`新しいボードの作成に失敗しました: ${errorText}`)
      }

      const newBoard = await newBoardResponse.json()
      console.log("[v0] 新しいボード作成成功:", newBoard.id, newBoard.name)

      for (const memberId of DEFAULT_MEMBERS) {
        const addMemberResponse = await fetch(
          `https://api.trello.com/1/boards/${newBoard.id}/members/${memberId}?type=normal&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
          { method: "PUT" },
        )

        if (addMemberResponse.ok) {
          console.log(`[v0] メンバー追加成功: ${memberId}`)
        } else {
          console.error(`[v0] メンバー追加失敗: ${memberId}`)
        }
      }

      const boardListsResponse = await fetch(
        `https://api.trello.com/1/boards/${newBoard.id}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
      )

      if (boardListsResponse.ok) {
        const defaultLists = await boardListsResponse.json()
        for (const list of defaultLists) {
          await fetch(
            `https://api.trello.com/1/lists/${list.id}/closed?value=true&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
            { method: "PUT" },
          )
        }
        console.log("[v0] デフォルトリストをアーカイブしました")
      }

      let totalCardsCreated = 0

      for (const [listName, cardTitles] of Object.entries(LIST_CARDS)) {
        console.log(`[v0] リスト「${listName}」を作成中...`)

        const newListResponse = await fetch(
          `https://api.trello.com/1/lists?name=${encodeURIComponent(listName)}&idBoard=${newBoard.id}&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
          { method: "POST" },
        )

        if (!newListResponse.ok) {
          console.error(`[v0] リスト作成失敗: ${listName}`)
          continue
        }

        const newList = await newListResponse.json()
        console.log(`[v0] リスト作成成功: ${listName} (${newList.id})`)

        const labelColor = LIST_LABEL_COLORS[listName]

        for (const title of cardTitles) {
          const newCardResponse = await fetch(
            `https://api.trello.com/1/cards?idList=${newList.id}&name=${encodeURIComponent(title)}&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
            { method: "POST" },
          )

          if (newCardResponse.ok) {
            const newCard = await newCardResponse.json()
            totalCardsCreated++
            console.log(`[v0] カード作成成功: ${title}`)

            if (labelColor) {
              const labelResponse = await fetch(
                `https://api.trello.com/1/cards/${newCard.id}/labels?color=${labelColor}&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
                { method: "POST" },
              )

              if (labelResponse.ok) {
                console.log(`[v0] ラベル付与成功: ${title} → ${labelColor}`)
              }
            }

            const checklistItems = CARD_CHECKLISTS[title]
            if (checklistItems && checklistItems.length > 0) {
              const checklistResponse = await fetch(
                `https://api.trello.com/1/checklists?idCard=${newCard.id}&name=タスク&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
                { method: "POST" },
              )

              if (checklistResponse.ok) {
                const checklist = await checklistResponse.json()

                for (const item of checklistItems) {
                  await fetch(
                    `https://api.trello.com/1/checklists/${checklist.id}/checkItems?name=${encodeURIComponent(item)}&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
                    { method: "POST" },
                  )
                }
                console.log(`[v0] チェックリスト追加成功: ${title}`)
              }
            }
          } else {
            console.error(`[v0] カード作成失敗: ${title}`)
          }
        }
      }

      console.log(`[v0] ボード「${projectName}」に合計${totalCardsCreated}枚のカードを作成しました`)

      return NextResponse.json({
        success: true,
        message: `新しいボード「${projectName}」を作成し、${totalCardsCreated}枚のカードを作成しました`,
        newBoardId: newBoard.id,
        newBoardUrl: newBoard.url,
        createdCardsCount: totalCardsCreated,
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
