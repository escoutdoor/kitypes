import { useMutation } from "@tanstack/react-query";
import { ReportService } from "@/service/report/report.service";
import { CreateReportRequest } from "@/service/report/report.interface";

export const useCreateReport = () => {
    return useMutation({
        mutationFn: (data: CreateReportRequest) => ReportService.create(data),
    });
};
