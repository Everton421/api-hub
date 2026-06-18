import { conn, db_api } from "../../database/databaseConfig.ts"
import {type IMarketplace } from "../../types/marketplaces/IMarketplace.ts"

type query = {
id: number
sigla:string
plataforma:string
url_logo:string
}

export class SelectMarketplaces{
    async findByParams( query: Partial<query> ){
      
            let baseSql = `SELECT * FROM ${db_api}.marketplaces`
             const { id, plataforma, sigla, url_logo,} = query;
            const conditions =[]
            const values =[]

                if(id){
                    conditions.push(" id = ? ");
                    values.push(id);
                } 
                if(plataforma){
                    conditions.push(" plataforma = ? ");
                    values.push(plataforma);
                } 
                if(sigla){
                    conditions.push(" sigla = ? ");
                    values.push(sigla);
                     
                } 
                if(url_logo){
                    conditions.push(" url_logo = ? ");
                    values.push(url_logo);
                }

                if(conditions.length > 0 ){
                    baseSql += " WHERE " + conditions.join(' AND ');
                }

                    const [ arrResult ] = await conn.query(baseSql, values);
                    return arrResult as IMarketplace[]

            }
}