import test from "node:test";
import { MlAnnouncementMapping } from "../announcement/mapping/ml-announcement-mapping.ts";
import { UpdateMlAnnouncement } from "../announcement/update-announcement/update-ml-announcement.ts";
import { MlAuthServices } from "../services/auth/ml-auth-services.ts";
import { SelectMLAccountClient } from "../../../../models/ml-accounts/select-ml-accounts.ts";
import { UpdateMLAccountClient } from "../../../../models/ml-accounts/update-ml-accounts.ts";
import { UpdateMlAnnouncementService } from "../announcement/update-announcement/update-ml-announcement-service.ts";
 
test("TESTE", async (t)=>{
    await t.test("  UPDATE ANNOUNCEMENT ", async ()=>{
             const updateMlAnnouncement  = new UpdateMlAnnouncement(
                 new MlAnnouncementMapping(),
                 new MlAuthServices( new SelectMLAccountClient(), new UpdateMLAccountClient(), process.env.ML_API_URL!)
             );
    
    const updateMlAnnouncementService = new UpdateMlAnnouncementService( updateMlAnnouncement  );

           const resultUpdateAnnouncement =  await updateMlAnnouncementService.syncProductByCode('12264558911',56103 )
              console.log(resultUpdateAnnouncement);
    })
})