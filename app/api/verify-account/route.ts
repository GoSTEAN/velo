
//api/verify-account/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { accountNumber, bankCode } = await request.json();

    // Validate input
    if (!accountNumber || !bankCode) {
      return NextResponse.json(
        { error: 'Account number and bank code are required' },
        { status: 400 }
      );
    }

    //removing spaces from account number
    const cleanAccountNumber = accountNumber.replace(/\s/g, '');

    // Making request to Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${cleanAccountNumber}&bank_code=${bankCode}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY}`
        }
      }
    );

    const data = await paystackResponse.json();
    if (data.status) {
      return NextResponse.json(data.data);
    } else {
      return NextResponse.json(
        { error: data.message || 'Verification failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}