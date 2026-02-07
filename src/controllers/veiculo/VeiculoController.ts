import { Request, Response } from "express";
import { Select_veiculos } from "../../models/veiculo/select";
import { update_veiculo } from "../../models/veiculo/update";
import { DateService } from "../../services/date-service/dateService";
import { Insert_clientes } from "../../models/cliente/insert";
import { Insert_Veiculos } from "../../models/veiculo/insert";
import { DecodedToken } from "../../services/decoded-token/decodedToken";
import { publishMessage } from "../../services/broker/publish-message";

export class VeiculoController{

    async  findAll( req:Request,res:Response ) {
        
                let selectVeiculos = new Select_veiculos();
        if(!req.headers.token ){
            return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
        } 
        let decodToken= DecodedToken(String(req.headers.token))
        let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
         let  dbName = `\`${empresa}\``;

         let data_recadastro:string ='';
         if(req.query.data_recadastro){
          data_recadastro = String(req.query.data_recadastro);
         } 

            try{
                 let dados:any[] = await selectVeiculos.buscaGeral(dbName, data_recadastro);
                    return res.status(200).json(dados);
            }catch(err){
              return res.status(500).json({ erro: "Erro ao buscar veiculos." });
             }

    }

    async  findByClient( req:Request,res:Response ) {
        let selectVeiculos = new Select_veiculos();
    
        if(!req.headers.token ){
            return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
         } 
         let decodToken= DecodedToken(String(req.headers.token))
         let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
         let  dbName = `\`${empresa}\``;

         if(!req.params.cliente)  res.status(400).json({'msg':"é necessario informar o codigo do cliente !"} )
         let cliente = Number(req.params.cliente); 
         let veiculos;
         try{
            veiculos = await selectVeiculos.buscaPorCliente(dbName, cliente)
            if(veiculos.length > 0 ) res.status(200).json(veiculos)
                
         }catch(e){
            console.log('erro ao buscar os veiculos',e )
            res.status(400).json({
                "erro":true,
                'msg':"erro ao buscar os veiculos !"} )

         }


    }
async update(  req:Request,res:Response ){
    let selectVeiculos = new Select_veiculos();
    let updateVeiculo = new update_veiculo();
    let dateService = new DateService();
 
 
    if(!req.headers.token ){
        return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
     } 
     let decodToken= DecodedToken(String(req.headers.token))
    if( !decodToken.payload?.cnpj ) return res.status(400).json({erro:true, msg:"Identifiador unico da empresa nao foi informado"});    
     
     let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
     let  dbName = `\`${empresa}\``;

     if( !req.body.codigo ){
        return res.status(400).json({erro:true, msg:"É necessario informar o codigo do veiculo "});   
     }
     
     if( !req.body.cliente ){
        return res.status(400).json({erro:true, msg:"É necessario informar o cliente vinculado ao veiculo "});   
     }
     if(!req.body.ativo) req.body.ativo = 'S'; 

     if(!req.body.placa) req.body.placa = ''; 
     if(!req.body.marca) req.body.marca = ''; 
     if(!req.body.modelo) req.body.modelo = ''; 
     if(!req.body.ano) req.body.ano = ''; 
     if(!req.body.id) req.body.id = 0; 
     
     if(!req.body.cor) req.body.cor = ''; 
     if(!req.body.combustivel) req.body.combustivel = ''; 
     if(!req.body.data_cadastro)  req.body.data_cadastro = dateService.obterDataAtual();
      req.body.data_recadastro = dateService.obterDataHoraAtual();


     let codigo = req.body.codigo;

     let verifyVeic;
        try{
            verifyVeic = await selectVeiculos.buscaPorCodigo(dbName,codigo );
         }catch(e){
            console.log(e);
        return res.status(400).json({erro:true, msg:"ocorreu um erro ao tentar consultar o veiculo! "});   
        }
        
        if( verifyVeic.length > 0 ){
            try{
                let result:any = await updateVeiculo.update(dbName, req.body);
 
                if( result.affectedRows > 0 ){
            const item =  {
                "codigo": req.body.codigo,
                "id": req.body.id,
                "cliente": req.body.cliente,
                "placa": req.body.placa,
                "marca": req.body.marca,
                "modelo": req.body.modelo,
                "ano": req.body.ano,
                "combustivel": req.body.combustivel, 
                "data_cadastro": req.body.data_cadastro,
                "data_recadastro":  req.body.data_recadastro ,
                "ativo": req.body.ativo
            }
                 await publishMessage( empresa , 'veiculo.atualizado', item)
                    return res.status(200).json(item);   

                }
            }catch(e){
        return res.status(400).json({erro:true, msg:"ocorreu um erro ao tentar atualizar o veiculo! "});   
                
            }
       
        }




}

async insert(  req:Request,res:Response ){
    
    let dateService = new DateService();
    let insert = new Insert_Veiculos();

    if(!req.headers.token ){
        return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
     } 
     let decodToken= DecodedToken(String(req.headers.token))
  if( !decodToken.payload?.cnpj ) return res.status(400).json({erro:true, msg:"Identifiador unico da empresa nao foi informado"});    

     let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
     let  dbName = `\`${empresa}\``;
 
     
     if( !req.body.cliente ){
        return res.status(400).json({erro:true, msg:"É necessario informar o cliente vinculado ao veiculo "});   
     }
     if(!req.body.ativo) req.body.ativo = 'S'; 
     if(!req.body.id ) req.body.id = 0; 
     if(!req.body.placa) req.body.placa = ''; 
     if(!req.body.marca) req.body.marca = ''; 
     if(!req.body.modelo) req.body.modelo = ''; 
     if(!req.body.ano) req.body.ano = ''; 
     if(!req.body.cor) req.body.cor = ''; 
     if(!req.body.combustivel) req.body.combustivel = ''; 
     if(!req.body.data_cadastro)  req.body.data_cadastro = dateService.obterDataAtual();
     if(!req.body.data_recadastro)  req.body.data_recadastro = dateService.obterDataHoraAtual();


     let codigo = req.body.codigo;

   
            try{
                let result:any = await insert.cadastrar(dbName, req.body);
                if( result.insertId > 0 ){
                    const item ={
                            "codigo":result.insertId ,
                            "id": req.body.id,
                            "cliente": req.body.cliente,
                            "placa": req.body.placa,
                            "marca": req.body.marca,
                            "cor": req.body.cor,
                            "modelo": req.body.modelo,
                            "ano": req.body.ano,
                            "combustivel": req.body.combustivel, 
                            "data_cadastro": req.body.data_cadastro,
                            "data_recadastro": req.body.data_recadastro,
                            "ativo": req.body.ativo
                        } 
                                    await publishMessage( empresa , 'veiculo.inserido', item)
                        
                    return res.status(200).json(
                            item
                    );   

                    }
            }catch(e){
        return res.status(400).json({erro:true, msg:"ocorreu um erro ao tentar registrar o veiculo! " });   
                
            }
       


}


async findByParam(req:Request,res:Response){
    if(!req.headers.token ){
        return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
     } 
     let decodToken= DecodedToken(String(req.headers.token))
     let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
     let  dbName = `\`${empresa}\``;

        let selectVeiculos = new Select_veiculos();
 
         let veiculos;
         try{
            if( req.query   ){
                veiculos =   await   selectVeiculos.novaBusca(dbName, req.query);
           }
             return res.status(200).json(veiculos);
        }catch(e){ 
              console.error(e);
            return res.status(400).json({ erro:true, msg: "Erro ao buscar os veiculos." });
        }
    }
    

}