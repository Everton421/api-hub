import { NextFunction, Request, Response } from "express";

export  function checkToken(req:Request, res:Response, next:NextFunction){
    const header = req.headers['authorization']
    const token =  header && header.split(" ")[1]
  
    if(!token){
      return res.status(401).json({msg: "Acesso negado, token não informado! "})
    }
  
    const secret = process.env.SECRET;
 



    if(token === secret){
      next();
    }else{
    res.status(400).json({msg:"token invalido"})
    }
  
  }
   