import * as z from "zod"

export const MAX_DOCS = 10
export const MAX_DOC_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
export const ALLOWED_DOC_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf"
] as const

export const DOC_MIME_TO_EXT: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
}

export const createVerificationSchema = z.object({
    requestedRole: z.enum(["volunteer", "shelter"], {
        message: "Будь ласка, оберіть бажану роль",
    }),
    documents: z.array(z.custom<File>())
        .min(1, "Додайте хоча б один документ (паспорт або документи притулку)")
        .max(MAX_DOCS, `Можна завантажити максимум ${MAX_DOCS} документів`),
})

export type CreateVerificationFormValues = z.infer<typeof createVerificationSchema>
