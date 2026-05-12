import { useQuery } from "@tanstack/react-query";
import { ReportService } from "@/service/report/report.service";
import { ListReportsParams } from "@/service/report/report.interface";

export const useReports = (params: ListReportsParams) => {
    return useQuery({
        queryKey: [
            "admin-reports",
            params.limit ?? null,
            params.offset ?? null,
            params.status ?? null,
            params.targetType ?? null,
            params.targetId ?? null,
        ],
        queryFn: () => ReportService.list(params),
        placeholderData: (prev) => prev,
        staleTime: 30_000,
        refetchOnWindowFocus: true,
    });
};
