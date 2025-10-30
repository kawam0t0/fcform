"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Loader2, CheckCircle2, Paperclip } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ProjectForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    projectName: "",
    siteUrl: "",
    tsuboArea: "",
    clientCompany: "",
  })

  const [files, setFiles] = useState<{
    file1: File | null
    file2: File | null
    file3: File | null
    file4: File | null
  }>({
    file1: null,
    file2: null,
    file3: null,
    file4: null,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileKey: keyof typeof files) => {
    const file = e.target.files?.[0] || null
    setFiles((prev) => ({ ...prev, [fileKey]: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    if (!formData.projectName || !formData.siteUrl || !formData.tsuboArea) {
      toast({
        title: "エラー",
        description: "必須項目をすべて入力してください",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("projectName", formData.projectName)
      formDataToSend.append("siteUrl", formData.siteUrl)
      formDataToSend.append("tsuboArea", formData.tsuboArea)
      formDataToSend.append("clientCompany", formData.clientCompany)

      if (files.file1) formDataToSend.append("file1", files.file1)
      if (files.file2) formDataToSend.append("file2", files.file2)
      if (files.file3) formDataToSend.append("file3", files.file3)
      if (files.file4) formDataToSend.append("file4", files.file4)

      const response = await fetch("/api/trello", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error("送信に失敗しました")
      }

      setIsSuccess(true)
      toast({
        title: "成功",
        description: "プロジェクトがTrelloに登録されました",
      })

      // フォームをリセット
      setTimeout(() => {
        setFormData({ projectName: "", siteUrl: "", tsuboArea: "", clientCompany: "" })
        setFiles({ file1: null, file2: null, file3: null, file4: null })
        setIsSuccess(false)
      }, 2000)
    } catch (error) {
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "送信に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* プロジェクト名 */}
          <div className="space-y-2">
            <Label htmlFor="projectName" className="text-base font-semibold">
              プロジェクト名 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="projectName"
              name="projectName"
              type="text"
              placeholder="例：渋谷オフィスビル開発"
              value={formData.projectName}
              onChange={handleInputChange}
              required
              className="h-12 text-base border-2 focus:border-primary"
            />
          </div>

          {/* 候補地URL */}
          <div className="space-y-2">
            <Label htmlFor="siteUrl" className="text-base font-semibold">
              候補地URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="siteUrl"
              name="siteUrl"
              type="url"
              placeholder="https://example.com/location"
              value={formData.siteUrl}
              onChange={handleInputChange}
              required
              className="h-12 text-base border-2 focus:border-primary"
            />
          </div>

          {/* 坪数 */}
          <div className="space-y-2">
            <Label htmlFor="tsuboArea" className="text-base font-semibold">
              坪数 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tsuboArea"
              name="tsuboArea"
              type="number"
              placeholder="例：150"
              value={formData.tsuboArea}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="h-12 text-base border-2 focus:border-primary"
            />
          </div>

          {/* 取引先企業 */}
          <div className="space-y-2">
            <Label htmlFor="clientCompany" className="text-base font-semibold">
              取引先企業
            </Label>
            <Input
              id="clientCompany"
              name="clientCompany"
              type="text"
              placeholder="例：株式会社サンプル"
              value={formData.clientCompany}
              onChange={handleInputChange}
              className="h-12 text-base border-2 focus:border-primary"
            />
          </div>

          {/* 添付資料 */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold">添付資料</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[1, 2, 3, 4].map((num) => {
                const fileKey = `file${num}` as keyof typeof files
                const currentFile = files[fileKey]

                return (
                  <label
                    key={num}
                    htmlFor={`file${num}`}
                    className="group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg bg-card p-6 shadow-md transition-all hover:shadow-lg hover:scale-[1.02] border border-border"
                  >
                    <input
                      id={`file${num}`}
                      type="file"
                      onChange={(e) => handleFileChange(e, fileKey)}
                      className="sr-only"
                    />
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                      {currentFile ? (
                        <Paperclip className="h-7 w-7 text-primary" />
                      ) : (
                        <Upload className="h-7 w-7 text-primary" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-foreground">添付資料{num}</p>
                      {currentFile ? (
                        <p className="mt-1 text-xs text-primary font-medium truncate max-w-[150px]">
                          {currentFile.name}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-muted-foreground">タップして選択</p>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* 送信ボタン */}
          <Button
            type="submit"
            disabled={isSubmitting || isSuccess}
            className="h-14 w-full text-base font-semibold shadow-md hover:shadow-lg transition-all"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                送信中...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                登録完了
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Trelloに登録
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
