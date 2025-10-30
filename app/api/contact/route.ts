import { NextResponse } from "next/server"
import { z } from "zod"

const contactSchema = z.object({
  email: z.string().email(),
  message: z.string().min(10).max(2000),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, message } = contactSchema.parse(body)

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error("RESEND_API_KEY is not configured")
      return NextResponse.json({ error: "Email service not configured." }, { status: 500 })
    }

    const fromAddress = process.env.SUPPORT_FROM_EMAIL || "Typeracing Support <support@send.shivee.biz>"
    const supportInbox = process.env.SUPPORT_INBOX || "de.erdene@yahoo.com"

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [supportInbox],
        reply_to: email,
        subject: "New Typeracing support message",
        text: `From: ${email}\n\n${message}`,
      }),
    })

    if (!emailResponse.ok) {
      const errorBody = await emailResponse.text()
      console.error("Failed to send contact email:", emailResponse.status, errorBody)
      return NextResponse.json({ error: "Failed to send message." }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 })
    }

    console.error("Unexpected contact form error:", error)
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 })
  }
}
