import { Request, Response } from "express";
import { DateService } from "../../services/dateService";
import { DecodedToken } from "../../services/decodedToken/decodedToken";
import { SelectMovimentosProdutos } from "../../models/movimentos-produtos/select";
import { IMovimentosProdutos } from "../../models/movimentos-produtos/types/movimentos_produtos";
import { InsertMovimentosProdutos } from "../../models/movimentos-produtos/insert";
 

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
              return res.status(500).json({ erro: "Erro ao buscar os movimentos dos produtos." });
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
   let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');

  let  dbName = `\`${empresa}\``;
   let insert = new InsertMovimentosProdutos();
   let dateService = new DateService();

if(!req.body.setor) return res.status(400).json({ erro:true, msg: "é necessario informar um setor para registrar o movimento!"}); 
if(!req.body.produto) return res.status(400).json({ erro:true, msg: "é necessario informar um produto para registrar o movimento! "}); 
if(!req.body.quantidade) return res.status(400).json({ erro:true, msg: "é necessario informar a quantidade para registrar o movimento! "}); 
if(!req.body.tipo) return res.status(400).json({ erro:true, msg: "é necessario informar o tipo para registrar o movimento! "}); 
if(!req.body.historico  ){
  req.body.historico =''
}  
          let movimento:Partial<IMovimentosProdutos> = 
           {
             setor: req.body.setor,
             produto: Number(req.body.produto),
             quantidade: String(req.body.quantidade),
             tipo: String(req.body.tipo),
             historico: String(req.body.historico),
             data_recadastro: dateService.obterDataHoraAtual()
          }   
    
      try{
            let resultinsertId:any = await insert.insertMovimentos(dbName, movimento);
              return res.status(200).json(
                {
                  codigo:resultinsertId.insertId,
                  setor: movimento.setor,
                  produto: movimento.produto,
                  quantidade: movimento.quantidade,
                  tipo: movimento.tipo,
                  historico: movimento.historico,
                  data_recadastro: movimento.data_recadastro,
              })
            
              
          }catch(e){
            return res.status(400).json({ erro:true, msg: `Ocorreu um erro ao registrar o movimento!`});

          }

  
  }

  /*
 async updateOffline(req:Request,res:Response){
    if(!req.headers.token ){
      return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
   } 
   let decodToken= DecodedToken(String(req.headers.token))
   let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');

  let  dbName = `\`${empresa}\``;
   let insert = new InsertMovimentosProdutos();
   let select = new SelectMovimentosProdutos();

   let dateService = new DateService();

      if(Array.isArray(req.body)   ){
            if(req.body.length > 0 ){
        
               let dados:IMovimentosProdutos[] = req.body;
                for( let i of dados){
                  let verifyItem: IMovimentosProdutos[]=[];
                       verifyItem = await select.findByProdSector(dbName, i.produto, i.setor);
                
                }

          }
        
        }
          let movimento:Partial<IMovimentosProdutos> = 
           {
             setor: req.body.setor,
             produto: Number(req.body.produto),
             quantidade: String(req.body.quantidade),
             tipo: String(req.body.tipo),
             historico: String(req.body.historico),
             data_recadastro: dateService.obterDataHoraAtual()
          }   
    
      try{
            let resultinsertId:any = await insert.insertMovimentos(dbName, movimento);
              return res.status(200).json(
                {
                  codigo:resultinsertId.insertId,
                  setor: movimento.setor,
                  produto: movimento.produto,
                  quantidade: movimento.quantidade,
                  tipo: movimento.tipo,
                  historico: movimento.historico,
                  data_recadastro: movimento.data_recadastro,
              })
            
              
          }catch(e){
            return res.status(400).json({ erro:true, msg: `Ocorreu um erro ao registrar o movimento!`});

          }

  
  }
  */

}

 
   