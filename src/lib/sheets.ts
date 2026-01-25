// Google Sheets API 유틸리티
// 실제 구현 시 google-spreadsheet 패키지 또는 Google Sheets API를 사용합니다.

import { GoogleSheetsConfig, Partner, Application, PartnerRequest } from './types';

// 설정 (환경변수에서 가져옴)
export const sheetsConfig: GoogleSheetsConfig = {
    spreadsheetId: process.env.GOOGLE_SHEETS_ID || '',
    credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
    },
};

// 시트 이름
export const SHEET_NAMES = {
    PARTNERS: 'partners',
    APPLICATIONS: 'applications',
    STATUS_HISTORY: 'status_history',
    SETTLEMENTS: 'settlements',
    ADMINS: 'admins',
    PARTNER_REQUESTS: 'partner_requests',
};

// 신청번호 생성
export function generateApplicationNo(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `SA-${dateStr}-${random}`;
}

// 파트너 ID 생성
export function generatePartnerId(companyName: string): string {
    // 회사명을 기반으로 URL-friendly한 ID 생성
    const base = companyName
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]/g, '')
        .slice(0, 20);
    const random = Math.random().toString(36).slice(2, 6);
    return `${base}-${random}`;
}

// 임시 비밀번호 생성
export function generateTempPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// 데모용 메모리 저장소 (실제 구현 시 Google Sheets API로 대체)
class InMemoryStore {
    private partners: Partner[] = [
        {
            partnerId: 'demo',
            companyName: '데모 쇼핑몰',
            businessNumber: '123-45-67890',
            ceoName: '홍길동',
            managerName: '김데모',
            managerPhone: '010-1234-5678',
            managerEmail: 'demo@example.com',
            shopUrl: 'https://demo-mall.com',
            shopType: '폐쇄형회원제',
            memberCount: '10000',
            customUrl: 'demo',
            logoUrl: '',
            pointInfo: '계약 시 최대 30만 포인트 지급',
            brandColor: '#1e3a5f',
            loginId: 'demo',
            loginPassword: 'demo1234', // 실제로는 해시화
            status: 'active',
            createdAt: '2026-01-01',
            approvedAt: '2026-01-01',
            approvedBy: 'admin',
        },
        {
            partnerId: 'abc-mall',
            companyName: 'ABC쇼핑몰',
            businessNumber: '234-56-78901',
            ceoName: '이철수',
            managerName: '박영희',
            managerPhone: '010-2222-3333',
            managerEmail: 'abc@example.com',
            shopUrl: 'https://abc-mall.com',
            shopType: '기업복지몰',
            memberCount: '50000',
            customUrl: 'abc-mall',
            logoUrl: '',
            pointInfo: '계약 시 최대 20만 포인트 지급',
            brandColor: '#2563eb',
            loginId: 'abc-mall',
            loginPassword: 'abc1234',
            status: 'active',
            createdAt: '2026-01-10',
            approvedAt: '2026-01-15',
            approvedBy: 'admin',
        },
    ];

    private applications: Application[] = [];
    private partnerRequests: PartnerRequest[] = [];

    // Partners
    getPartners(): Partner[] {
        return this.partners;
    }

    getPartnerById(partnerId: string): Partner | undefined {
        return this.partners.find(p => p.partnerId === partnerId);
    }

    getPartnerByLoginId(loginId: string): Partner | undefined {
        return this.partners.find(p => p.loginId === loginId);
    }

    addPartner(partner: Partner): void {
        this.partners.push(partner);
    }

    updatePartner(partnerId: string, updates: Partial<Partner>): void {
        const index = this.partners.findIndex(p => p.partnerId === partnerId);
        if (index !== -1) {
            this.partners[index] = { ...this.partners[index], ...updates };
        }
    }

    // Applications
    getApplications(): Application[] {
        return this.applications;
    }

    getApplicationsByPartnerId(partnerId: string): Application[] {
        return this.applications.filter(a => a.partnerId === partnerId);
    }

    getApplicationByNo(applicationNo: string): Application | undefined {
        return this.applications.find(a => a.applicationNo === applicationNo);
    }

    addApplication(application: Application): void {
        this.applications.push(application);
    }

    updateApplication(applicationNo: string, updates: Partial<Application>): void {
        const index = this.applications.findIndex(a => a.applicationNo === applicationNo);
        if (index !== -1) {
            this.applications[index] = { ...this.applications[index], ...updates };
        }
    }

    // Partner Requests
    getPartnerRequests(): PartnerRequest[] {
        return this.partnerRequests;
    }

    addPartnerRequest(request: PartnerRequest): void {
        this.partnerRequests.push(request);
    }

    updatePartnerRequest(requestId: string, updates: Partial<PartnerRequest>): void {
        const index = this.partnerRequests.findIndex(r => r.requestId === requestId);
        if (index !== -1) {
            this.partnerRequests[index] = { ...this.partnerRequests[index], ...updates };
        }
    }

    removePartnerRequest(requestId: string): void {
        this.partnerRequests = this.partnerRequests.filter(r => r.requestId !== requestId);
    }
}

// 글로벌 인스턴스
export const store = new InMemoryStore();

// Admin 인증 (데모용)
export function validateAdmin(email: string, password: string): boolean {
    // 데모용 하드코딩 (실제로는 Google Sheets에서 확인)
    return email === 'admin@sono.com' && password === 'admin1234';
}

// Partner 인증
export function validatePartner(loginId: string, password: string): Partner | null {
    const partner = store.getPartnerByLoginId(loginId);
    if (partner && partner.loginPassword === password && partner.status === 'active') {
        return partner;
    }
    return null;
}
