import { Router } from "express";
import { versao } from "./app-routes";
import { AuthMiddleware } from "../middleware/AuthMiddlewate/AuthMiddleware";
import { MlIntegrationController } from "../controllers/integration/ml-controlller/ml-integration-controller";
import { MlToolsController } from "../controllers/ml/ml-tools-controller";
import { AnunciosController } from "../controllers/ml/anuncios-controller";
import { MlItensController } from "../controllers/ml/get-itens";
import { MlAccountsController } from "../controllers/ml/get-accounts";

const mlRouter = Router();
 
 
   
 mlRouter.get(`${versao}/ml/integrations/notification`, new MlIntegrationController().callback);
 mlRouter.get(`${versao}/ml/integrations/callback`, new MlIntegrationController().callback );
 mlRouter.post(`${versao}/ml/integrations/finalizeIntegration` , AuthMiddleware , new MlIntegrationController().finalizeIntegration);
 mlRouter.post(`${versao}/ml/integrations/getCode` , AuthMiddleware , new MlIntegrationController().getCode);

// anuncios
 mlRouter.post(`${versao}/ml/anuncios/create`, AuthMiddleware, new AnunciosController().post);
 mlRouter.put(`${versao}/ml/anuncios/update/:id`, AuthMiddleware, new AnunciosController().update);
 mlRouter.delete(`${versao}/ml/anuncios/delete/:id`, AuthMiddleware, new AnunciosController().delete);

  
 // mlRouter.get(`${versao}/ml/anuncios`, AuthMiddleware, new AnunciosController().getAnuncios);
   
  mlRouter.get(`${versao}/ml/anuncios`, AuthMiddleware, new AnunciosController().getAnunciosByParams);

  mlRouter.get(`${versao}/ml/anuncios/:id`, AuthMiddleware, new AnunciosController().getAnuncioById);
 // get ml category
 mlRouter.post(`${versao}/ml/tools/predict-category`, AuthMiddleware, new MlToolsController().predictCategory);
  

 //
 mlRouter.get(`${versao}/ml/accounts/:codigo`, AuthMiddleware, new MlAccountsController().getAccounts);

 export { mlRouter }
