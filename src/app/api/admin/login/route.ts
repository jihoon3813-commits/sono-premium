import { NextResponse } from 'next/server';
import { validateAdminCredentials } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: '이메일과 비밀번호를 입력해주세요.' },
                { status: 400 }
            );
        }

        const result = await validateAdminCredentials(email, password);

        if (!result.valid) {
            return NextResponse.json(
                { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
                { status: 401 }
            );
        }

        // 세션에 저장할 관리자 정보
        const adminSession = {
            email,
            role: result.role,
            loginAt: new Date().toISOString(),
        };

        return NextResponse.json({
            success: true,
            admin: adminSession,
        });
    } catch (error) {
        console.error('Admin login error:', error);

        if (error instanceof Error && error.message.includes('환경변수')) {
            return NextResponse.json(
                { success: false, message: 'Google Sheets 연결이 설정되지 않았습니다.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: false, message: '로그인 처리 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
