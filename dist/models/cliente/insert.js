"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Insert_clientes = void 0;
const databaseConfig_1 = require("../../database/databaseConfig");
class Insert_clientes {
    async cadastrar(empresa, cliente) {
        return new Promise(async (resolve, reject) => {
            let sql = `  
         INSERT INTO 
         ${empresa}.clientes
              (   
                celular, 
                nome ,
                cep ,
                endereco ,
                ie ,
                numero ,
                cnpj ,
                cidade ,
                data_cadastro ,
                data_recadastro ,
                vendedor,
                bairro,
                estado 
               ) values
                (
                  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? );
            `;
            const dados = [cliente.celular, cliente.nome, cliente.cep, cliente.endereco, cliente.ie, cliente.numero,
                cliente.cnpj, cliente.cidade, cliente.data_cadastro, cliente.data_recadastro, cliente.vendedor, cliente.bairro, cliente.estado];
            await databaseConfig_1.conn.query(sql, dados, (err, result) => {
                if (err)
                    reject(err);
                resolve(result);
            });
        });
    }
}
exports.Insert_clientes = Insert_clientes;
