import { MakeClient } from "../factories/make-client.ts";
import { MakeOrder } from "../factories/make-order.ts";
import { MakeProduct } from "../factories/make-product.ts";
import { MakeService } from "../factories/make-service.ts";


const factoryProduct = new MakeProduct();
const makeService = new MakeService();
const makeClient = new MakeClient();
const makeOrder = new MakeOrder();

await factoryProduct.createByFakeStoreApi(`\`12264558911\``, 5)
await makeService.createService( `\`12264558911\``,3)
await makeClient.create(`\`12264558911\``, 5)
await makeOrder.create(`\`12264558911\``,'EA');
