import { Request, Response } from "express";
import { exchangeCodeForToken } from "../../../services/integration/mercadolivre-integration/ml-auth-service";

export class MlController{

 async   callback(req:Request, res:Response ){
 
 
   exchangeCodeForToken(req.query.code)
//return res.json( exchangeCodeForToken(req.query.code))
}

 
}
 