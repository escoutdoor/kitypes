import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReportService } from "@/service/report/report.service";
import { UpdateReportStatusRequest, ListReportsResponse } from "@/service/report/report.interface";

export const useUpdateReportStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateReportStatusRequest }) =>
            ReportService.updateStatus(id, data),

        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: ["admin-reports"] });
            await queryClient.cancelQueries({ queryKey: ["admin-report", id] });

            const previousQueries = queryClient.getQueriesData({ queryKey: ["admin-reports"] });

            queryClient.setQueriesData(
                { queryKey: ["admin-reports"] },
                (oldData: ListReportsResponse | undefined) => {
                    if (!oldData?.reports) return oldData;

                    return {
                        ...oldData,
                        reports: oldData.reports.map((req) =>
                            req.id === id
                                ? { ...req, status: data.status, adminNotes: data.adminNotes }
                                : req
                        ),
                    };
                }
            );

            queryClient.setQueryData(["admin-report", id], (oldData: any) => {
                if (!oldData) return oldData;
                return { ...oldData, status: data.status, adminNotes: data.adminNotes };
            });

            return { previousQueries };
        },

        onError: (_err, _variables, context) => {
            if (context?.previousQueries) {
                context.previousQueries.forEach(([queryKey, oldData]) => {
                    queryClient.setQueryData(queryKey, oldData);
                });
            }
        },

        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
            queryClient.invalidateQueries({ queryKey: ["admin-report", variables.id] });
        },
    });
};
