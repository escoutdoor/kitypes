import { useQuery } from "@tanstack/react-query";
import { ReportService } from "@/service/report/report.service";

export const useReport = (id: string | null, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["admin-report", id],
        queryFn: () => {
            if (!id) throw new Error("Report ID is required");
            return ReportService.getById(id);
        },
        enabled: !!id && enabled,
        staleTime: 60_000,
    });
};
