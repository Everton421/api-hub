import { type ResultSetHeader } from "mysql2";
import { conn, db_api } from "../../database/databaseConfig.ts";

export class Update_empresa {

    async atualizar_dados_empresa(cnpj: string, obj: any) {
        let {
            responsavel,
            nome_empresa,
            email_empresa,
            telefone_empresa,
            tipo_contrato,
            data_contrato,
            dias_contrato,
            inicio_contrato,
            fim_contrato,
            logo_url,
            cor_fonte,
            cor_fundo,
            cor_banner
        } = obj;

        const sql = ` UPDATE ${db_api}.empresas SET
            responsavel = ?,
            nome = ?,
            email = ?,
            telefone = ?,
            tipo_contrato = ?,
            data_contrato = ?,
            dias_contrato = ?,
            inicio_contrato = ?,
            fim_contrato = ?,
            logo_url = ?,
            cor_fonte = ?,
            cor_fundo = ?,
            cor_banner = ?
          WHERE cnpj = ? `;

        let dados = [
            responsavel, 
            nome_empresa, 
            email_empresa, 
            telefone_empresa, 
            tipo_contrato, 
            data_contrato, 
            dias_contrato, 
            inicio_contrato, 
            fim_contrato,
            logo_url || null,
            cor_fonte || '#333333',
            cor_fundo || '#FFFFFF',
            cor_banner || '#1a73e8',
            cnpj
        ];

        const [result] = await conn.query(sql, dados);
        console.log(`empresa atualizada com sucesso`);
        return result as ResultSetHeader;
    }

}
