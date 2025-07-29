import { Request, Response } from "express";
import { SelectSetor } from "../../models/setor/select";
import { DecodedToken } from "../../services/decodedToken/decodedToken";
import { ISetor } from "../../models/setor/types/setor";
import { UpdateSetor } from "../../models/setor/update";
import { InsertSetor } from "../../models/setor/insert";
import { DateService } from "../../services/dateService";


export class SetorController{


  
    async findAll(req:Request,res:Response){
      let select = new SelectSetor();
  
      if(!req.headers.token ){
        return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
     } 
     let decodToken= DecodedToken(String(req.headers.token))
     let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
  
     let data_recadastro:string ='';
     if(req.query.data_recadastro){
      data_recadastro = String(req.query.data_recadastro);
     }  
  
  
       let  dbName = `\`${empresa}\``;
        let setores:ISetor[]
            try{
                setores =   await   select.findAll(dbName ,data_recadastro )
                 return res.status(200).json(setores);
            }catch(e){ 
                  console.error(e);
                return res.status(500).json({ erro: "Erro ao buscar setores." });
            }
    }
  
  async update(req:Request,res:Response){
    if(!req.headers.token ){
      return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
  } 
  let decodToken= DecodedToken(String(req.headers.token))
  let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
  
  let  dbName = `\`${empresa}\``;

    let update = new UpdateSetor();

  const dateService = new DateService();

          if(!req.body.codigo)      return res.status(400).json({ erro:true, msg: "É necessario informar o codigo para atualizar o setor!"});
          if(!req.body.data_recadastro ){
              req.body.data_recadastro = dateService.obterDataHoraAtual();
          }

        let objInsert = { 
          codigo: req.body.codigo,
          descricao: req.body.descricao,
          data_cadastro: req.body.data_cadastro ,
          data_recadastro: dateService.obterDataHoraAtual() ,
          
      }

      try{
        let result = await update.update(dbName, objInsert  );
            if( result.affectedRows > 0 ){
          return res.status(200).json(
                {
                msg:`Setor ${req.body.codigo } atualizado com sucesso!`
                })
            }
              
          }catch(e){
            return res.status(400).json({ erro:true, msg: `Ocorreu um erro ao atualizar o setor!`});
          }

  
    }
   async insert(req:Request,res:Response){
           if(!req.headers.token ){
             return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
          } 
          let decodToken= DecodedToken(String(req.headers.token))
          let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
          let  dbName = `\`${empresa}\``;
         
            let insert = new InsertSetor();
            let dateService = new DateService();
         
             
                if(!req.body.descricao)         return res.status(400).json({ erro:true, msg: "É necessario informar a descrição para registrar o setor!"});
                if (!req.body.data_cadastro) req.body.data_cadastro = dateService.obterDataAtual(); 

                req.body.data_recadastro = dateService.obterDataHoraAtual();
       
               
              try{
                   let resultinsertId  = await insert.cadastrarSetor(dbName, req.body);
                     return res.status(200).json(
                       {
                        "codigo"              : resultinsertId.insertId, 
                       "descricao"            : req.body.descricao,
                       "data_cadastro"        : req.body.data_cadastro,
                       "data_recadastro"      : req.body.data_recadastro,
                     })
                     
                 }catch(e){
                   return res.status(400).json({ erro:true, msg: `Ocorreu um erro ao cadastrar setor !`});
         
                  }
          
         }
   
}