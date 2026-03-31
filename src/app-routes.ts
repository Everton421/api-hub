import fastifySwagger from "@fastify/swagger";
import scalarAPIReference from "@scalar/fastify-api-reference";
import fastify from "fastify";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";

import cors from '@fastify/cors';
import fs from 'node:fs';
import path from 'node:path';
import { healthRoute } from "./routes/health/health.ts";
import { loginRoute } from "./routes/login/login.ts";
import { createCompanyRoute } from "./routes/company/create-company.ts";

let certPathEnv;
if (process.env.PATH_CERT) certPathEnv = String(process.env.PATH_CERT)

let keyPathEnv
if (process.env.PATH_KEY) keyPathEnv = String(process.env.PATH_KEY)


let dataServer: any = {
  logger: false
}

let httpsOptions = {}
if (keyPathEnv && certPathEnv) {
  const keyPath = path.join(keyPathEnv);
  const certPath = path.join(certPathEnv);

  httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  }
  dataServer.https = httpsOptions;
}

const server = fastify(dataServer).withTypeProvider<ZodTypeProvider>()


if (!server) {
  throw new Error("Falha ao tentar configurar o servidor")

}

server.register(fastifySwagger, {
  openapi: {
    info: {
      title: "API E-commerce",
      version: "1.0.0"
    }
  },
  transform: jsonSchemaTransform,
})


server.register(cors, {
  origin: '*',
  methods: '*'
})
server.register(scalarAPIReference, { routePrefix: '/docs' })

server.setSerializerCompiler(serializerCompiler);

server.setValidatorCompiler(validatorCompiler)

server.register(healthRoute)
server.register(loginRoute);
server.register(createCompanyRoute);

export { server };
