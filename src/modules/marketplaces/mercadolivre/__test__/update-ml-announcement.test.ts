import test from "node:test";
import { buildSyncMlAnnouncementService } from "../announcement/update-announcement/announcement-composer.ts";

test("TESTE", async (t)=>{
    await t.test("  UPDATE ANNOUNCEMENT ", async ()=>{
        const updateMlAnnouncementService = buildSyncMlAnnouncementService();

        const resultUpdateAnnouncement = await updateMlAnnouncementService.syncProductByCode('12264558911', 56103);
        console.log(resultUpdateAnnouncement);
    })
})