import { connectRabbitMQ, publishExchangeMessage } from "../../broker-connection/broker";

  

/**
 * 
 * @param cnpj cnpj do cliente
 * @param evento   'pedido.criado', 'produto.cadastrado' 
 * @param data  dados da mensagem enviada ao broker. Ex:  "{ codigo:1 , estoque:2 }"
 * @returns 
 */
  export async function  publishMessage ( cnpj: string, evento:string,  data:any ) {
    
    await  connectRabbitMQ();
       
            const cnpjCliente = cnpj; 
      
       // 2. Construção da Routing Key
       // Padrão: tenant.<CNPJ>.<DOMINIO>.<EVENTO>
       const routingKey = `tenant.${cnpjCliente}.${evento}`;
   
       // 3. Payload (O que o consumidor precisa saber)
       // IMPORTANTE: Mande o tenant_id dentro do JSON também para facilitar o uso no consumer
       const mensagem = {
           metadata: {
               tenant_id: cnpjCliente,
               event: evento,
               timestamp: new Date().toISOString()
           },
           data :data
       };
   
       console.log(`📤 Enviando para: ${routingKey}`);
   
       const enviado = await publishExchangeMessage(routingKey, mensagem);
       
       if(enviado) console.log("✅ Mensagem enviada com sucesso!");
       else console.error("❌ Falha no envio.");
   
       return enviado;
   }