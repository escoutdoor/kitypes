import { api } from "@/lib/axios";
import {
    BanUserAndResolveRequest,
    BlockAdAndResolveRequest,
    CreateReportRequest,
    EnrichedReport,
    ListReportsParams,
    ListReportsResponse,
    SingleReportResponse,
    UpdateReportStatusRequest,
} from "./report.interface";

const USER_REPORTS_PREFIX = "/v1/reports";
const ADMIN_REPORTS_PREFIX = "/v1/admin/reports";

export class ReportService {
    static async create(data: CreateReportRequest): Promise<void> {
        await api.post(`${USER_REPORTS_PREFIX}/`, data);
    }

    static async list(params?: ListReportsParams): Promise<ListReportsResponse> {
        const resp = await api.get<ListReportsResponse>(`${ADMIN_REPORTS_PREFIX}/`, { params });
        return resp.data;
    }

    static async getById(id: string): Promise<EnrichedReport> {
        const resp = await api.get<SingleReportResponse>(`${ADMIN_REPORTS_PREFIX}/${id}`);
        return resp.data.report;
    }

    static async updateStatus(id: string, data: UpdateReportStatusRequest): Promise<void> {
        await api.patch(`${ADMIN_REPORTS_PREFIX}/${id}/status`, data);
    }

    static async blockAdAndResolve(reportId: string, data: BlockAdAndResolveRequest): Promise<void> {
        await api.post(`${ADMIN_REPORTS_PREFIX}/${reportId}/block-ad`, data);
    }

    static async banUserAndResolve(reportId: string, data: BanUserAndResolveRequest): Promise<void> {
        await api.post(`${ADMIN_REPORTS_PREFIX}/${reportId}/ban-user`, data);
    }
}
