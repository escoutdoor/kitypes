import { useMutation, useQueryClient, QueryKey } from "@tanstack/react-query";
import { ReportService } from "@/service/report/report.service";
import {
    BanUserAndResolveRequest,
    ListReportsResponse,
    REPORT_STATUS,
    EnrichedReport,
} from "@/service/report/report.interface";

type MutationContext = {
    previousReports: [QueryKey, ListReportsResponse | undefined][];
    previousReport?: EnrichedReport;
};

const sanitizeAdminNotes = (notes?: string) => notes?.trim() || undefined;

export const useBanUserAndResolveReport = () => {
    const queryClient = useQueryClient();

    return useMutation<
        void,
        Error,
        { reportId: string; data: BanUserAndResolveRequest },
        MutationContext
    >({
        mutationFn: ({ reportId, data }) => {
            const sanitizedData: BanUserAndResolveRequest = {
                ...data,
                adminNotes: sanitizeAdminNotes(data.adminNotes),
            };
            return ReportService.banUserAndResolve(reportId, sanitizedData);
        },

        onMutate: async ({ reportId, data }) => {
            const sanitizedAdminNotes = sanitizeAdminNotes(data.adminNotes);

            await queryClient.cancelQueries({ queryKey: ["admin-reports"] });
            await queryClient.cancelQueries({ queryKey: ["admin-report", reportId] });

            const previousReports = queryClient.getQueriesData<ListReportsResponse>({
                queryKey: ["admin-reports"],
            });
            const previousReport = queryClient.getQueryData<EnrichedReport>([
                "admin-report",
                reportId,
            ]);

            previousReports.forEach(([key, oldData]) => {
                if (!oldData?.reports) return;
                queryClient.setQueryData<ListReportsResponse>(key, {
                    ...oldData,
                    reports: oldData.reports.map((r) =>
                        r.id === reportId
                            ? {
                                ...r,
                                status: REPORT_STATUS.RESOLVED,
                                adminNotes: sanitizedAdminNotes,
                            }
                            : r
                    ),
                });
            });

            queryClient.setQueryData<EnrichedReport>(
                ["admin-report", reportId],
                (old) =>
                    old
                        ? {
                            ...old,
                            status: REPORT_STATUS.RESOLVED,
                            adminNotes: sanitizedAdminNotes,
                        }
                        : old
            );

            return { previousReports, previousReport };
        },

        onError: (_err, variables, context) => {
            if (context?.previousReports) {
                context.previousReports.forEach(([key, oldData]) => {
                    queryClient.setQueryData(key, oldData);
                });
            }
            if (context?.previousReport !== undefined) {
                queryClient.setQueryData(
                    ["admin-report", variables.reportId],
                    context.previousReport
                );
            }
        },

        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
            queryClient.invalidateQueries({
                queryKey: ["admin-report", variables.reportId],
            });

            queryClient.invalidateQueries({ queryKey: ["ads"] });
            queryClient.invalidateQueries({ queryKey: ["ad"] });
        },
    });
};
