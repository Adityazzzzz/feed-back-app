import { type NextRequest, NextResponse } from "next/server"
import { forms, verifyToken } from "@/lib/data-store"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.split(" ")[1]
  const user = token ? verifyToken(token) : null

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userForms = forms
    .filter((form) => form.userId === user.userId)
    .map((form) => ({
      ...form,
      responses: form.responses.length, // Return only count for dashboard view
    }))

  return NextResponse.json({ forms: userForms })
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.split(" ")[1]
  const user = token ? verifyToken(token) : null

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { title, description, questions } = await request.json()

    // Validation
    if (!title || !questions || questions.length === 0) {
      return NextResponse.json({ error: "Title and questions are required" }, { status: 400 })
    }

    if (questions.length > 5) {
      return NextResponse.json({ error: "Maximum 5 questions allowed" }, { status: 400 })
    }

    // Create form
    const form = {
      id: Date.now().toString(),
      userId: user.userId,
      title: title.trim(),
      description: description?.trim() || "",
      questions: questions.map((q: any, index: number) => ({
        id: `q${index + 1}`, // Assign a simple ID for questions
        text: q.text.trim(),
        type: q.type,
        options: q.options?.filter((opt: string) => opt.trim()) || [],
        required: q.required !== false,
      })),
      responses: [],
      createdAt: new Date().toISOString(),
      isActive: true, // Forms are active by default
    }

    forms.push(form)

    return NextResponse.json({
      message: "Form created successfully",
      form: {
        ...form,
        responses: 0, // Return 0 responses for new form
      },
    })
  } catch (error) {
    console.error("Form creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
