import { type ResultSetHeader } from "mysql2";
import { conn } from "../../database/databaseConfig.ts";
import { type newUserEmpresa, type usuarioEmpresa } from "./interface.ts";


export class InsertUsersCompany {

    async insertUser(empresa: any, usuario: newUserEmpresa) {
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
     

               const [ result ] = await conn.query(sql, [usuario.nome, usuario.email, usuario.cnpj, usuario.senha, usuario.responsavel, usuario.ativo] )  
            
                return result as ResultSetHeader;
    }

}
