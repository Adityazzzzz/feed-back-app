import { type NextRequest, NextResponse } from "next/server"
import { forms } from "@/lib/data-store"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const form = forms.find((f) => f.id === params.id && f.isActive)
  if (!form) {
    return NextResponse.json({ error: "Form not found or not active" }, { status: 404 })
  }

  // Return form without sensitive data (like responses) for public access
  const publicForm = {
    id: form.id,
    title: form.title,
    description: form.description,
    questions: form.questions,
  }

  return NextResponse.json({ form: publicForm })
}
