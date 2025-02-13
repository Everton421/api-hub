import express,{NextFunction, Request,Response} from 'express';
import swaggerUi from 'swagger-ui-express';

import "express-async-errors";
import cors from 'cors';
const https = require('https');
const fs = require('fs');
import 'dotenv/config';
import swaggerDocs from './swagger.json';

import { router, versao } from './routes';
import { conn } from './database/databaseConfig';

        const app = express();

        // Configuração do CORS
            const corsOptions = {
                origin: '*', // Permitir todas as origens. Para maior segurança, considere especificar as origens permitidas.
                methods: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
                allowedHeaders: '*',
                credentials: true, // Permitir credenciais
            };


            app.use(cors( corsOptions));

                //process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        //app.use(`${versao}/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerDocs))

        app.use(express.json());
        app.use(router)


        app.use(
                (err:Error, req:Request, res:Response, next:NextFunction)=>{
                    if(err instanceof Error){
                        return res.status(400).json({
                            error: err.message,
                        })
                    }
                    res.status(500).json({
                        status:'error ',
                        messsage: 'internal server error.'
                    })
                })

                const PORT_API = process.env.PORT_API;
                 app.listen(PORT_API,()=> console.log('app rodando porta ',PORT_API))
    //  https.createServer({
    //     cert: fs.readFileSync('/etc/letsencrypt/live/intersig.com.br-0003/fullchain.pem', 'utf8'),
    //     key: fs.readFileSync('/etc/letsencrypt/live/intersig.com.br-0003/privkey.pem', 'utf8'),
    //    // ca: fs.readFileSync('/etc/letsencrypt/live/intersig.com.br-0003/chain.pem', 'utf8') // Certificado da autoridade certificadora, se necessário
//
    // }, app).listen(3000,()=> console.log('app rodando porta https 3000'))

