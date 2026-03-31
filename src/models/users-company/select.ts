import { conn, db_api } from "../../database/databaseConfig.ts";
import { type  queryUsuarioEmpresa } from "../../types/usuarioEmpresa/type-usuario-empresa.ts";
import { type usuarioEmpresa } from "./interface.ts";

export class SelectUsersCompany {

    async findAll(empresa: any): Promise<usuarioEmpresa[]> {
        let sql = ` select * from ${empresa}.usuarios;`;
        const [result] = await conn.query(sql);
        return result as usuarioEmpresa[];
    }

    async findByEmail(empresa: any, email: any): Promise<usuarioEmpresa[]> {
        let sql = ` select * from ${empresa}.usuarios where email = ? ;`;
        const [result] = await conn.query(sql, [email]);
        return result as usuarioEmpresa[];
    }

    async findByCode(empresa: any, codigo: any): Promise<usuarioEmpresa[]> {
        let sql = ` select * from ${empresa}.usuarios where codigo = ? ;`;
        const [result] = await conn.query(sql, [codigo]);
        return result as usuarioEmpresa[];
    }

    async findByEmailPassword(empresa: any, email: any, senha: any): Promise<usuarioEmpresa[]> {
        let sql = ` select u.*, e.tipo_contrato, DATE_FORMAT(e.data_contrato, '%Y-%m-%d') data_contrato  , e.dias_contrato
                 from ${empresa}.usuarios u 
                    join ${db_api}.empresas e 
                    on u.cnpj = e.cnpj
                  where u.email = ? and u.senha = ?    ;`;
        const [result] = await conn.query(sql, [email, senha]);
        return result as usuarioEmpresa[];
    }

    async findByEmailAndName(empresa: any, email: any, nome: any): Promise<usuarioEmpresa[]> {
        let sql = ` select * from ${empresa}.usuarios where email = ? and nome = ?    ;`;
        const [result] = await conn.query(sql, [email, nome]);
        return result as usuarioEmpresa[];
    }

    async findByParam(empresa: string, query: queryUsuarioEmpresa): Promise<usuarioEmpresa[]> {
        let sql = ` select * from ${empresa}.usuarios`;
        let paramSql: string[] = [];
        const valueSql: any[] = [];

        if (query.codigo) {
            paramSql.push(" codigo = ? ");
            valueSql.push(query.codigo);
        }

        if (paramSql.length > 0) {
            sql += " WHERE " + paramSql.join('');
        }

        const [result] = await conn.query(sql, valueSql);
        return result as usuarioEmpresa[];
    }

}
