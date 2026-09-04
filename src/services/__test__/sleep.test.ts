import test from "node:test";
import { delay } from "../delay-service/delay.ts";

test( "teste sleep function ",async ()=>{

        await delay(2)
        console.log("### TESTE $$$ ")
    })