import { conn } from "../../database/databaseConfig";
import { ILocal } from "../../types/locais/type-local";

type localSemCodigo = Omit<ILocal, 'codigo'>

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


export class InsertLocais {

    async insert(empresa: string, local: localSemCodigo): Promise<OkPacket> {
        return new Promise(async (resolve, reject) => {

            let sql = `
                            INSERT INTO ${empresa}.locais ( 
                            id,
                            descricao,
                            setor,
                            data_cadastro,
                            data_recadastro,
                            ativo
                             ) VALUES
                             ( ? , ? , ? , ? , ?, ? ); `;
            const values = [local.id, local.descricao, local.setor, local.data_cadastro, local.data_recadastro, local.ativo]

            await conn.query(sql, values, (err: any, result: any) => {
                if (err) {
                    console.log('Erro ao tentar registrar o local', err)
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }
}