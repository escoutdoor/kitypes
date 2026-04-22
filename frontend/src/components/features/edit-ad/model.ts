import * as z from "zod"

export const MAX_IMAGES = 10
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const

export const MIME_TO_EXT: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

export type ExistingImage = {
    kind: "existing"
    key: string
    previewUrl: string
}

export type NewImage = {
    kind: "new"
    file: File
    previewUrl: string
}

export type ImageItem = ExistingImage | NewImage

export const editAdSchema = z.object({
    title: z.string().trim().min(5, "Мінімум 5 символів").max(100, "Максимум 100 символів"),
    description: z.string().trim().min(20, "Опишіть тваринку детальніше (мінімум 20 символів)"),
    petType: z.number().min(1, "Оберіть тип тваринки").max(3),
    petGender: z.number().min(1, "Оберіть стать").max(2),
    petAgeMonth: z
        .string()
        .optional()
        .refine((v) => !v || /^\d+$/.test(v), "Вік має бути цілим числом")
        .refine((v) => !v || Number(v) >= 0, "Вік не може бути від'ємним"),
    petBreed: z.string().trim().max(50, "Максимум 50 символів").optional(),
    country: z.string().trim().min(2, "Вкажіть країну"),
    city: z.string().trim().min(2, "Вкажіть місто"),
    images: z.array(z.custom<ImageItem>()).min(1, "Додайте хоча б одну фотографію").max(MAX_IMAGES, `Максимум ${MAX_IMAGES} фотографій`),
})

export type EditAdFormValues = z.infer<typeof editAdSchema>
