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
import { getUserRoute } from "./routes/users/get-users.ts";
import { getCompanyRoute } from "./routes/company/get-company.ts";
import { getCategoryRoute } from "./routes/category/get-category.ts";
import { getServiceOrderTypesRoute } from "./routes/service-order-types/service-order-types.ts";
import { getVehicleRoute } from "./routes/vehicle/vehicle.ts";
import { getSectorsRoute } from "./routes/sector/sector.ts";
import { getServicesRoute } from "./routes/service/service.ts";
import { getProductsRoute } from "./routes/product/product.ts";
import { getClientsRoute } from "./routes/client/client.ts";
import { getUsersRoute } from "./routes/user/user.ts";
import { getLocationsRoute } from "./routes/location/location.ts";
import { getBrandsRoute } from "./routes/brand/brand.ts";
import { getPaymentMethodsRoute } from "./routes/payment-method/payment-method.ts";
import { getProductMovementsRoute } from "./routes/product-movement/product-movement.ts";

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
server.register(getUserRoute);
server.register(getCompanyRoute);
server.register(getCategoryRoute);
server.register(getServiceOrderTypesRoute);
server.register(getVehicleRoute);
server.register(getSectorsRoute);
server.register(getServicesRoute);
server.register(getProductsRoute);
server.register(getClientsRoute);
server.register(getUsersRoute);
server.register(getLocationsRoute);
server.register(getBrandsRoute);
server.register(getPaymentMethodsRoute);
server.register(getProductMovementsRoute);
export { server };
