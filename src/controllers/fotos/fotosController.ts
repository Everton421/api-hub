import { Request, Response } from "express";
import { Select_fotos } from "../../models/fotos/select";

export class fotosController{

    async buscaGeral(req:Request ,res: Response){
           let empresa:any   = req.headers.cnpj 

           let select = new Select_fotos();
                 if(!req.headers.cnpj ){
                     return res.status(200).json({erro:"É necessario informar a empresa "});   
                  } 
                  let headerCnpj:any  = empresa.replace(/\D/g, '');
                  let  dbName = `\`${headerCnpj}\``;

            try{
                    let resultado:any = await select.busca_geral(dbName);
                    if( resultado.length > 0 ){
                        return res.status(200).json(resultado)
                    }else{
                        return res.status(200).json({ erro: "Nenhuma foto encontrada." });
                    }
        
             }catch(e){
                console.log("ocorreu um erro ao consultar as fotos dos produtos", e)
                return res.status(200).json({erro:true, msg:"ocorreu um erro ao consultar as fotos dos produtos"})
             }
    }
}