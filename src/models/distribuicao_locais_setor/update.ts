import { conn } from "../../database/databaseConfig"
import { IDistribuicaoLocaisSetor } from "../../types/distribuicao_locais_setor/distribuicao_locais_setor"
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

export class UpdateDistribuicaoSetor {


  async updateDistribuicao(empresa: any, query: IDistribuicaoLocaisSetor): Promise<OkPacket> {
    return new Promise(async (resolve, reject) => {
      const sql = ` UPDATE  ${empresa}.distribuicao_locais_setor SET
                            quantidade = ${query.quantidade},
                            data_recadastro = '${query.data_recadastro}',
                            setor = '${query.setor}',
                            produto ='${query.produto}',
                            unidade_medida = '${query.unidade_medida}' 
                                where produto = ${query.produto} and setor = ${query.setor} and local = ${query.local};`
      await conn.query(sql, (err: any, result: OkPacket) => {
        if (err) {
          console.log("Erro ao tentar atualizar distribuicao no setor   ", err)
          reject(err);
        } else {
          //  console.log(`produto atualizado com sucesso `)
          resolve(result);
        }
      })
    })
  }

}