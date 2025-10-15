import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const paystackResponse = await fetch(
      'https://api.paystack.co/bank',
      {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY}`
        }
      }
    );

    const data = await paystackResponse.json();
    
    if (data.status) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { error: data.message || 'Failed to fetch banks' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Banks fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}