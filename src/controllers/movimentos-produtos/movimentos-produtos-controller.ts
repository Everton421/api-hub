import { Request, Response } from "express";
import { DateService } from "../../services/date-service/dateService";
import { DecodedToken } from "../../services/decoded-token/decodedToken";
import { SelectMovimentosProdutos } from "../../models/movimentos-produtos/select";
import { IMovimentosProdutos } from "../../models/movimentos-produtos/types/movimentos_produtos";
import { InsertMovimentosProdutos } from "../../models/movimentos-produtos/insert";
import { SelectSetor } from "../../models/setor/select";
import { SelectLocais } from "../../models/locais/select";
import { publishMessage } from "../../services/broker/publish-message";
 
type newMoviment = Omit<IMovimentosProdutos ,'codigo'>
export class MovimentosProdutosController{
 

  async findAll(req:Request,res:Response){
    let select = new SelectMovimentosProdutos();

    if(!req.headers.token ){
      return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
   } 
   let decodToken= DecodedToken(String(req.headers.token))
   let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');

   let data_recadastro:string ='';
   if(req.query.data_recadastro){
    data_recadastro = String(req.query.data_recadastro);
   }  

    let usuario = 0 
    if( req.query.usuario){
      usuario = Number(req.query.usuario);
    }


     let  dbName = `\`${empresa}\``;
      let movimentos:IMovimentosProdutos[]
          try{
              movimentos =   await   select.findAll(dbName , { data_recadastro:data_recadastro, usuario:usuario} )
               return res.status(200).json(movimentos);
          }catch(e){ 
                console.error(e);
              return res.status(400).json({ erro: "Erro ao buscar os movimentos dos produtos." });
          }
  }

/** possivel fazer a busca por :
 *     setor, produto,  quantidade, tipo, 
 *      historico, data_recadastro,
 *  obs. os items usados para filtrar precisam estar nos params da requisição
 * @param req 
 * @param res 
 * @returns 
 */
async findByParam(req:Request,res:Response){

  if(!req.headers.token ){
    return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
 } 
 let decodToken= DecodedToken(String(req.headers.token))
 let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
 let  dbName = `\`${empresa}\``;

        let select = new SelectMovimentosProdutos();
        let responseProdutos;
  try{
  
    if( req.query   ){
      let aux   = req.query 
      responseProdutos =   await   select.findByParam(dbName,  aux );
        return res.status(200).json( responseProdutos );
    }
  }catch(e){ 
    console.error(e);
    return res.status(400).json({ erro: true, msg: "Erro ao buscar os movimentos." });
  }


}


 

async insert(req:Request,res:Response){
    if(!req.headers.token ){
      return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
   } 
   let decodToken= DecodedToken(String(req.headers.token))
  if( !decodToken.payload?.cnpj ) return res.status(400).json({erro:true, msg:"Identifiador unico da empresa nao foi informado"});    

   let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');

  let  dbName = `\`${empresa}\``;
   let insert = new InsertMovimentosProdutos();
   let dateService = new DateService();

if(!req.body.codigo) return res.status(400).json({ erro:true, msg: "é necessario informar o codigo para registrar  movimento!"}); 
if(!req.body.setor) return res.status(400).json({ erro:true, msg: "é necessario informar um setor para registrar o movimento!"}); 
if(!req.body.produto) return res.status(400).json({ erro:true, msg: "é necessario informar um produto para registrar o movimento! "}); 
if(!req.body.quantidade) return res.status(400).json({ erro:true, msg: "é necessario informar a quantidade para registrar o movimento! "}); 
if(!req.body.ent_sai)   return res.status(400).json({ erro:true, msg: "é necessario informar se o movimento é do tipo saida = ent_sai:S ou  entrada = ent_sai:E "}); 
if(!req.body.tipo) return res.status(400).json({ erro:true, msg: "é necessario informar o tipo do movimento para registrar o movimento! "}); 
if(!req.body.usuario) return res.status(400).json({ erro:true, msg: "é necessario informar o usuario responsavel pelo movimento! "}); 
 if(!req.body.unidade_medida )  req.body.unidade_medida = 'UND';

if(!req.body.historico  ){
  req.body.historico =''
}  
          let movimento: IMovimentosProdutos  = 
           {  
            codigo:req.body.codigo,
             setor: req.body.setor,
             produto: Number(req.body.produto),
             unidade_medida: req.body.unidade_medida,
             quantidade: String(req.body.quantidade),
             tipo: String(req.body.tipo),
             historico: String(req.body.historico),
             data_recadastro: dateService.obterDataHoraAtual(),
             ent_sai: req.body.ent_sai,
             usuario: req.body.usuario
          }   
    
      try{
            let resultinsertId:any = await insert.insertMovimentos(dbName, movimento);

        const item =    {
                  id:resultinsertId.insertId,
                  codigo:resultinsertId.insertId,
                  setor: movimento.setor,
                  produto: movimento.produto,
                  unidade_medida: movimento.unidade_medida,
                  quantidade: movimento.quantidade,
                  tipo: movimento.tipo,
                  historico: movimento.historico,
                  data_recadastro: movimento.data_recadastro,
                  ent_sai: req.body.ent_sai,
                  usuario: req.body.usuario
              }
           await publishMessage( empresa , 'movimentosprodutos.inserido', item)

              return res.status(200).json(item)
            
              
          }catch(e){
            return res.status(400).json({ erro:true, msg: `Ocorreu um erro ao registrar o movimento!`});

          }

  
  }

   
 async updateOffline(req:Request,res:Response){
    if(!req.headers.token ){
      return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
   } 
   let decodToken= DecodedToken(String(req.headers.token))
  if( !decodToken.payload?.cnpj ) return res.status(400).json({erro:true, msg:"Identifiador unico da empresa nao foi informado"});    

   let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');

  let  dbName = `\`${empresa}\``;
   let insert = new InsertMovimentosProdutos();
   let select = new SelectMovimentosProdutos();



      if(Array.isArray(req.body)   ){
            if(req.body.length > 0 ){
        
               let dados:IMovimentosProdutos[] = req.body;
                let  itensProcessados = []
                for( let i of dados){
                    if(!i.codigo )  return res.status(400).json({ erro:true, msg: "nao foi informado o codigo do movimento"})   
                    if(!i.setor)    return res.status(400).json({ erro:true, msg:"nao foi informado o  setor relacionado ao movimento"})
                    if(!i.produto ) return res.status(400).json({ erro:true, msg:"nao foi informado o produto  relacionado ao movimento"})
                    if(!i.tipo)     return res.status(400).json({ erro:true, msg:"nao foi informado tipo do movimento"})
                    if(!i.ent_sai ) return res.status(400).json({ erro:true, msg:"nao foi informado o parametro que indica se é uma entrada ou saida  ( ent_sai:'E'|'S' )  do  movimento"})
                    if(!i.historico ) i.historico = '';
                    if(!i.codigo )  return res.status(400).json({ erro:true, msg: "nao foi informado o codigo do movimento"})   
                    if(!i.unidade_medida ) i.unidade_medida = 'UND';

             
                  let verifyItem: IMovimentosProdutos[]=[];
                  i.produto, i.setor

                       verifyItem = await select.findByParam(dbName, { codigo: i.codigo, usuario:i.usuario});
                        if( verifyItem.length > 0 ){
                           console.log(` o movimento: ${i.codigo} ja foi registrado  `)
                        } else{
                           let result  = await insert.insertMovimentos(dbName, i);

                              if(result.insertId > 0 ) { 
                                itensProcessados.push({movimento: result.insertId}) 
                                            await publishMessage( empresa , 'movimentosprodutos.inserido', i)
                              } 
                        }
                }
               return res.status(200).json({ok:true, itens: itensProcessados})
          }
        
        }else{
          return res.status(400).json({erro:true, msg:"É necessario que seja fornecido um array com os itens a serem atualizados!"});   
           }
  
  }

  async findCompleteByParam(req:Request,res:Response){

  if(!req.headers.token ){
    return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
 } 
 let decodToken= DecodedToken(String(req.headers.token))
 let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
 let  dbName = `\`${empresa}\``;

        let select = new SelectMovimentosProdutos();
        let responseProdutos;
  try{
  
    if( req.query   ){
      let aux   = req.query 
      responseProdutos =   await   select.findCompleteByParam(dbName,  aux );
        return res.status(200).json( responseProdutos );
    }
  }catch(e){ 
    console.error(e);
    return res.status(400).json({ erro: true, msg: "Erro ao buscar os movimentos." });
  }


}


 

}

 
   