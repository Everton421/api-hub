import fastifySwagger from "@fastify/swagger";
import scalarAPIReference from "@scalar/fastify-api-reference";
import fastify from "fastify";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
 
import fs from 'node:fs';
import path from 'node:path';
import { healthRoute } from "./routes/health/health.ts";
import { loginRoute } from "./routes/login/login.ts";
import { getBrandsRoute } from "./routes/brand/brand.ts";
import { getClientsRoute } from "./routes/client/client.ts";
import locationsRoute from "./routes/location/location.ts";
import paymentMethodsRoute from "./routes/payment-method/payment-method.ts";
import productMovementsRoute from "./routes/product-movement/product-movement.ts";
import productsRoute from "./routes/product/product.ts";
import productSectorRoute from "./routes/product-sector/product-sector.ts";
import sectorsRoute from "./routes/sector/sector.ts";
import { getServiceOrderTypesRoute } from "./routes/service-order-types/service-order-types.ts";
import servicesRoute from "./routes/service/service.ts";
import {usersRoute} from "./routes/user/user.ts";
import { getVehicleRoute } from "./routes/vehicle/vehicle.ts";
import { categoryRoute } from "./routes/category/category.ts";
import { photosRoute } from "./routes/photo/photo.ts";
import { ordersRoute } from "./routes/order/order.ts";
 
import   cors   from '@fastify/cors'
import companyRoute from "./routes/company/company.ts";

const server = fastify( ).withTypeProvider<ZodTypeProvider>()


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


  server.register(cors,{
   origin:'*',
   methods:['GET','POST','PUT','DELETE','PATCH', 'OPTIONS'],
   allowedHeaders:'*',
   credentials: true,
   exposedHeaders:'*'

  })
server.register(scalarAPIReference, { routePrefix: '/docs' })

server.setSerializerCompiler(serializerCompiler);

server.setValidatorCompiler(validatorCompiler)



server.register(healthRoute)
server.register(loginRoute);

 server.register(usersRoute);
  server.register(companyRoute);
 server.register(categoryRoute);
 server.register(getServiceOrderTypesRoute);
 server.register(getVehicleRoute);
 server.register(sectorsRoute);
 server.register(servicesRoute);
 server.register(productsRoute);
 server.register(productSectorRoute);
 
 server.register(getClientsRoute);
 server.register(locationsRoute);
 server.register(getBrandsRoute);
 server.register(paymentMethodsRoute);
 server.register(productMovementsRoute);
 server.register(photosRoute);
 server.register(ordersRoute);
 
export { server };
