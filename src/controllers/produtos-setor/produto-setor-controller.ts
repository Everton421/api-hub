import { Request, Response } from "express";
import { Select_produtos } from "../../models/produtos/select";
import { ProdutoBanco, ProdutoCompleto } from "../../types/produto/produto";
import { InsertProdutos } from "../../models/produtos/insert";
import { conn } from "../../database/databaseConfig";
import { UpdateProdutos } from "../../models/produtos/update";
import { marca } from "../../types/marcaProduto/marca";
import { categoria } from "../../types/categoriaProduto/categoria";
import { DateService } from "../../services/dateService";
import { DecodedToken } from "../../services/decodedToken/decodedToken";
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

 


async insert(req:Request,res:Response){
    if(!req.headers.token ){
      return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
   } 
   let decodToken= DecodedToken(String(req.headers.token))
   let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');

  let  dbName = `\`${empresa}\``;
  let produtos:ProdutoBanco[]

    let select = new Select_produtos();
    let insert = new InsertProdutos();
    let dateService = new DateService();


          if(!req.body.id)    req.body.id = 0 
          if(!req.body.preco)    req.body.preco = 0 
          if(!req.body.estoque)    req.body.estoque = 0 

          if(!req.body.descricao)         return res.status(400).json({ erro:true, msg: "É necessario informar a descrição para registrar o produto!"});
          if(!req.body.num_fabricante)   req.body.num_fabricante =''  //return res.status(200).json({ erro:true, msg: "É necessario informar o codigo de barras para registrar o produto!"});
          if(!req.body.num_original)     req.body.num_original =''  //return res.status(200).json({ erro:true, msg: "É necessario informar a referência  para registrar o produto!"});
          
          if(!req.body.grupo || !req.body.grupo.codigo ) req.body.grupo =  { "codigo":0} ; 
          if(!req.body.marca || !req.body.marca.codigo ) req.body.marca  = { "codigo":0}; 

          if(!req.body.origem) req.body.origem = 0;     
          if(!req.body.sku)              req.body.sku =''  //return res.status(200).json({ erro:true, msg: "É necessario informar o sku  para registrar o produto!"});
          if (!req.body.ativo)   req.body.ativo = 'S'     // return res.status(200).json({ erro:true, msg: "É necessario informar o status do produto !"});
          if (!req.body.class_fiscal) req.body.class_fiscal= '0000.00.00'    //return res.status(200).json({ erro:true, msg: "É necessario informar o ncm  para registrar o produto!"});
          if (!req.body.cst) req.body.cst='00'   //return res.status(200).json({ erro:true, msg: "É necessario informar  cst para registrar o produto!"});
          if(!req.body.tipo) req.body.tipo = 0
          if(!req.body.data_cadastro ) req.body.data_cadastro = dateService.obterDataAtual(); 
          if(!req.body.data_recadastro ) req.body.data_recadastro = dateService.obterDataHoraAtual();

          if(!req.body.observacoes1) req.body.observacoes1 =  ""
          if(!req.body.observacoes2) req.body.observacoes2 = "" 
          if(!req.body.observacoes3) req.body.observacoes3 = "" 

          let produto =  {
            "codigo"          : req.body.codigo,
            "id"              : req.body.id,
            "estoque"         : req.body.estoque,
            "preco"           : req.body.preco,
            "grupo"           : req.body.grupo.codigo,
            "origem"          : req.body.origem,
            "descricao"       : req.body.descricao,
            "num_fabricante"  : req.body.num_fabricante, // num-fabricante gtim/codigo de barros 
            "num_original"    : req.body.num_original,   //referencia 
            "sku"             : req.body.sku,
            "marca"           : req.body.marca.codigo,
            "ativo"           : req.body.ativo,
            "class_fiscal"    : req.body.class_fiscal,
            "cst"             : req.body.cst,
            "data_recadastro" : req.body.data_recadastro,
            "data_cadastro"   : req.body.data_cadastro,
            "observacoes1"    : req.body.observacoes1,
            "observacoes2"    : req.body.observacoes2,
            "observacoes3"    : req.body.observacoes3,
            "tipo"            : req.body.tipo 
          }   
    
      try{
            let resultinsertId:any = await insert.insert(dbName, produto);
              return res.status(200).json(
                {
                "codigo": resultinsertId.insertId,
                "id"              : req.body.id,
                "estoque"         : req.body.estoque,
                "preco"           : req.body.preco,
                "grupo"           : req.body.grupo,
                "origem"          : req.body.origem,
                "descricao"       : req.body.descricao,
                "num_fabricante"  : req.body.num_fabricante, // num-fabricante gtim/codigo de barros 
                "num_original"    : req.body.num_original,   //referencia 
                "sku"             : req.body.sku,
                "marca"           : req.body.marca,
                "ativo"           : req.body.ativo,
                "class_fiscal"    : req.body.class_fiscal,
                "cst"             : req.body.cst,
                "data_recadastro" : req.body.data_recadastro,
                "data_cadastro"   : req.body.data_cadastro,
                "observacoes1"    : req.body.observacoes1,
                "observacoes2"    : req.body.observacoes2,
                "observacoes3"    : req.body.observacoes3,
                "tipo"            : req.body.tipo 
              })
            
              
          }catch(e){
            return res.status(400).json({ erro:true, msg: `Ocorreu um erro ao cadastrar o produto!`});

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

}

 
   