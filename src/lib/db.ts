import {
    getOrCreateSheet,
    SHEET_NAMES,
    snakeToCamel,
} from './google-sheets';
import { Partner, Application, PartnerRequest, ApplicationStatus } from './types';

// ============================================
// 파트너 관련 함수
// ============================================

export async function getAllPartners(): Promise<Partner[]> {
    const sheet = await getOrCreateSheet(SHEET_NAMES.PARTNERS);
    const rows = await sheet.getRows();

    return rows.map(row => {
        const obj = snakeToCamel(row.toObject());
        return obj as unknown as Partner;
    });
}

export async function getPartnerById(partnerId: string): Promise<Partner | null> {
    const sheet = await getOrCreateSheet(SHEET_NAMES.PARTNERS);
    const rows = await sheet.getRows();

    const row = rows.find(r => r.get('partner_id') === partnerId);
    if (!row) return null;

    return snakeToCamel(row.toObject()) as unknown as Partner;
}

export async function getPartnerByLoginId(loginId: string): Promise<Partner | null> {
    const sheet = await getOrCreateSheet(SHEET_NAMES.PARTNERS);
    const rows = await sheet.getRows();

    const row = rows.find(r => r.get('login_id') === loginId);
    if (!row) return null;

    return snakeToCamel(row.toObject()) as unknown as Partner;
}

export async function getPartnerByCustomUrl(customUrl: string): Promise<Partner | null> {
    const sheet = await getOrCreateSheet(SHEET_NAMES.PARTNERS);
    const rows = await sheet.getRows();

    const row = rows.find(r => r.get('custom_url') === customUrl);
    if (!row) return null;

    return snakeToCamel(row.toObject()) as unknown as Partner;
}

export async function createPartner(partner: Omit<Partner, 'partnerId' | 'createdAt'>): Promise<Partner> {
    const sheet = await getOrCreateSheet(SHEET_NAMES.PARTNERS);

    // 파트너 ID 생성
    const partnerId = `P-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const newPartner = {
        partner_id: partnerId,
        company_name: partner.companyName,
        business_number: partner.businessNumber,
        ceo_name: partner.ceoName,
        manager_name: partner.managerName,
        manager_phone: partner.managerPhone,
        manager_email: partner.managerEmail,
        shop_url: partner.shopUrl,
        shop_type: partner.shopType,
        member_count: partner.memberCount,
        custom_url: partner.customUrl,
        logo_url: partner.logoUrl || '',
        point_info: partner.pointInfo,
        brand_color: partner.brandColor || '#1e3a5f',
        login_id: partner.loginId,
        login_password: partner.loginPassword,
        status: partner.status,
        parent_partner_id: partner.parentPartnerId || '',
        parent_partner_name: partner.parentPartnerName || '',
        created_at: createdAt,
        approved_at: partner.approvedAt || '',
        approved_by: partner.approvedBy || '',
    };

    await sheet.addRow(newPartner, { insert: true });

    return { ...partner, partnerId } as Partner;
}

export async function updatePartner(
    partnerId: string,
    updates: Partial<Partner>
): Promise<boolean> {
    const sheet = await getOrCreateSheet(SHEET_NAMES.PARTNERS);
    const rows = await sheet.getRows();

    const row = rows.find(r => r.get('partner_id') === partnerId);
    if (!row) return false;

    // 업데이트할 필드들 설정
    for (const [key, value] of Object.entries(updates)) {
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        row.set(snakeKey, value);
    }

    await row.save();
    return true;
}

export async function deletePartner(partnerId: string): Promise<boolean> {
    const sheet = await getOrCreateSheet(SHEET_NAMES.PARTNERS);
    const rows = await sheet.getRows();

    const row = rows.find(r => r.get('partner_id') === partnerId);
    if (!row) return false;

    await row.delete();
    return true;
}

// ============================================
// 고객 신청 관련 함수
// ============================================

export async function getAllApplications(): Promise<Application[]> {
    const sheet = await getOrCreateSheet(SHEET_NAMES.APPLICATIONS);
    const rows = await sheet.getRows();

    return rows.map(row => {
        const obj = snakeToCamel(row.toObject());
        return obj as unknown as Application;
    });
}

export async function getApplicationsByPartnerId(partnerId: string): Promise<Application[]> {
    const sheet = await getOrCreateSheet(SHEET_NAMES.APPLICATIONS);
    const rows = await sheet.getRows();

    return rows
        .filter(r => r.get('partner_id') === partnerId)
        .map(row => snakeToCamel(row.toObject()) as unknown as Application);
}

export async function getApplicationByNo(applicationNo: string): Promise<Application | null> {
    const sheet = await getOrCreateSheet(SHEET_NAMES.APPLICATIONS);
    const rows = await sheet.getRows();

    const row = rows.find(r => r.get('application_no') === applicationNo);
    if (!row) return null;

    return snakeToCamel(row.toObject()) as unknown as Application;
}

export async function createApplication(
    application: Omit<Application, 'applicationNo' | 'createdAt' | 'updatedAt'>
): Promise<Application> {
    const sheet = await getOrCreateSheet(SHEET_NAMES.APPLICATIONS);

    // 신청번호 생성
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const applicationNo = `SA-${dateStr}-${random}`;

    const now = new Date().toISOString();

    const newApplication = {
        application_no: applicationNo,
        partner_id: application.partnerId,
        partner_name: application.partnerName,
        product_type: application.productType,
        plan_type: application.planType || '-',
        products: application.products || '',
        customer_name: application.customerName,
        customer_birth: application.customerBirth,
        customer_gender: application.customerGender,
        customer_phone: application.customerPhone,
        customer_email: application.customerEmail || '',
        customer_address: application.customerAddress,
        customer_zipcode: application.customerZipcode,
        partner_member_id: application.partnerMemberId || '',
        preferred_contact_time: application.preferredContactTime || '',
        inquiry: application.inquiry || '',
        status: '접수',
        assigned_to: '',
        created_at: now,
        updated_at: now,
        contract_date: '',
        delivery_date: '',
        settlement_date: '',
    };

    await sheet.addRow(newApplication, { insert: true });

    return {
        ...application,
        applicationNo,
        status: '접수' as ApplicationStatus,
        assignedTo: '',
        createdAt: now,
        updatedAt: now,
    } as Application;
}

export async function updateApplicationStatus(
    applicationNo: string,
    newStatus: ApplicationStatus,
    changedBy: string,
    memo?: string
): Promise<boolean> {
    const sheet = await getOrCreateSheet(SHEET_NAMES.APPLICATIONS);
    const rows = await sheet.getRows();

    const row = rows.find(r => r.get('application_no') === applicationNo);
    if (!row) return false;

    const previousStatus = row.get('status');

    // 상태 업데이트
    row.set('status', newStatus);
    row.set('updated_at', new Date().toISOString());

    // 상태에 따른 날짜 업데이트
    if (newStatus === '계약완료') {
        row.set('contract_date', new Date().toISOString());
    } else if (newStatus === '배송완료') {
        row.set('delivery_date', new Date().toISOString());
    } else if (newStatus === '정산완료') {
        row.set('settlement_date', new Date().toISOString());
    }

    await row.save();

    // 상태 변경 이력 저장
    await addStatusHistory(applicationNo, previousStatus, newStatus, changedBy, memo);

    return true;
}

export async function updateApplicationAssignee(
    applicationNo: string,
    assignedTo: string
): Promise<boolean> {
    const sheet = await getOrCreateSheet(SHEET_NAMES.APPLICATIONS);
    const rows = await sheet.getRows();

    const row = rows.find(r => r.get('application_no') === applicationNo);
    if (!row) return false;

    row.set('assigned_to', assignedTo);
    row.set('updated_at', new Date().toISOString());
    await row.save();

    return true;
}

// ============================================
// 상태 변경 이력 함수
// ============================================

async function addStatusHistory(
    applicationNo: string,
    previousStatus: string,
    newStatus: string,
    changedBy: string,
    memo?: string
): Promise<void> {
    const sheet = await getOrCreateSheet(SHEET_NAMES.STATUS_HISTORY);

    await sheet.addRow({
        history_id: `H-${Date.now()}`,
        application_no: applicationNo,
        previous_status: previousStatus,
        new_status: newStatus,
        changed_by: changedBy,
        changed_at: new Date().toISOString(),
        memo: memo || '',
    });
}

// ============================================
// 파트너 신청 관련 함수
// ============================================

export async function getAllPartnerRequests(): Promise<PartnerRequest[]> {
    const sheet = await getOrCreateSheet(SHEET_NAMES.PARTNER_REQUESTS);
    const rows = await sheet.getRows();

    return rows.map(row => snakeToCamel(row.toObject()) as unknown as PartnerRequest);
}

export async function getPendingPartnerRequests(): Promise<PartnerRequest[]> {
    const sheet = await getOrCreateSheet(SHEET_NAMES.PARTNER_REQUESTS);
    const rows = await sheet.getRows();

    return rows
        .filter(r => r.get('status') === 'pending')
        .map(row => snakeToCamel(row.toObject()) as unknown as PartnerRequest);
}

export async function createPartnerRequest(
    request: Omit<PartnerRequest, 'requestId' | 'status' | 'createdAt'>
): Promise<PartnerRequest> {
    const sheet = await getOrCreateSheet(SHEET_NAMES.PARTNER_REQUESTS);

    const requestId = `PR-${Date.now()}`;
    const now = new Date().toISOString();

    await sheet.addRow({
        request_id: requestId,
        company_name: request.companyName,
        business_number: request.businessNumber,
        ceo_name: request.ceoName,
        company_address: request.companyAddress || '',
        company_phone: request.companyPhone || '',
        manager_name: request.managerName,
        manager_department: request.managerDepartment || '',
        manager_phone: request.managerPhone,
        manager_email: request.managerEmail,
        shop_type: request.shopType,
        shop_url: request.shopUrl || '',
        monthly_visitors: request.monthlyVisitors || '',
        member_count: request.memberCount || '',
        main_products: request.mainProducts || '',
        expected_monthly_sales: request.expectedMonthlySales || '',
        point_rate: request.pointRate || '',
        additional_request: request.additionalRequest || '',
        parent_partner_id: request.parentPartnerId || '',
        parent_partner_name: request.parentPartnerName || '',
        status: 'pending',
        created_at: now,
        reviewed_by: '',
        reviewed_at: '',
    });

    return {
        ...request,
        requestId,
        status: 'pending',
        createdAt: now,
    } as PartnerRequest;
}

export async function approvePartnerRequest(
    requestId: string,
    approvedBy: string,
    partnerData: {
        customUrl: string;
        loginId: string;
        loginPassword: string;
        pointInfo: string;
    }
): Promise<Partner | null> {
    const requestSheet = await getOrCreateSheet(SHEET_NAMES.PARTNER_REQUESTS);
    const rows = await requestSheet.getRows();

    const requestRow = rows.find(r => r.get('request_id') === requestId);
    if (!requestRow) return null;

    // 신청 상태 업데이트
    requestRow.set('status', 'approved');
    requestRow.set('reviewed_by', approvedBy);
    requestRow.set('reviewed_at', new Date().toISOString());
    await requestRow.save();

    // 파트너 생성
    const partner = await createPartner({
        companyName: requestRow.get('company_name'),
        businessNumber: requestRow.get('business_number'),
        ceoName: requestRow.get('ceo_name'),
        managerName: requestRow.get('manager_name'),
        managerPhone: requestRow.get('manager_phone'),
        managerEmail: requestRow.get('manager_email'),
        shopUrl: requestRow.get('shop_url'),
        shopType: requestRow.get('shop_type'),
        memberCount: requestRow.get('member_count'),
        customUrl: partnerData.customUrl,
        logoUrl: '',
        pointInfo: partnerData.pointInfo,
        brandColor: '#1e3a5f',
        loginId: partnerData.loginId,
        loginPassword: partnerData.loginPassword, // 실제로는 해시화 필요
        status: 'active',
        parentPartnerId: requestRow.get('parent_partner_id') || '',
        parentPartnerName: requestRow.get('parent_partner_name') || '',
        approvedAt: new Date().toISOString(),
        approvedBy,
    });

    return partner;
}

export async function rejectPartnerRequest(
    requestId: string,
    rejectedBy: string
): Promise<boolean> {
    const sheet = await getOrCreateSheet(SHEET_NAMES.PARTNER_REQUESTS);
    const rows = await sheet.getRows();

    const row = rows.find(r => r.get('request_id') === requestId);
    if (!row) return false;

    row.set('status', 'rejected');
    row.set('reviewed_by', rejectedBy);
    row.set('reviewed_at', new Date().toISOString());
    await row.save();

    return true;
}

// ============================================
// 관리자 인증 함수
// ============================================

export async function validateAdminCredentials(
    loginId: string,
    password: string
): Promise<{ valid: boolean; role?: string; adminId?: string; adminName?: string }> {
    const sheet = await getOrCreateSheet(SHEET_NAMES.ADMINS);
    const rows = await sheet.getRows();

    const row = rows.find(r => {
        const sAdminId = String(r.get('admin_id') || '').trim();
        const sEmail = String(r.get('email') || '').trim();
        const sPw = String(r.get('password') || '').trim();
        const sInputPw = String(password).trim();
        const sInputId = String(loginId).trim();

        // 관리자 ID, 이메일이 일치하고 비밀번호가 맞는 경우
        return (sAdminId === sInputId || sEmail === sInputId) && sPw === sInputPw;
    });

    if (!row) {
        return { valid: false };
    }

    // 마지막 로그인 시간 업데이트
    row.set('last_login', new Date().toISOString());
    await row.save();

    return {
        valid: true,
        role: row.get('role') || 'admin',
        adminId: row.get('admin_id') || 'admin',
        adminName: row.get('admin_name') || '관리자'
    };
}

export async function validatePartnerCredentials(
    loginId: string,
    password: string
): Promise<Partner | null> {
    const partner = await getPartnerByLoginId(loginId);

    if (!partner) return null;
    if (partner.loginPassword !== password) return null; // 실제로는 해시 비교
    if (partner.status !== 'active') return null;

    return partner;
}

// ============================================
// 계층 구조 지원 함수 (Search & Hierarchy)
// ============================================

export async function searchPartners(query: string): Promise<Partner[]> {
    const partners = await getAllPartners();
    if (!query) return [];

    return partners.filter(p =>
        p.status === 'active' &&
        (p.companyName.toLowerCase().includes(query.toLowerCase()) ||
            p.ceoName.toLowerCase().includes(query.toLowerCase()))
    );
}

export async function getSubPartnerIds(parentId: string): Promise<string[]> {
    const allPartners = await getAllPartners();

    // 관리자인 경우 모든 파트너 ID 반환
    if (parentId === 'admin' || parentId.startsWith('ADMIN')) {
        return allPartners.map(p => p.partnerId).concat(['admin', 'direct']);
    }

    const ids: string[] = [parentId];

    // 1단계 하위 우선 처리
    const subPartners = allPartners.filter(p => p.parentPartnerId === parentId);
    subPartners.forEach(p => ids.push(p.partnerId));

    return ids;
}

export async function getHierarchyApplications(parentId: string): Promise<Application[]> {
    const allApplications = await getAllApplications();

    // 관리자인 경우 전체 내역 반환
    if (parentId === 'admin' || parentId.startsWith('ADMIN')) {
        return allApplications;
    }

    const subPartnerIds = await getSubPartnerIds(parentId);

    // 자신과 하위 파트너들의 신청 내역 필터링
    return allApplications.filter(app => subPartnerIds.includes(app.partnerId));
}

// ============================================
// 통계 함수
// ============================================

export async function getStats() {
    const partners = await getAllPartners();
    const applications = await getAllApplications();
    const today = new Date().toISOString().slice(0, 10);
    const thisMonth = new Date().toISOString().slice(0, 7);

    const todayApplications = applications.filter(
        a => a.createdAt.slice(0, 10) === today
    );

    const monthlyCompleted = applications.filter(
        a => a.status === '계약완료' && a.contractDate?.slice(0, 7) === thisMonth
    );

    const inProgress = applications.filter(
        a => !['계약완료', '배송완료', '정산완료', '거부', '접수취소', '계약취소'].includes(a.status)
    );

    return {
        totalPartners: partners.filter(p => p.status === 'active').length,
        todayApplications: todayApplications.length,
        inProgressContracts: inProgress.length,
        monthlyCompletedContracts: monthlyCompleted.length,
    };
}

export async function getPartnerStats(partnerId: string) {
    const applications = await getApplicationsByPartnerId(partnerId);
    const today = new Date().toISOString().slice(0, 10);
    const thisMonth = new Date().toISOString().slice(0, 7);

    const todayApplications = applications.filter(
        a => a.createdAt.slice(0, 10) === today
    );

    const monthlyCompleted = applications.filter(
        a => a.status === '계약완료' && a.contractDate?.slice(0, 7) === thisMonth
    );

    return {
        todayApplications: todayApplications.length,
        monthlyContracts: monthlyCompleted.length,
        totalApplications: applications.length,
    };
}
