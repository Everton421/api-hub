
import { conn } from '../../database/databaseConfig';
import { Cliente } from "./interface_cliente";

export class Update_clientes {

  async update(empresa: any, cliente: Cliente) {
    return new Promise(async (resolve, reject) => {
      let sql =
        `  
         UPDATE ${empresa}.clientes SET
                id              =  ?, 
                celular         =  ?, 
                nome            =  ?,
                ativo           =  ?,
                cep             =  ?,
                endereco        =  ?,
                ie              =  ?,
                numero          =  ?,
                cnpj            =  ?,
                cidade          =  ?,
                data_cadastro   =  ?,
                data_recadastro =  ?,
                vendedor        =  ?,
                bairro          =  ?,
                estado          =  ? 
                where codigo    =  ?
        
                  ;
            `
      const values = [
        cliente.id,
        cliente.celular,
        cliente.nome,
        cliente.ativo,
        cliente.cep,
        cliente.endereco,
        cliente.ie,
        cliente.numero,
        cliente.cnpj,
        cliente.cidade,
        cliente.data_cadastro,
        cliente.data_recadastro,
        cliente.vendedor,
        cliente.bairro,
        cliente.estado,
        cliente.codigo
      ]
      await conn.query(sql,values, (err: any, result: Cliente[]) => {
        if (err) reject(err);
        resolve(result)
      })
    })
  }

}

