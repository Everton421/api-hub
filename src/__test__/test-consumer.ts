import amqplib from 'amqplib'
import 'dotenv/config';

export async function testeConsumercliente() {

    
        const EXCHANGE = process.env.EXCHANGE_NAME
            const broker_url = process.env.BROKER_URL;

   try {
                if(!EXCHANGE ) throw new Error("process.env.EXCHANGE_NAME não configurada ");
                if( !broker_url ) throw new Error("process.env.BROKER_URL não configurada ");

        const conn = await amqplib.connect(broker_url);
        const channel = await conn.createChannel();
        
        
        // Nome da fila específico para essa funcionalidade
        // Isso garante que se você subir outro worker (ex: envio de email), ele receba uma cópia
        const QUEUE_NAME = 'q.integracao.mercadolivre'; 

        // 1. Cria a Exchange (caso não exista)
        await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

        // 2. Cria a Fila
        const q = await channel.assertQueue(QUEUE_NAME, { durable: true });

        // 3. O BINDING (A MÁGICA ACONTECE AQUI) ---------------------------
        // O asterisco (*) diz: "Aceite qualquer coisa nesta posição"
        // Padrão: tenant.{QUALQUER_CNPJ}.estoque.atualizado
        
        await channel.bindQueue(q.queue, EXCHANGE, 'tenant.*.movimentosprodutos.inserido');
        
        // Se quiser escutar TUDO de estoque (criado, deletado, atualizado):
        // await channel.bindQueue(q.queue, EXCHANGE, 'tenant.*.estoque.*');
        
        // -----------------------------------------------------------------

        console.log(` [*] Worker MercadoLivre aguardando eventos em ${QUEUE_NAME}...`);

        // Prefetch: processa apenas 1 mensagem por vez (útil para integração externa)
        channel.prefetch(1); 

        channel.consume(q.queue, async (msg) => {
            if (msg) {
                let conteudo = JSON.parse(msg.content.toString());
                const routingKeyRecebida = msg.fields.routingKey;

                console.log(`\n📥 [Recebido] Key: ${routingKeyRecebida}`);
               //  console.log( JSON.parse(msg.content.toString() ));  // O worker sabe qual banco conectar
                 console.log( conteudo.data);  // O worker sabe qual banco conectar


                // AQUI ENTRARIA SUA LÓGICA:
                // 1. Conectar no banco do cliente (usando conteudo.metadata.tenant_id)
                // 2. Pegar Token do ML
                // 3. Atualizar ML
                
                // Simula processamento
                await new Promise(r => setTimeout(r, 1000));

                // Confirma processamento (remove da fila)
                channel.ack(msg);
            }
        }, { noAck: false }); // noAck: false exige confirmação manual (channel.ack)

    } catch (e) {
        console.log('ERRO NO CONSUMER', e);
    }

    }
testeConsumercliente()