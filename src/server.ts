import { server } from "./app-routes.ts"
import { CreateTablesApi } from "./database/tables-structures/database-api.ts"
import { startMlConsumer } from "./broker-connection/ml-consumer.ts"

 
let port = 8000

if( process.env.PORT_API){
    port = Number(process.env.PORT_API)
}

server.listen({ port: port , host:'0.0.0.0'} , async  ()=> {
    console.log(`Server is running port: ${port}`)
    const createTablesApi = new CreateTablesApi();
        await createTablesApi.createtables();
        await startMlConsumer();
    }
)