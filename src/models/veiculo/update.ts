import { conn } from "../../database/databaseConfig";
import { VeiculoBanco } from "../../types/veiculo/type-veiculo";

export class update_veiculo {

    async update(empresa: any, veiculo: VeiculoBanco) {

        return new Promise((resolve, reject) => {
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

            // Mantido ${empresa} direto e usado ? para todos os valores
            const sql = ` 
                UPDATE ${empresa}.veiculos SET  
                    id = ?,
                    cliente = ?,
                    placa = ?,
                    marca = ?,
                    modelo = ?,
                    ano = ?,
                    cor = ?,
                    combustivel = ?,
                    data_cadastro = ?,
                    data_recadastro = ?,
                    ativo = ?
                WHERE codigo = ?
            `;

            // Array com os valores na ordem exata dos '?' no SQL
            const values = [
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
                ativo,
                codigo // Onde o código é o último parâmetro (do WHERE)
            ];

            conn.query(sql, values, (err: any, result: any) => {
                if (err) {
                    console.log("Erro ao atualizar veículo:", err);
                    reject(err);
                } else {
                    console.log(`veiculo atualizado com sucesso`);
                    resolve(result);
                }
            });
        });
    }
}