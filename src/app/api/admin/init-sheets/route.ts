import { NextResponse } from 'next/server';
import { initializeSheets, getOrCreateSheet, SHEET_NAMES } from '@/lib/google-sheets';

// 시트 초기화 API (최초 1회 실행)
export async function POST() {
    try {
        await initializeSheets();

        // 기본 관리자 계정 생성
        const adminSheet = await getOrCreateSheet(SHEET_NAMES.ADMINS);
        const rows = await adminSheet.getRows();

        if (rows.length === 0) {
            await adminSheet.addRow({
                admin_id: 'ADMIN-001',
                admin_name: '슈퍼관리자',
                email: 'admin@sono.com',
                password: 'admin1234', // 실제로는 해시화 필요
                role: 'super',
                created_at: new Date().toISOString(),
                last_login: '',
            });
            console.log('기본 관리자 계정 생성됨');
        }

        // 데모 파트너 생성
        const partnerSheet = await getOrCreateSheet(SHEET_NAMES.PARTNERS);
        const partnerRows = await partnerSheet.getRows();

        if (partnerRows.length === 0) {
            await partnerSheet.addRow({
                partner_id: 'P-DEMO-001',
                company_name: '데모 쇼핑몰',
                business_number: '123-45-67890',
                ceo_name: '홍길동',
                manager_name: '김데모',
                manager_phone: '010-1234-5678',
                manager_email: 'demo@example.com',
                shop_url: 'https://demo-mall.com',
                shop_type: '폐쇄형회원제',
                member_count: '10000',
                custom_url: 'demo',
                logo_url: '',
                point_info: '계약 시 최대 30만 포인트 지급',
                brand_color: '#1e3a5f',
                login_id: 'demo',
                login_password: 'demo1234',
                status: 'active',
                created_at: new Date().toISOString(),
                approved_at: new Date().toISOString(),
                approved_by: 'system',
            });
            console.log('데모 파트너 계정 생성됨');
        }

        return NextResponse.json({
            success: true,
            message: 'Google Sheets 초기화가 완료되었습니다.',
        });
    } catch (error) {
        console.error('Sheets initialization error:', error);

        if (error instanceof Error) {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: false, message: '시트 초기화 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

// 시트 상태 확인
export async function GET() {
    try {
        const adminSheet = await getOrCreateSheet(SHEET_NAMES.ADMINS);
        const partnerSheet = await getOrCreateSheet(SHEET_NAMES.PARTNERS);
        const applicationSheet = await getOrCreateSheet(SHEET_NAMES.APPLICATIONS);

        const adminRows = await adminSheet.getRows();
        const partnerRows = await partnerSheet.getRows();
        const applicationRows = await applicationSheet.getRows();

        return NextResponse.json({
            success: true,
            data: {
                admins: adminRows.length,
                partners: partnerRows.length,
                applications: applicationRows.length,
                sheets: Object.values(SHEET_NAMES),
            },
        });
    } catch (error) {
        console.error('Sheets status error:', error);

        if (error instanceof Error) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message,
                    hint: 'Google Sheets API 설정을 확인하세요.'
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: false, message: '시트 상태 확인 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
