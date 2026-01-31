import { connectRabbitMQ, publishExchangeMessage } from "../broker/broker";



async function  exec ( ) {

    await  connectRabbitMQ();
    
         const cnpjCliente = "12345678000199"; 
    const evento = "estoque.atualizado"; // ou 'pedido.criado', 'produto.cadastrado'
    
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
        data: {
            sku: "CAMISETA-01",
            old_qty: 10,
            new_qty: 9,
            id_produto: 5544
        }
    };

    console.log(`📤 Enviando para: ${routingKey}`);

    const enviado = await publishExchangeMessage(routingKey, mensagem);
    
    if(enviado) console.log("✅ Mensagem enviada com sucesso!");
    else console.error("❌ Falha no envio.");


}

exec ( )
