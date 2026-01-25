import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        success: true,
        message: 'API is working',
        time: new Date().toISOString(),
        env: {
            hasEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            hasKey: !!process.env.GOOGLE_PRIVATE_KEY,
            hasSheetId: !!process.env.GOOGLE_SHEETS_ID
        }
    });
}
