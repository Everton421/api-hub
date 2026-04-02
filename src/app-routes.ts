import fastifySwagger from "@fastify/swagger";
import scalarAPIReference from "@scalar/fastify-api-reference";
import fastify from "fastify";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
import cors from '@fastify/cors';
import fs from 'node:fs';
import path from 'node:path';
import { createCompanyRoute } from "./routes/company/create-company.ts";
import { healthRoute } from "./routes/health/health.ts";
import { loginRoute } from "./routes/login/login.ts";
import { getBrandsRoute } from "./routes/brand/brand.ts";
import { getClientsRoute } from "./routes/client/client.ts";
import { getCompanyRoute } from "./routes/company/get-company.ts";
import locationsRoute from "./routes/location/location.ts";
import paymentMethodsRoute from "./routes/payment-method/payment-method.ts";
import productMovementsRoute from "./routes/product-movement/product-movement.ts";
import productsRoute from "./routes/product/product.ts";
import sectorsRoute from "./routes/sector/sector.ts";
import { getServiceOrderTypesRoute } from "./routes/service-order-types/service-order-types.ts";
import servicesRoute from "./routes/service/service.ts";
import usersRoute from "./routes/user/user.ts";
import { getVehicleRoute } from "./routes/vehicle/vehicle.ts";
import { categoryRoute } from "./routes/category/category.ts";

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
server.register(usersRoute);
server.register(getCompanyRoute);
server.register(categoryRoute);
server.register(getServiceOrderTypesRoute);
server.register(getVehicleRoute);
server.register(sectorsRoute);
server.register(servicesRoute);
server.register(productsRoute);

server.register(getClientsRoute);
server.register(locationsRoute);
server.register(getBrandsRoute);
server.register(paymentMethodsRoute);
server.register(productMovementsRoute);
export { server };
