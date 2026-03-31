import { conn, db_api } from "../../database/databaseConfig.ts";
import { type company } from "../../types/company/type-company.ts";
 
export class SelectCompany {

    async findByCnpj(cnpj: string): Promise<company[]> {
        const sql = `
        select *,
            DATE_FORMAT(data_contrato, '%Y-%m-%d') as data_contrato,
            DATE_FORMAT(inicio_contrato, '%Y-%m-%d') as inicio_contrato,
            DATE_FORMAT(fim_contrato, '%Y-%m-%d') as fim_contrato 
         from ${db_api}.empresas where cnpj = ?     
        `;
        const [result] = await conn.query(sql, [cnpj]);
        return result as company[];
    }

    async findAll(): Promise<company[]> {
        const sql = `
        select 
        
        *,
            DATE_FORMAT(data_contrato, '%Y-%m-%d') as data_contrato,
            DATE_FORMAT(inicio_contrato, '%Y-%m-%d') as inicio_contrato,
            DATE_FORMAT(fim_contrato, '%Y-%m-%d') as fim_contrato 
        from ${db_api}.empresas      
        `;
        const [result] = await conn.query(sql);
        return result as company[];
    }

      async verifyExistsCompany(empresa: string) {
         const [result] = await conn.query(`SHOW DATABASES`);
                const resultCompanys = result as any[];

            if (resultCompanys.length > 0) {
              let valid = resultCompanys.some((e: any) => e.Database === empresa);
              return  valid ;
            }
      }
}
