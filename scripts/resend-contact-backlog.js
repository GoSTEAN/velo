#!/usr/bin/env node
/*
  Resend saved contact messages from data/contact-messages.ndjson to the configured SMTP.
  Use this after you configure production SMTP creds to forward the backlog.

  Usage:
    node scripts/resend-contact-backlog.js

  Make sure to install nodemailer and set `.env.local` before running.
*/
import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function main() {
  const dataFile = path.resolve(process.cwd(), 'data', 'contact-messages.ndjson')
  try {
    const content = await fs.readFile(dataFile, 'utf-8')
    const lines = content.split(/\n/).filter(Boolean)
    if (!lines.length) {
      console.log('No messages to resend.')
      return
    }

    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    for (const line of lines) {
      try {
        const entry = JSON.parse(line)
        const info = await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: 'partnership@connectvelo.com',
          subject: `Resent message: ${entry.subject}`,
          text: `${entry.message}\n\nFrom: ${entry.name} <${entry.email}>\nReceivedAt: ${entry.receivedAt}`,
        })
        console.log('Resent:', info?.messageId || info)
      } catch (err) {
        console.error('Failed to resend one message:', err)
      }
    }
  } catch (err) {
    console.error('Error reading backlog file:', err)
  }
}

main()
