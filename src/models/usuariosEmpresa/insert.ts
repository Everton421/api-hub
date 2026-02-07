import { conn } from "../../database/databaseConfig";
import { newUserEmpresa, usuarioEmpresa } from "./interface";


export class Insert_UsuarioEmpresa {

    async insert_usuario(empresa: any, usuario: newUserEmpresa) {
        let sql =
            `  INSERT INTO ${empresa}.usuarios
        (
            nome,
            email,
            cnpj,
            senha,
            responsavel, 
            ativo
        )VALUES
         ( ?, ?, ?, ?, ? , ? )
        `;
        return new Promise(async (resolve, reject) => {

            await conn.query(sql, [usuario.nome, usuario.email, usuario.cnpj, usuario.senha, usuario.responsavel, usuario.ativo], (err: any, result: any) => {
                if (err) {
                    console.log(` Erro ao tentar cadastrar usuario ${usuario.nome} na empresa `, err)
                    reject(err)
                } else {
                    console.log(result)
                    resolve(result);
                }
            })
        })
    }

}
