import { conn } from "../../database/databaseConfig";

export class Update_UsuarioEmpresa {

    async updateSenha(empresa: any, senha: any, email: string) {
        return new Promise(async (resolve, reject) => {

            let sql = `
                  update ${empresa}.usuarios
                    set senha= ? 
                  where email = ?   
            `;
            const values = [ senha ,email ]

            await conn.query(sql,values,  (err: any, result: any) => {
                if (err) {
                    console.log(err)
                    reject(err);
                } else {
                    resolve(result);
                }
            })

        })
    }
}
