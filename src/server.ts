import { server } from "./app-routes.ts"

 
let port = 8000

if( process.env.PORT_API){
    port = Number(process.env.PORT_API)
}

server.listen({ port: port , host:'0.0.0.0'} , ()=> console.log(`Server is running port: ${port}`))