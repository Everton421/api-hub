
import amqp, { Channel, ChannelModel } from 'amqplib'
import 'dotenv/config';

    let connectionRabbitMQ: ChannelModel | null = null;
    let channel: Channel | null = null
        const exchange = 'template_api'

        export async function connectRabbitMQ(){
            const broker_url = process.env.BROKER_URL;

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
            try {
                    const buffer = Buffer.from(JSON.stringify(data));

                return  channel.publish(exchange, routingKey, buffer);

            } catch (error) {
                console.error("❌ [RabbitMQ] Erro ao tentar publicar:", error);
                return false;
            }
        
        }





/*export class Broker{

    private broker: amqp.ChannelModel | null = null ;
    private channel: Channel | null = null ;

        async connectRabbitMQ(){
            const broker_url = process.env.BROKER_URL;
                if( !broker_url ) throw new Error("process.env.BROKER_URL não configurada ");
                const exchange = 'template_api';
            
                    try {
        

                        this.broker = await amqp.connect( broker_url);

                        this.channel = await this.broker.createChannel();
                        
                            await this.channel.assertExchange( exchange,'topic', { durable : true  } );

                            this.broker.on('close', ()=>{
                                console.warn("[ RabbitMQ ] conexao fechada. Tentando reconectar ...");
                            })

                            this.broker.on('error', ( err )=>{
                                console.error("[ RabbitMQ ] Erro na Conexão: ", err);
                            })

                    } catch (error) {
                                console.error("[ RabbitMQ ] Falha ao conectar. tentando novamente...." );

                                    setTimeout(this.connectRabbitMQ, 5000);
                   }
        }

       
       async   publishExchangeMessage( exchange: string , routingKey: string, data: any): Promise<boolean> {
            if (!this.channel || !this.broker) {
                console.warn("⚠️ [RabbitMQ] Sem conexão ativa. Mensagem não enviada.");
                return false;
            }
            try {
                const buffer = Buffer.from(JSON.stringify(data));
                return this.channel.publish(exchange, routingKey, buffer);
            } catch (error) {
                console.error("❌ [RabbitMQ] Erro ao tentar publicar:", error);
                return false;
            }
        
        }


 }

 */