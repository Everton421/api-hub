import { conn } from "../../database/databaseConfig";
import { VeiculoBanco } from "../../types/veiculo/type-veiculo";

export class update_veiculo {


    async update(empresa: any, veiculo: VeiculoBanco) {

        return new Promise(async (resolve, reject) => {
            const {
                codigo,
                id,
                cliente,
                placa,
                marca,
                modelo,
                ano,
                cor,
                combustivel,
                data_cadastro,
                data_recadastro,
                ativo
            } = veiculo;

            const sql = ` UPDATE  ${empresa}.veiculos SET  
                                    id = ${id},
                                    cliente = ${cliente},
                                    placa = '${placa}',
                                    marca = '${marca}',
                                    modelo = '${modelo}',
                                    ano = '${ano}',
                                    cor = '${cor}',
                                    combustivel = '${combustivel}',
                                    data_cadastro = '${data_cadastro}',
                                    data_recadastro = '${data_recadastro}',
                                    ativo = '${ativo}'
                                    where codigo = ${codigo}
                            `;

            await conn.query(sql, (err: any, result: any) => {
                if (err) {
                    console.log(err)
                    reject(err);
                } else {
                    console.log(`veiculo atualizado com sucesso `)
                    resolve(result);
                }
            })
        })
    }

}
