import { ProjectForm } from "@/components/project-form"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">プロジェクト登録</h1>
          <p className="mt-2 text-muted-foreground">新規プロジェクトの情報を入力してください</p>
        </div>
        <ProjectForm />
      </div>
    </main>
  )
}
