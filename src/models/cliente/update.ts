 
import { Cliente } from "./interface_cliente";
import {conn} from '../../database/databaseConfig'

export class Update_clientes{

    async   update(empresa:any, cliente:Cliente )   {
        return new Promise  ( async ( resolve , reject ) =>{
        let sql =
         `  
         UPDATE ${empresa}.clientes SET
                 
                celular = '${cliente.celular}', 
                nome = '${cliente.nome}' ,
                cep = '${cliente.cep}' ,
                endereco = '${cliente.endereco}' ,
                ie = '${cliente.ie}' ,
                numero = '${cliente.numero}' ,
                cnpj = '${cliente.cnpj}' ,
                cidade = '${cliente.cidade}' ,
                data_cadastro = '${cliente.data_cadastro}' ,
                data_recadastro = '${cliente.data_recadastro}' ,
                vendedor =  ${cliente.vendedor},
                bairro = '${cliente.bairro}',
                estado = '${cliente.estado}' 
                  where codigo = ${cliente.codigo}
        
                  ;
            `   

             await conn.query(sql, (err:any, result:Cliente[] )=>{
                if (err)  reject(err); 
                  resolve(result)
            })
         })
    }
  
}

