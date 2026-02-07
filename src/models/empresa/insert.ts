import { conn, db_api } from "../../database/databaseConfig";

export class Insert_empresa{
    async registrar_empresa(obj:any){
            return new Promise( async (resolve, reject )=>{
                    let {
                        id,
                        responsavel,
                        cnpj,
                        nome_empresa,
                        email_empresa,
                        telefone_empresa,
                        tipo_contrato,
                        data_contrato,
                        dias_contrato,
                        inicio_contrato,
                        fim_contrato
                    } = obj;
                    cnpj = cnpj.replace(/\D/g, '');  
                    if(!id) id = 0;
      
                 const sql =  ` INSERT INTO ${db_api}.empresas 
                 (
                   id,
                   responsavel,
                   cnpj ,
                   nome,
                   email,
                   telefone,
                   tipo_contrato,
                   data_contrato,
                   dias_contrato,
                   inicio_contrato,
                   fim_contrato
 
                    ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ) `;

                    let dados = [ id,  responsavel, cnpj ,nome_empresa, email_empresa,telefone_empresa, tipo_contrato, data_contrato, dias_contrato , inicio_contrato, fim_contrato]
                 
                    await conn.query( sql,dados ,(error:any, resultado:any)=>{
                       if(error){
                               reject(" erro ao cadastrar empresa  "+ error);
                       }else{
                        resolve(resultado)
                           console.log(`empresa  inserida com sucesso`);
                       }
                    })
      
              
            })
     

    } 

}