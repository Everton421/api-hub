import test from "node:test";
import { MlOrdersRequest } from "../orders/ml-orders-request.ts";

test("teste mlOrdersRequest getOrderById ",async ()=>{

    const mlOrdersRequest = new MlOrdersRequest();
    const data = await mlOrdersRequest.getOrderById('APP_USR-4933537661574703-090415-3c4fc9449556a7be5732ff26b7c9b5ba-3467095410','2000018210698612');

        console.log(data)
})