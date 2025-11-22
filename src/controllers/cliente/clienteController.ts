import { Request, Response } from "express";
import { Select_clientes } from "../../models/cliente/select";
import { Insert_clientes } from "../../models/cliente/insert";
import { Cliente } from "../../models/cliente/interface_cliente";  
import { Update_clientes } from "../../models/cliente/update";
import { DateService } from "../../services/date-service/dateService";
import { DecodedToken } from "../../services/decoded-token/decodedToken";

export class ClienteController{


    async findAll( req:Request,res:Response  ){
       
           if(!req.headers.token ){
             return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
          } 
          let decodToken= DecodedToken(String(req.headers.token))
          let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');

         let  dbName = `\`${empresa}\``;
        
        const queryVendedor = req.query.vendedor;
       
            let data_recadastro:string ='';
            if(req.query.data_recadastro){
             data_recadastro = String(req.query.data_recadastro);
            }  

         if(!queryVendedor){
            return res.json(400).json({erro:true, msg: "É necessario informar a o vendedor  "});   
         } 
     
        let select = new Select_clientes();
        try{
            let clientes = await select.buscaGeral(dbName, queryVendedor, data_recadastro);
              return res.status(200).json(clientes);
        }catch(e ) { 
            console.error(e)
            return res.status(400).json({ erro: "Erro ao buscar clientes." });
        }
    }

    async insert(req:Request,res:Response){
        let obj = new ClienteController();
        
        
    if(!req.headers.token ){
        return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
     } 
     let decodToken= DecodedToken(String(req.headers.token))
     let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');

        
        let select = new Select_clientes();
        let insert = new Insert_clientes();

        let dateService = new DateService();

       
        let  dbName = `\`${empresa}\``;

                let vCnpj = req.body.cnpj;
                let postCliente:Cliente = req.body; 
                let cnpjFormat;

                if(!postCliente.id)               postCliente.id =  "0";
                if (!postCliente.celular)         postCliente.celular = "(00) 0000-0000";
                if (!postCliente.nome)            postCliente.nome = "teste";
                if (!postCliente.cep)             postCliente.cep = "00000-000";
                if (!postCliente.endereco)        postCliente.endereco = "";
                if (!postCliente.ie)              postCliente.ie = "";
                if (!postCliente.numero)          postCliente.numero = "";
                if (!postCliente.cnpj)            return res.status(400).json({erro:true, msg:" é necessario informar o cnpj/cpf do cliente"});            
                if (!postCliente.cidade)          postCliente.cidade = "";
            
                if (!postCliente.data_cadastro || postCliente.data_cadastro ===  "0000-00-00") {
                    postCliente.data_cadastro = dateService.obterDataAtual();
                }else{
                    postCliente.data_cadastro = dateService.formatarData(postCliente.data_cadastro);
                }
            
                if (!postCliente.data_recadastro || postCliente.data_recadastro === "0000-00-00 00:00:00" ){ 
                        postCliente.data_recadastro = dateService.obterDataHoraAtual()
                    } else{
                        postCliente.data_recadastro = dateService.formatarDataHora(postCliente.data_recadastro ) 
                    };
            
                if (!postCliente.vendedor)        postCliente.vendedor = 0;
                if (!postCliente.bairro)          postCliente.bairro = "";
                if (!postCliente.estado)          postCliente.estado = "";



                function removerCaracteres(str:string) {
                return str.replace(/\D/g, '');  
                }
                vCnpj = removerCaracteres(vCnpj)

            if(vCnpj.length < 11 || vCnpj.length > 14 ||   vCnpj.length === 12 || vCnpj.length === 13 ) {
                return res.status(400).json({erro:true, msg:"cnpj/cpf invalido  "});   
            }

            if( vCnpj.length === 14 ){
                cnpjFormat =  vCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5'); 
            }
            if(vCnpj.length === 11 ){
                cnpjFormat =  vCnpj.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4'); 
            }

                let validCnpj = await select.buscaPorCnpj(dbName,cnpjFormat);

                if( validCnpj.length > 0 ){
                        return res.status(400).json({erro:true, msg:"já existe cliente cadastrado com este cnpj/cpf"});        
                }else{
                    postCliente.cnpj = cnpjFormat; 

                    let itemInserido:any;
                            try{
                                itemInserido = await insert.cadastrar(dbName,postCliente )
                        postCliente.codigo = itemInserido.insertId;

                                return res.status(200).json(
                                    { 
                                        codigo : postCliente.codigo,
                                        id : postCliente.id,
                                        celular : postCliente.celular,
                                        nome : postCliente.nome,
                                        cep : postCliente.cep,
                                        endereco : postCliente.endereco,
                                        ie : postCliente.ie,
                                        numero : postCliente.numero,
                                        cnpj : postCliente.cnpj,
                                        cidade : postCliente.cidade,
                                        data_cadastro:postCliente.data_cadastro,
                                        data_recadastro:postCliente.data_recadastro
                                    });        

                            }catch(err){
                                    console.log(`erro ao inserir o cliente`,err);
                        return res.status(400).json({erro:true, msg:"erro ao inserir o cliente"});        

                            }   
                }
     }


     async findByParam(req:Request,res:Response){
    
        if(!req.headers.token ){
            return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
         } 
         let decodToken= DecodedToken(String(req.headers.token))
         let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
         let  dbName = `\`${empresa}\``;
        
          let select = new Select_clientes();
          let cliente;
  
          try{
    
            if( req.query   ){
                    cliente =   await   select.novaBusca(dbName, req.query)
           }
             return res.status(200).json(cliente);
        }catch(e){ 
              console.error(e);
            return res.status(400).json({ erro:true, msg: "Erro ao buscar clientes." });
        }
     
    }

 

     async update(req:Request,res:Response){
            let obj = new ClienteController();
        
            let select = new Select_clientes();
            let insert = new Insert_clientes();
            let update = new Update_clientes();
            let dateService = new DateService();

    
            if(!req.headers.token ){
                return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
             } 
             let decodToken= DecodedToken(String(req.headers.token))
             let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');

            let  dbName = `\`${empresa}\``;
                    let vCnpj = req.body.cnpj;
                    let postCliente:Cliente = req.body; 
                    let cnpjFormat;
                    if(!postCliente.codigo ) return res.status(400).json({erro:true, msg:" é necessario informar o codigo do cliente"});  
                    if(!postCliente.id)               postCliente.id =  "0";
                    if (!postCliente.celular)         postCliente.celular = "(00) 0000-0000";
                    if (!postCliente.nome)            postCliente.nome = "teste";
                    if (!postCliente.cep)             postCliente.cep = "00000-000";
                    if (!postCliente.endereco)        postCliente.endereco = "";
                    if (!postCliente.ie)              postCliente.ie = "";
                    if (!postCliente.numero)          postCliente.numero = "";
                    if (!postCliente.cnpj)            return res.status(400).json({erro:true, msg:" é necessario informar o cnpj/cpf do cliente"});            
                    if (!postCliente.cidade)          postCliente.cidade = "";
                    if(!postCliente.ativo)            postCliente.ativo = "S";
                        postCliente.data_cadastro = dateService.obterDataAtual();
                   
                
                    if (!postCliente.data_recadastro || postCliente.data_recadastro === "0000-00-00 00:00:00" ){ 
                            postCliente.data_recadastro = dateService.obterDataHoraAtual()
                        } else{
                                postCliente.data_recadastro = dateService.obterDataHoraAtual();
                        };
                
                    if (!postCliente.vendedor)        postCliente.vendedor = 0;
                    if (!postCliente.bairro)          postCliente.bairro = "";
                    if (!postCliente.estado)          postCliente.estado = "";
    
    
    
                    function removerCaracteres(str:string) {
                    return str.replace(/\D/g, '');  
                    }
                    vCnpj = removerCaracteres(vCnpj)
    
                if(vCnpj.length < 11 || vCnpj.length > 14 ||   vCnpj.length === 12 || vCnpj.length === 13 ) {
                    return res.status(200).json({erro:true, msg:"cnpj/cpf invalido  "});   
                }
    
                if( vCnpj.length === 14 ){
                    cnpjFormat =  vCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5'); 
                }
                if(vCnpj.length === 11 ){
                    cnpjFormat =  vCnpj.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4'); 
                }
    
                    let validCnpj = await select.buscaPorCnpj(dbName,cnpjFormat);
    
                    if( validCnpj.length > 0 ){

                        postCliente.cnpj = cnpjFormat; 
                        let itemInserido:any;
                   
                        try{
                                    itemInserido = await update.update(dbName,postCliente )
                            //postCliente.codigo = itemInserido.insertId;
    
                                    return res.status(200).json(
                                        { 
                                            codigo : postCliente.codigo,
                                            ativo: postCliente.ativo,
                                            id : postCliente.id,
                                            celular : postCliente.celular,
                                            nome : postCliente.nome,
                                            cep : postCliente.cep,
                                            endereco : postCliente.endereco,
                                            ie : postCliente.ie,
                                            numero : postCliente.numero,
                                            cnpj : postCliente.cnpj,
                                            cidade : postCliente.cidade,
                                            data_cadastro:postCliente.data_cadastro,
                                            data_recadastro:postCliente.data_recadastro

                                        });        
    
                                }catch(err){
                                        console.log(`erro ao inserir o cliente`,err);
                            return res.status(400).json({erro:true, msg:"erro ao inserir o cliente"});        
    
                                }   
                    }
          }
    
}



 
