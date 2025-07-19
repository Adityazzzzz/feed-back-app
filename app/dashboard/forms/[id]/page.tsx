"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, ArrowLeft, Share2, Eye, Download, BarChart3 } from "lucide-react"

interface FormData {
  id: string
  title: string
  description: string
  questions: Array<{
    id: string
    text: string
    type: string
    options?: string[]
  }>
  responses: Array<{
    id: string
    answers: Record<string, any>
    submittedAt: string
  }>
  createdAt: string
  isActive: boolean
}

export default function FormDetailsPage({ params }: { params: { id: string } }) {
  const [form, setForm] = useState<FormData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
      return
    }

    fetchForm()
  }, [params.id, router])

  const fetchForm = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/forms/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setForm(data.form)
      } else {
        setError("Form not found")
      }
    } catch (error) {
      setError("Error loading form")
    } finally {
      setLoading(false)
    }
  }

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/form/${params.id}`
    navigator.clipboard.writeText(shareUrl)
    // Add toast notification here
    alert("Share link copied to clipboard!") // Simple alert for demo
  }

  const exportResponses = () => {
    if (!form || form.responses.length === 0) return

    const headers = ["Submitted At", ...form.questions.map((q) => q.text)]
    const rows = form.responses.map((response) => [
      new Date(response.submittedAt).toLocaleString(),
      ...form.questions.map((q) => response.answers[q.id] || ""),
    ])

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${form.title}-responses.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading form details...</p>
        </div>
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md shadow-sm">
          <CardContent className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Form not found</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link href="/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white focus-ring">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="focus-ring">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{form.title}</h1>
                <p className="text-sm text-gray-600">{form.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={form.isActive ? "default" : "secondary"}>{form.isActive ? "Active" : "Inactive"}</Badge>
              <Button variant="outline" onClick={copyShareLink} className="focus-ring bg-transparent">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Link href={`/form/${form.id}`} target="_blank">
                <Button variant="outline" className="focus-ring bg-transparent">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{form.responses.length}</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Questions</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{form.questions.length}</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Created</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">{new Date(form.createdAt).toLocaleDateString()}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="responses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="responses">Responses ({form.responses.length})</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="responses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Form Responses</h3>
              {form.responses.length > 0 && (
                <Button onClick={exportResponses} variant="outline" className="focus-ring bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>

            {form.responses.length === 0 ? (
              <Card className="text-center py-12 shadow-sm">
                <CardContent>
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No responses yet</h3>
                  <p className="text-gray-600 mb-4">Share your form to start collecting feedback.</p>
                  <Button onClick={copyShareLink} className="bg-blue-600 hover:bg-blue-700 text-white focus-ring">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Form
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {form.responses.map((response, index) => (
                  <Card key={response.id} className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">Response #{index + 1}</CardTitle>
                      <CardDescription>Submitted on {new Date(response.submittedAt).toLocaleString()}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {form.questions.map((question) => (
                        <div key={question.id}>
                          <h4 className="font-medium text-sm text-gray-700 mb-1">{question.text}</h4>
                          <p className="text-gray-900">{response.answers[question.id] || "No answer"}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <h3 className="text-lg font-semibold">Form Questions</h3>
            <div className="space-y-4">
              {form.questions.map((question, index) => (
                <Card key={question.id} className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Question {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium mb-2">{question.text}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Type: {question.type}</span>
                      {question.options && <span>Options: {question.options.join(", ")}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
