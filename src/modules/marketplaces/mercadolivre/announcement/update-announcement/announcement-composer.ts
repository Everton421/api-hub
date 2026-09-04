import { ApiClient } from "../../../../../services/lib/api-client.ts";
import { type ApiClientFactory, SyncMlAnnouncementService } from "./sync-ml-announcement-service.ts";
import { SelectAnuncios } from "../../../../../models/anuncios/select.ts";
import { UpdateAnuncios } from "../../../../../models/anuncios/update.ts";
import { DeleteAtributosAnuncios } from "../../../../../models/atributos-anuncios/delete.ts";
import { InsertAtributosAnuncios } from "../../../../../models/atributos-anuncios/insert.ts";
import { SelectAtributosAnuncios } from "../../../../../models/atributos-anuncios/select.ts";
import { SelectPhoto } from "../../../../../models/photo/select.ts";
import { SelectProductSector } from "../../../../../models/product-sector/select.ts";
import { SelectProduct } from "../../../../../models/product/select.ts";
import { SelectUsersMlIntegrations } from "../../../../../models/users-ml-integration/select-users-ml-integration.ts";
import { MlAuthServices } from "../../services/auth/ml-auth-services.ts";
import { SelectMLAccountClient } from "../../../../../models/ml-accounts/select-ml-accounts.ts";
import { UpdateMLAccountClient } from "../../../../../models/ml-accounts/update-ml-accounts.ts";
import { MappingAnnouncementByProduct } from "../mapping/mapping-announcement-by-product.ts";
import { UpdateLocalMlAnnouncement } from "./update-local-ml-announcement.ts";

const ML_API_URL = process.env.ML_API_URL || 'https://api.mercadolibre.com';

export function buildSyncMlAnnouncementService(): SyncMlAnnouncementService {
    const mlAuthServices = new MlAuthServices(new SelectMLAccountClient(), new UpdateMLAccountClient(), ML_API_URL);

    const apiClientFactory: ApiClientFactory = async (cnpj, systemUserCode, mlUserId) => {
        const token = await mlAuthServices.getValidMlAccessToken(cnpj, systemUserCode, mlUserId);
        return new ApiClient(ML_API_URL, token);
    };

    const mappingAnnouncementByProduct = new MappingAnnouncementByProduct(
        new SelectAnuncios(),
        new SelectProduct(),
        new SelectProductSector(),
        new SelectUsersMlIntegrations(),
        new SelectPhoto(),
        new SelectAtributosAnuncios()
    );

    const updateLocalMlAnnouncement = new UpdateLocalMlAnnouncement(
        new UpdateAnuncios(),
        new InsertAtributosAnuncios(),
        new DeleteAtributosAnuncios()
    );

    return new SyncMlAnnouncementService(
        apiClientFactory,
        mappingAnnouncementByProduct,
        updateLocalMlAnnouncement,
        new SelectAnuncios()
    );
}
