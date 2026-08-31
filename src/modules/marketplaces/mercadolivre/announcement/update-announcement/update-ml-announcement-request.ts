import axios from "axios";
import { type MlUpdatePayload } from "../types/update-announcement.ts";

export class UpdateMlAnnouncementRequest {
    async update(ML_API_URL: string, mlItemId: string, mlPayload: MlUpdatePayload['mlPayload'], accessToken: string): Promise<void> {
        await axios.put(`${ML_API_URL}/items/${mlItemId}`, mlPayload, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });
    }
}
