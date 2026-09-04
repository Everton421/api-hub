import { ApiClient } from "../../../../../services/lib/api-client.ts";
import { type IPayloadResultFunction } from "../types/payload-results-function-ml.ts";
import { type IPayloadToUpdateMLAnnouncement } from "../types/payload-update-announcement.ts";
 
 
 export  abstract class UpdateMlAnnouncementDriver  {
     public readonly mercadolivreApi: ApiClient
        constructor(  mercadolivreApi: ApiClient,   ) {
            this.mercadolivreApi = mercadolivreApi;
        }
    abstract updateItem(mlItemId: string, payload: Partial<IPayloadToUpdateMLAnnouncement>): Promise<IPayloadResultFunction>

}