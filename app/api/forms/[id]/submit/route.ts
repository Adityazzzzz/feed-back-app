import { type NextRequest, NextResponse } from "next/server"
import { forms } from "@/lib/data-store"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { answers } = await request.json()

    const form = forms.find((f) => f.id === params.id && f.isActive)
    if (!form) {
      return NextResponse.json({ error: "Form not found or not active" }, { status: 404 })
    }

    // Validate required questions
    const missingAnswers = form.questions.filter((q) => q.required && !answers[q.id]?.trim())

    if (missingAnswers.length > 0) {
      return NextResponse.json({ error: "Please answer all required questions" }, { status: 400 })
    }

    // Create response
    const response = {
      id: Date.now().toString(),
      answers,
      submittedAt: new Date().toISOString(),
    }

    form.responses.push(response)

    return NextResponse.json({
      message: "Response submitted successfully",
    })
  } catch (error) {
    console.error("Response submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
