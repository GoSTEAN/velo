import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      },
    });

    await transporter.sendMail({
      from: email,
      to: 'obedsmart2021@gmail.com',
      subject: `New message from ${name}: ${subject}`,
      text: message,
      html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message}</p>`,
    });

    return NextResponse.json({ message: 'Message sent successfully!' });
  } catch (error: any) {
    console.error('Detailed mail error:', error);
    return NextResponse.json(
      { message: 'Failed to send message.' },
      { status: 500 }
    );
  }
}
