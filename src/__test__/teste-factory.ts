import { MakeProduct } from "../factories/make-product.ts";


const factoryProduct = new MakeProduct();

//const result = await factory.create(`\`12264558911\``);

const resultFakeStore = await factoryProduct.createByFakeStoreApi(`\`12264558911\``, 5)
console.log(resultFakeStore)