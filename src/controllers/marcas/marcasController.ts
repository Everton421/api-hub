import { Request, Response } from "express";
import { Select_clientes } from "../../models/cliente/select";
import { Insert_clientes } from "../../models/cliente/insert";
import { Cliente } from "../../models/cliente/interface_cliente";  
import { Select_Categorias } from "../../models/categorias/select";
import { Insert_Categorias } from "../../models/categorias/insert";
import { Select_Marcas } from "../../models/marcas/select";
import { Insert_Marcas } from "../../models/marcas/insert";

export class MarcasController{

    formatarDataEhora(data: string): string | null {
        const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
        if (!regex.test(data)) {
            return null;
          }
         return data;
         }
           formatarData(data:any) {
            const dia = String(data.getDate()).padStart(2, '0');
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            const ano = data.getFullYear();
            return `${ano}-${mes}-${dia}`;
        }
         obterDataAtual() {
            const dataAtual = new Date();
            const dia = String(dataAtual.getDate()).padStart(2, '0');
            const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
            const ano = dataAtual.getFullYear();
            return `${ano}-${mes}-${dia}`;
        }
           obterDataHoraAtual() {
            const dataAtual = new Date();
            const dia = String(dataAtual.getDate()).padStart(2, '0');
            const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
            const ano = dataAtual.getFullYear();
            const hora = dataAtual.getHours();
            const minuto = dataAtual.getMinutes();
            const segundos = dataAtual.getSeconds();
            return `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundos}`;
        }

 
    async buscaGeral( req:Request,res:Response  ){
        let empresa:any   = req.headers.cnpj 
        let select = new Select_Marcas();
        let insert = new Insert_Marcas();

        if(!req.headers.cnpj ){
            return res.status(200).json({erro:"É necessario informar a empresa "});   
         } 
           
         let headerCnpj:any  = empresa.replace(/\D/g, '');
    
         let  dbName = `\`${headerCnpj}\``;
         
         let limit:number = 20;

         if(req.query.limit){
          limit  = Number(req.query.limit)
        }

         try{

            let resultado:any = await select.busca_geral(dbName, limit );
            if( resultado.length > 0 ){
                return res.status(200).json(resultado)
            }else{
                return res.status(404).json({ erro: "Nenhuma marca encontrada." });
            }

     }catch(e){
        console.log("ocorreu um erro ao consultar as marcas", e)
        return res.status(200).json({erro:true, msg:"ocorreu um erro ao consultar as marcas"})
     }
   
         
    
    }

    async buscaPorDescricao(req:Request,res:Response){
        let empresa:any   = req.headers.cnpj 
 
        let select = new Select_Marcas();
        let insert = new Insert_Marcas();

        if(!req.headers.cnpj ){
            return res.status(200).json({erro:true, msg:"É necessario informar a empresa "});   
         } 
         
          let headerCnpj:any  = empresa.replace(/\D/g, '');
         let  dbName = `\`${headerCnpj}\``;
         let descricao   = String(req.query.descricao) 
         let codigo:number = Number(req.query.codigo);
         let id:number = Number(req.query.id);

         let limit:number = 20;
            
         if(  req.query.limit ){
            limit = 20
         }

         if(req.query.descricao){
            try{
                    let resultado:any = await select.busca_por_descricao( dbName,descricao , limit);
                        return res.status(200).json(resultado)
            }catch(e){
                console.log("ocorreu um erro ao consultar as marcas", e)
            return res.status(200).json({erro:true, msg:"ocorreu um erro ao consultar as marcas"})
            }
        }

        if(req.query.codigo){
            try{
                let resultado:any = await select.busca_por_codigo( dbName,codigo , limit);
                    return res.status(200).json(resultado)
        }catch(e){
            console.log("ocorreu um erro ao consultar as marcas", e)
        return res.status(200).json({erro:true, msg:"ocorreu um erro ao consultar as marcas"})
        }
       }

       if(req.query.id){
        try{
            let resultado:any = await select.buscaPorId( dbName,id , limit);
                return res.status(200).json(resultado)
        }catch(e){
            console.log("ocorreu um erro ao consultar as marcas", e)
        return res.status(200).json({erro:true, msg:"ocorreu um erro ao consultar as marcas"})
        }
     }
     
     if( !codigo || ! id || !descricao){
        try{
            let resultado:any = await select.busca_geral( dbName, limit);
                return res.status(200).json(resultado)
        }catch(e){
            console.log("ocorreu um erro ao consultar as marcas", e)
        return res.status(200).json({erro:true, msg:"ocorreu um erro ao consultar as marcas"})
        }
        
     }

     }



     async buscaPorCodigo(req:Request,res:Response){
        let empresa:any   = req.headers.cnpj 
 
        let select = new Select_Marcas();
        let insert = new Insert_Marcas();

        if(!req.headers.cnpj ){
            return res.status(200).json({erro:true, msg:"É necessario informar a empresa "});   
         } 
         
          let headerCnpj:any  = empresa.replace(/\D/g, '');
         let descricao = req.params.descricao

         let  dbName = `\`${headerCnpj}\``;
         
         
         let limit:number = 20;
            
         if(  req.query.limit ){
            limit = 20
         }

         try{

                let resultado:any = await select.busca_por_descricao( dbName,descricao , limit);
   
                    return res.status(200).json(resultado)
         
         }catch(e){
            console.log("ocorreu um erro ao consultar as marcas", e)
        return res.status(200).json({erro:true, msg:"ocorreu um erro ao consultar as marcas"})

         }
     }


async cadastrar(req:Request,res:Response){
    let obj = new MarcasController();
    let cnpj:any   = req.headers.cnpj 
 
    let select = new Select_Marcas();
    let insert = new Insert_Marcas();
 
            let postMarca:any = req.body; 
           
             let  empresa = `\`${cnpj}\``;
          
            if(!postMarca.id)  postMarca.id =  "0";
            if(!postMarca.descricao)  return res.status(200).json( { erro:true, msg:`E necessario informar a descricao da marca!`}) 
            if(!postMarca.data_cadastro ) postMarca.data_cadastro = obj.obterDataAtual();
            if(!postMarca.data_recadastro ) postMarca.data_recadastro = obj.obterDataHoraAtual();
 
                let limit = 1;
                
              let validMarca:any = await select.busca_por_descricao( empresa, postMarca.descricao, limit  )
    
        if( validMarca.length > 0  )  return  res.status(200).json({ erro:true, msg:`A marca ${postMarca.descricao} ja foi cadastrada!`})
           
             let responseMarca:any;
                     try{    
                           responseMarca = await insert.cadastrar(empresa, postMarca)
                    
                         if( responseMarca.insertId > 0 ){
                             return res.status(200).json({ 
                                  "codigo":responseMarca.insertId,
                                  "descricao":postMarca.descricao,
                                  "data_cadastro":postMarca.data_cadastro,
                                  "data_recadastro":postMarca.data_recadastro,
                                 })
                         }
                     }catch(e){
                             console.log(e);
                             return res.status(200).json({erro:"ocorreu um erro ao tentar registrar a marca"})
                     }

  }
	
        

}



 
