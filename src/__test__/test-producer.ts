import { connectRabbitMQ, publishExchangeMessage } from "../broker/broker";



async function  exec ( ) {

    await  connectRabbitMQ();
    
    const aux = { ok:true }
    const v=  await   publishExchangeMessage(  '', aux)
    console.log(v)
}

exec ( )
