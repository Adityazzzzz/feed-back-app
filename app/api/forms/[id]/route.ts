import { type NextRequest, NextResponse } from "next/server"
import { forms, verifyToken } from "@/lib/data-store"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.split(" ")[1]
  const user = token ? verifyToken(token) : null

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const form = forms.find((f) => f.id === params.id && f.userId === user.userId)
  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 })
  }

  return NextResponse.json({ form })
}
