import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// 시트 이름 상수
export const SHEET_NAMES = {
    PARTNERS: 'partners',
    APPLICATIONS: 'applications',
    STATUS_HISTORY: 'status_history',
    SETTLEMENTS: 'settlements',
    ADMINS: 'admins',
    PARTNER_REQUESTS: 'partner_requests',
} as const;

// 시트별 헤더 정의
export const SHEET_HEADERS = {
    [SHEET_NAMES.PARTNERS]: [
        'partner_id',
        'company_name',
        'business_number',
        'ceo_name',
        'manager_name',
        'manager_phone',
        'manager_email',
        'shop_url',
        'shop_type',
        'member_count',
        'custom_url',
        'logo_url',
        'logo_text',
        'landing_title',
        'point_info',
        'brand_color',
        'login_id',
        'login_password',
        'status',
        'parent_partner_id',
        'parent_partner_name',
        'created_at',
        'approved_at',
        'approved_by',
    ],
    [SHEET_NAMES.APPLICATIONS]: [
        'application_no',
        'partner_id',
        'partner_name',
        'product_type',
        'plan_type',
        'products',
        'customer_name',
        'customer_birth',
        'customer_gender',
        'customer_phone',
        'customer_email',
        'customer_address',
        'customer_zipcode',
        'partner_member_id',
        'preferred_contact_time',
        'inquiry',
        'status',
        'assigned_to',
        'created_at',
        'updated_at',
        'contract_date',
        'delivery_date',
        'settlement_date',
    ],
    [SHEET_NAMES.STATUS_HISTORY]: [
        'history_id',
        'application_no',
        'previous_status',
        'new_status',
        'changed_by',
        'changed_at',
        'memo',
    ],
    [SHEET_NAMES.SETTLEMENTS]: [
        'settlement_id',
        'partner_id',
        'settlement_month',
        'contract_count',
        'total_amount',
        'commission_rate',
        'deduction',
        'net_amount',
        'settlement_date',
        'status',
        'created_at',
    ],
    [SHEET_NAMES.ADMINS]: [
        'admin_id',
        'admin_name',
        'email',
        'password',
        'role',
        'created_at',
        'last_login',
    ],
    [SHEET_NAMES.PARTNER_REQUESTS]: [
        'request_id',
        'company_name',
        'business_number',
        'ceo_name',
        'company_address',
        'company_phone',
        'manager_name',
        'manager_department',
        'manager_phone',
        'manager_email',
        'shop_type',
        'shop_url',
        'monthly_visitors',
        'member_count',
        'main_products',
        'expected_monthly_sales',
        'point_rate',
        'additional_request',
        'parent_partner_id',
        'parent_partner_name',
        'status',
        'created_at',
        'reviewed_by',
        'reviewed_at',
    ],
};

// 환경변수에서 설정 가져오기
function getCredentials() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const sheetId = process.env.GOOGLE_SHEETS_ID;

    if (!email || !privateKey || !sheetId) {
        throw new Error('Google Sheets API 환경변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.');
    }

    return { email, privateKey, sheetId };
}

// JWT 인증 객체 생성
function createJWT() {
    const { email, privateKey } = getCredentials();

    return new JWT({
        email,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
}

// Google Spreadsheet 인스턴스 가져오기
let docInstance: GoogleSpreadsheet | null = null;

export async function getSpreadsheet(): Promise<GoogleSpreadsheet> {
    const { sheetId } = getCredentials();
    const jwt = createJWT();

    // 항상 최신 상태 로드 (덮어쓰기 방지)
    const doc = new GoogleSpreadsheet(sheetId, jwt);
    await doc.loadInfo();

    return doc;
}

// 시트 가져오기 (없으면 생성)
export async function getOrCreateSheet(
    sheetName: string
): Promise<GoogleSpreadsheetWorksheet> {
    const doc = await getSpreadsheet();

    let sheet = doc.sheetsByTitle[sheetName];

    if (!sheet) {
        // 시트가 없으면 새로 생성
        const headers = SHEET_HEADERS[sheetName as keyof typeof SHEET_HEADERS];
        sheet = await doc.addSheet({
            title: sheetName,
            headerValues: headers,
        });
        console.log(`시트 생성됨: ${sheetName}`);
    } else {
        // 기존 시트 로드 시 헤더 정보 로드
        await sheet.loadHeaderRow();

        // 새로 추가된 헤더가 있는지 확인하고 동기화 (헤더 수가 늘어난 경우에만)
        const definedHeaders = SHEET_HEADERS[sheetName as keyof typeof SHEET_HEADERS];
        if (definedHeaders && sheet.headerValues.length < definedHeaders.length) {
            console.log(`헤더 동기화 진행 중: ${sheetName}`);
            await sheet.setHeaderRow(definedHeaders);
        }
    }

    return sheet;
}

// 모든 시트 초기화 (최초 1회 실행 필요)
export async function initializeSheets(): Promise<void> {
    console.log('Google Sheets 초기화 시작...');

    for (const sheetName of Object.values(SHEET_NAMES)) {
        await getOrCreateSheet(sheetName);
        console.log(`✓ ${sheetName} 시트 준비 완료`);
    }

    console.log('Google Sheets 초기화 완료!');
}

// 행 데이터를 객체로 변환
export function rowToObject<T>(row: Record<string, unknown>, headers: string[]): T {
    const obj: Record<string, unknown> = {};
    for (const header of headers) {
        obj[header] = row[header] || '';
    }
    return obj as T;
}

// 객체를 행 데이터로 변환 (카멜케이스 -> 스네이크케이스)
export function objectToRow(obj: Record<string, unknown>): Record<string, unknown> {
    const row: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
        // 카멜케이스를 스네이크케이스로 변환
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        row[snakeKey] = value ?? '';
    }
    return row;
}

// 스네이크케이스를 카멜케이스로 변환
export function snakeToCamel(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        result[camelKey] = value;
    }
    return result;
}
