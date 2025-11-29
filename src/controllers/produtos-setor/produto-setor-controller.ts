import { Request, Response } from "express";
import { Select_produtos } from "../../models/produtos/select";
import { ProdutoBanco, ProdutoCompleto } from "../../types/produto/type-produto";
import { InsertProdutos } from "../../models/produtos/insert";
import { conn } from "../../database/databaseConfig";
import { UpdateProdutos } from "../../models/produtos/update";
import { marca } from "../../types/marcaProduto/type-marca";
import { categoria } from "../../types/categoriaProduto/type-categoria";
import { DateService } from "../../services/date-service/dateService";
import { DecodedToken } from "../../services/decoded-token/decodedToken";
import { SelectProdutoSetor } from "../../models/produto-setor/select";
import { IProdutoSetor } from "../../models/produto-setor/types/produto-setor";
import { UpdateProdutoSetor } from "../../models/produto-setor/update";
import { InsertProdutoSetor } from "../../models/produto-setor/insert";
 

export class ProdutoSetorController{
 

  async findAll(req:Request,res:Response){
    let select = new SelectProdutoSetor();

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
      let produtoSetor:IProdutoSetor[]
          try{
              produtoSetor =   await   select.findAll(dbName ,data_recadastro )
               return res.status(200).json(produtoSetor);
          }catch(e){ 
                console.error(e);
              return res.status(500).json({ erro: "Erro ao buscar os produtos no setor." });
          }
  }

/*
async findByParam(req:Request,res:Response){

  if(!req.headers.token ){
    return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
 } 
 let decodToken= DecodedToken(String(req.headers.token))
 let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
 let  dbName = `\`${empresa}\``;

 
    let select = new SelectProdutoSetor();
    let responseProdutos;

  try{
  
    if( req.query   ){
      let aux   = req.query 
      responseProdutos =   await   select.findByDescription(dbName,  aux );
        return res.status(200).json( responseProdutos );

    }
  }catch(e){ 
    console.error(e);
    return res.status(400).json({ erro: true, msg: "Erro ao buscar produtos." });
  }


}
*/

async findByCode(req:Request,res:Response){

  if(!req.headers.token ){
    return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
 } 
 let decodToken= DecodedToken(String(req.headers.token))
 let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
 
 let  dbName = `\`${empresa}\``;
    let select = new SelectProdutoSetor();


  let responseProdutos;

  const parametro = Number(req.params.produto);
  
  try{
    responseProdutos =   await   select.findByCode(dbName, parametro  )
     return res.status(200).json( responseProdutos );

}catch(e){ 
      console.error(e);
    return res.status(400).json({ erro: "Erro ao buscar produtos." });
}
}

async findBysProdSector(req:Request,res:Response){

  if(!req.headers.token ){
    return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
 } 
 let decodToken= DecodedToken(String(req.headers.token))
 let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
 
 let  dbName = `\`${empresa}\``;
    let select = new SelectProdutoSetor();


  let responseProdutos;

  const produto = Number(req.query.produto);
    const setor = Number(req.query.setor);
        if( !req.query.produto){
        return res.status(400).json({erro:true, msg:"É necessario informar um produto!"});   
    }
    if( !req.query.setor){
        return res.status(400).json({erro:true, msg:"É necessario informar um setor!"});   
    }

  try{
    responseProdutos =   await   select.findByProdSector(dbName,produto, setor   )
     return res.status(200).json( responseProdutos );

}catch(e){ 
      console.error(e);
    return res.status(400).json({ erro: "Erro ao buscar produtos." });
}
}


async updateSaldo(req:Request,res:Response){
  if(!req.headers.token ){
    return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
 } 
 let decodToken= DecodedToken(String(req.headers.token))
 let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
 
 let  dbName = `\`${empresa}\``;

  let update = new UpdateProdutoSetor();
   let insert = new InsertProdutoSetor();

 const dateService = new DateService();

        if(!req.body.produto)      return res.status(400).json({ erro:true, msg: "É necessario informar o codigo para atualizar o produto!"});
        if(!req.body.estoque)    req.body.estoque = 0 
         if(!req.body.setor)             return res.status(400).json({ erro:true, msg: "É necessario informar o codigo da marca para registrar o produto!"});
        if(!req.body.local_produto) req.body.local_produto ='';
        if(!req.body.local1_produto) req.body.local1_produto ='';
        if(!req.body.local2_produto) req.body.local2_produto ='';
        if(!req.body.local3_produto) req.body.local3_produto ='';
        if(!req.body.local4_produto) req.body.local4_produto ='';

      let objInsert = { 
        produto:req.body.setor,
        estoque:req.body.estoque,
        setor:req.body.setor,
        data_recadastro: dateService.obterDataHoraAtual() ,
        local_produto: req.body.local_produto,
        local1_produto: req.body.local1_produto,
        local2_produto: req.body.local2_produto,
        local3_produto: req.body.local3_produto,
        local4_produto: req.body.local4_produto 
     }

     try{
      let result = await insert.insertUpateProdutoSetor(dbName, objInsert  );
          if( result.affectedRows > 0 ){
        return res.status(200).json(
              {
               msg:'saldo atualizado com sucesso!'
              })
          }
            
        }catch(e){
          return res.status(400).json({ erro:true, msg: `Ocorreu um erro ao atualizar o  saldo do produto!`});
         }

 
}

  async updateOffline(req:Request,res:Response){
      if(!req.headers.token ){
          return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
      } 
      let decodToken= DecodedToken(String(req.headers.token))
      let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
      
      let  dbName = `\`${empresa}\``;

        let update = new UpdateProdutoSetor();
        let insert = new InsertProdutoSetor();
        let select = new SelectProdutoSetor();
        
      const dateService = new DateService();
        if(Array.isArray(req.body)   ){
          if(req.body.length > 0 ){

              let dados:IProdutoSetor[] = req.body;
                //console.log(req.body)

                    let updatedItens = []
               
                for( let i of dados){
                     let verifyItem: IProdutoSetor[]=[];
                            
                            if(!i.setor) return res.status(400).json({erro:true, msg: "Não foi informado o setor "})
                            if(!i.produto) return res.status(400).json({erro:true, msg: "Não foi informado o produto "})
                            if(!i.estoque) return res.status(400).json({erro:true, msg: "Não foi informado o estoque "})

                            verifyItem = await select.findByProdSector(dbName, i.produto, i.setor);
                          
                              let prodSector = verifyItem[0];
                              if( verifyItem.length > 0){
                                  if(  new Date(i.data_recadastro) >  new Date(prodSector.data_recadastro) ){
                                        console.log( new Date(i.data_recadastro) ,' > ', new Date(prodSector.data_recadastro) )
                                       console.log(`atualizando saldo do produto : ${i.produto} saldo: ${i.estoque} ` )

                                     let aux = await insert.upateProdutoSetor(dbName,i)
                                    if(aux.serverStatus > 0 ) updatedItens.push({produto:i.produto}) 
                                }  
                              }else{
                                console.log(`registrando produto : ${i.produto}`)

                                 let aux = await insert.cadastrarProdutoSetor(dbName,i)
                                    if(aux.serverStatus > 0 ) updatedItens.push({produto:i.produto}) 
                              }
                              
                    }
                              return res.status(200).json({ok:true, itens: updatedItens})
                    
               }
           } else{
          return res.status(400).json({erro:true, msg:"É necessario que seja fornecido um array com os itens a serem atualizados!"});   
           }
      }
}

 
   