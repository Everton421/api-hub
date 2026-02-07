import { conn } from "../../database/databaseConfig";
import { ISetor } from "./types/setor";

type OkPacket = {
    fieldCount: number,
    affectedRows: number,
    insertId: number,
    serverStatus: number,
    warningCount: number,
    message: string,
    protocol41: boolean,
    changedRows: number
}
export class UpdateSetor {


    async update(empresa: any, tipo_os: ISetor): Promise<OkPacket> {

        return new Promise(async (resolve, reject) => {
            let {
                codigo,
                data_cadastro,
                data_recadastro,
                descricao,
            } = tipo_os

            const sql = ` UPDATE  ${empresa}.setores SET  
                                    data_cadastro = '${data_cadastro}',
                                    data_recadastro = '${data_recadastro}',
                                    descricao = '${descricao}' 
                                   where codigo = ${codigo}
                            `;
            console.log(sql)
            await conn.query(sql, (err: any, result: any) => {
                if (err) {
                    console.log(err)
                    reject(err);
                } else {
                    console.log(`setor atualizadao com sucesso `)
                    resolve(result);
                }
            })
        })
    }

}
