#!/usr/bin/env node
/*
  Simple test script to send a single test email using the project's SMTP env vars.
  Usage:
    node scripts/send-test-email.js
  Make sure to run `npm install nodemailer` and set `.env.local` before running.
*/
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function main() {
  try {
    // dynamic import so script doesn't fail when nodemailer isn't installed yet
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

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: 'partnership@connectvelo.com',
      subject: 'VELO dev: SMTP test message',
      text: 'This is a test message from your local VELO dev environment.',
    })

    console.log('Test message sent:', info?.messageId || info)
  } catch (err) {
    console.error('Failed to send test message:', err)
    process.exitCode = 1
  }
}

main()
