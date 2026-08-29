import test from "node:test";
import { NodeMailerService } from "../services/NodeMailer.ts";

/*
class NodeMailerService {

    constructor(host: string, port:number, user:string, password:string){

    }

    async   sendMail() {
        const info = await 
    }
}*/

test("TESTE ENVIO DE EMAIL", async () => {
    const data = await NodeMailerService().main('diego@intersig.com.br',123456789)
    console.log(data);
});