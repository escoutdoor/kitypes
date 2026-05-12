import { useMutation, useQueryClient, QueryKey } from "@tanstack/react-query";
import { ReportService } from "@/service/report/report.service";
import {
    BlockAdAndResolveRequest,
    ListReportsResponse,
    REPORT_STATUS,
    EnrichedReport
} from "@/service/report/report.interface";
import { Ad, AD_STATUS } from "@/service/ad/ad.interface";

type MutationContext = {
    previousReports: [QueryKey, ListReportsResponse | undefined][];
    previousReport: EnrichedReport | undefined;
    previousAd: Ad | undefined;
};

export const useBlockAdAndResolveReport = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, { reportId: string; data: BlockAdAndResolveRequest }, MutationContext>({
        mutationFn: ({ reportId, data }) => ReportService.blockAdAndResolve(reportId, data),

        onMutate: async ({ reportId, data }) => {
            await queryClient.cancelQueries({ queryKey: ["admin-reports"] });
            await queryClient.cancelQueries({ queryKey: ["admin-report", reportId] });
            await queryClient.cancelQueries({ queryKey: ["ad", data.adId] });

            const previousReports = queryClient.getQueriesData<ListReportsResponse>({ queryKey: ["admin-reports"] });
            const previousReport = queryClient.getQueryData<EnrichedReport>(["admin-report", reportId]);
            const previousAd = queryClient.getQueryData<Ad>(["ad", data.adId]);

            previousReports.forEach(([key, oldData]) => {
                if (!oldData?.reports) return;
                queryClient.setQueryData<ListReportsResponse>(key, {
                    ...oldData,
                    reports: oldData.reports.map((r) =>
                        r.id === reportId
                            ? { ...r, status: REPORT_STATUS.RESOLVED, adminNotes: data.adminNotes }
                            : r
                    ),
                });
            });

            queryClient.setQueryData<EnrichedReport>(["admin-report", reportId], (old) => {
                if (!old) return old;
                return { ...old, status: REPORT_STATUS.RESOLVED, adminNotes: data.adminNotes };
            });

            queryClient.setQueryData<Ad>(["ad", data.adId], (oldAd) => {
                if (!oldAd) return oldAd;
                return { ...oldAd, status: AD_STATUS.BLOCKED };
            });

            return { previousReports, previousReport, previousAd };
        },

        onError: (_err, variables, context) => {
            if (context?.previousReports) {
                context.previousReports.forEach(([key, oldData]) => {
                    queryClient.setQueryData(key, oldData);
                });
            }
            if (context?.previousReport !== undefined) {
                queryClient.setQueryData(["admin-report", variables.reportId], context.previousReport);
            }
            if (context?.previousAd !== undefined) {
                queryClient.setQueryData(["ad", variables.data.adId], context.previousAd);
            }
        },

        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
            queryClient.invalidateQueries({ queryKey: ["admin-report", variables.reportId] });
            queryClient.invalidateQueries({ queryKey: ["ad", variables.data.adId] });
        },
    });
};
