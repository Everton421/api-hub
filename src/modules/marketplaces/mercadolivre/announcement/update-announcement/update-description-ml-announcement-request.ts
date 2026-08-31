import axios from "axios";

export class UpdateDescriptionMlAnnouncementRequest {
    async update(ML_API_URL: string, mlItemId: string, description: string, accessToken: string): Promise<void> {
        await axios.put(
            `${ML_API_URL}/items/${mlItemId}/description`,
            { plain_text: description },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        );
    }
}
