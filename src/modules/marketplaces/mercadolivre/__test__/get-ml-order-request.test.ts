import test from "node:test"
import { MlOrdersRequest } from "../orders/ml-orders-request.ts";

const ML_TOKEN = 'APP_USR-4933537661574703-090415-3c4fc9449556a7be5732ff26b7c9b5ba-3467095410';
const ML_SELLER_ID = 3467095410;



test("TESTE", async (t) => {
    //await t.test("GET ML ORDERS", async () => {
    //    const mlApiUrl = process.env.ML_API_URL!;
    //    const request = new MlOrdersRequest();
    //
    //    try {
    //        const orderIds = await request.fetchOrderIds(ML_TOKEN, ML_SELLER_ID);
    //        console.log("=== GET ALL ORDERS ===");
    //        console.log(orderIds);
    //    } catch (e: any) {
    //        console.log("=== ERROR STATUS ===", e.response?.status);
    //        console.log("=== ERROR DATA ===", JSON.stringify(e.response?.data, null, 2));
    //    }
    //});

    await t.test("GET ML ORDER BY ID", async () => {
        const request = new MlOrdersRequest();

        try {
            const order = await request.getOrderById(ML_TOKEN, 2000018262033352);
            console.log(order);

            //const buyerId = order.buyer.id;
            //const buyer = await request.getUserById(ML_TOKEN, buyerId);
            //console.log(buyer);
            /*console.log("=== BUYER DETAILS ===");
            console.log(JSON.stringify({
                id: buyer.id,
                nickname: buyer.nickname,
                first_name: buyer.first_name,
                last_name: buyer.last_name,
                email: buyer.email,
                gender: buyer.gender,
                country_id: buyer.country_id,
                site_id: buyer.site_id,
                address: buyer.address,
                phone: buyer.phone,
                registration_date: buyer.registration_date,
                user_type: buyer.user_type,
                permalink: buyer.permalink
            }, null, 2));
            */
        } catch (e: any) {
            console.log("=== ERROR STATUS ===", e.response?.status);
            console.log("=== ERROR DATA ===", JSON.stringify(e.response?.data, null, 2));
        }
    });
});
