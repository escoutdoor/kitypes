import { api } from "@/lib/axios"
import { SendContactRequest } from "./support.interface"

const SUPPORT_PREFIX = "/v1/support";

export class SupportService {
    static async sendContactMessage(data: SendContactRequest): Promise<void> {
        await api.post(`${SUPPORT_PREFIX}/contact`, data)
    }
}
