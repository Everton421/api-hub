import { type ResultSetHeader } from "mysql2";
import { conn, db_api } from "../../database/databaseConfig.ts";

export class InsertCompany {

    async insertCompany(obj: any) {
        let {
            id,
            responsavel,
            cnpj,
            nome_empresa,
            email_empresa,
            telefone_empresa,
            tipo_contrato,
            data_contrato,
            dias_contrato,
            inicio_contrato,
            fim_contrato
        } = obj;
        
        cnpj = cnpj.replace(/\D/g, '');
        if (!id) id = 0;

        const sql = ` INSERT INTO ${db_api}.empresas 
         (
           id,
           responsavel,
           cnpj ,
           nome,
           email,
           telefone,
           tipo_contrato,
           data_contrato,
           dias_contrato,
           inicio_contrato,
           fim_contrato

            ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ) `;

        let dados = [id, responsavel, cnpj, nome_empresa, email_empresa, telefone_empresa, tipo_contrato, data_contrato, dias_contrato, inicio_contrato, fim_contrato];

        const [result] = await conn.query(sql, dados);
        console.log(`empresa inserida com sucesso`);
        return result as ResultSetHeader  ;
    }

}
