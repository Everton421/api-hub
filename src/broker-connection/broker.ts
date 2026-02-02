
import amqp, { Channel, ChannelModel } from 'amqplib'
import 'dotenv/config';

    let connectionRabbitMQ: ChannelModel | null = null;
    let channel: Channel | null = null
        const exchange = process.env.EXCHANGE_NAME

        export async function connectRabbitMQ(){
            const broker_url = process.env.BROKER_URL;
                if(!exchange ) throw new Error("process.env.EXCHANGE_NAME não configurada ");
                if( !broker_url ) throw new Error("process.env.BROKER_URL não configurada ");
        
            try{
                 
                 connectionRabbitMQ = await amqp.connect( broker_url);
                 channel = await connectionRabbitMQ.createChannel();
                    await channel.assertExchange( exchange, 'topic', { durable:true } )

                     connectionRabbitMQ.on('close', ()=>{
                                console.warn("[ RabbitMQ ] conexao fechada. Tentando reconectar ...");
                            })

                     connectionRabbitMQ.on('error', ( err )=>{
                                console.error("[ RabbitMQ ] Erro na Conexão: ", err);
                            })
                   }catch(e){
                    console.log(" [ RabbitMQ] Falha ao conectar. Tentando novamente...")
                        setTimeout(connectRabbitMQ, 5000)
                    }

                }


export async  function publishExchangeMessage(   routingKey: string, data: any): Promise<boolean> {
            if (!channel || !connectionRabbitMQ) {
                console.warn("⚠️ [RabbitMQ] Sem conexão ativa. Mensagem não enviada.");
                return false;
            }
                if(!exchange ) throw new Error("process.env.EXCHANGE_NAME não configurada ");

            try {
                    const buffer = Buffer.from(JSON.stringify(data));

                return  channel.publish(exchange, routingKey, buffer,
                    {
                        persistent: true
                    }
                );

            } catch (error) {
                console.error("❌ [RabbitMQ] Erro ao tentar publicar:", error);
                return false;
            }
        
        }





  