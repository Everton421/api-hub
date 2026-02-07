import cors from 'cors';
import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import "express-async-errors";
import fs from 'fs';
import https from 'https';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from './swagger.json';

import { router, versao } from './routes/app-routes';
import { mlRouter } from './routes/ml-routes';


const app = express();

// Configuração do CORS
const corsOptions = {
    origin: '*', // Permitir todas as origens. Para maior segurança, considere especificar as origens permitidas.
    methods: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
    allowedHeaders: '*',
    credentials: true, // Permitir credenciais
};


app.use(cors(corsOptions));

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const optionsSwagger = {
    swaggerOptions: {
        // ---> Adicione esta linha <---
        docExpansion: 'none'
        // ---> Fim da linha adicionada <---
    }
}

app.use(`${versao}/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerDocs, optionsSwagger))

app.use(express.json());
app.use(router);
app.use(mlRouter);

app.use(
    (err: Error, req: Request, res: Response, next: NextFunction) => {
        if (err instanceof Error) {
            return res.status(400).json({
                error: err.message,
            })
        }
        res.status(500).json({
            status: 'error ',
            messsage: 'internal server error.'
        })
    })

const PORT_API = process.env.PORT_API || 3000;
//   app.listen(PORT_API,()=> console.log('app rodando porta ',PORT_API))

const cert = process.env.PATH_CERT_CERT || ''
const key = process.env.PATH_CERT_KEY || ''
https.createServer({
    cert: fs.readFileSync(cert, 'utf8'),
    key: fs.readFileSync(key, 'utf8'),
    // ca: fs.readFileSync('/etc/letsencrypt/live/intersig.com.br-0003/chain.pem', 'utf8') // Certificado da autoridade certificadora, se necessário

}, app).listen(PORT_API, () => console.log('app rodando porta https 3000'))


//PATH_CERT_KEY='C:\Users\usuario\key.pem'
//PATH_CERT_CERT='C:\Users\usuario\cert.pem'