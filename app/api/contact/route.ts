import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

type ContactEntry = {
  name: string
  email: string
  subject: string
  message: string
  receivedAt: string
}

const DATA_DIR = path.resolve(process.cwd(), 'data')
const FILE = path.join(DATA_DIR, 'contact-messages.ndjson')

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (err) {
    // ignore
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { name, email, subject, message, hp } = body as any

    // basic spam/honeypot check
    if (hp) return NextResponse.json({ ok: false, error: 'spam' }, { status: 400 })

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
    }

    const entry: ContactEntry = {
      name: String(name).slice(0, 200),
      email: String(email).slice(0, 200),
      subject: String(subject).slice(0, 500),
      message: String(message).slice(0, 5000),
      receivedAt: new Date().toISOString(),
    }

    await ensureDataDir()
    // append as ndjson
    await fs.appendFile(FILE, JSON.stringify(entry) + '\n')

    // attempt to send email if SMTP is configured
    let emailSent = false
    let mailError: string | null = null
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      try {
  const nodemailer = await import('nodemailer')
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
          secure: (process.env.SMTP_SECURE === 'true') || false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        })
        // verify connection/auth before sending to get a clear error earlier
        try {
          await transporter.verify()
        } catch (verifyErr: any) {
          mailError = `verify failed: ${String(verifyErr?.message || verifyErr)}`
          console.error('SMTP verify failed:', verifyErr)
        }

        if (!mailError) {
          const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: 'partnership@connectvelo.com',
            subject: `New message: ${entry.subject}`,
            text: `${entry.message}\n\nFrom: ${entry.name} <${entry.email}>`,
            replyTo: entry.email,
          })
          emailSent = true
          console.log('Contact email sent:', info)
        }
      } catch (mailErr: any) {
        mailError = String(mailErr?.message || mailErr)
        console.error('Failed to send contact email:', mailErr)
        // continue — we already saved the message to disk
      }
    }

    return NextResponse.json({ ok: true, emailSent, mailError }, { status: 201 })
  } catch (err) {
    console.error('contact POST error', err)
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}

