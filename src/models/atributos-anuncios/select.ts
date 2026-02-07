import { conn } from "../../database/databaseConfig";
import { typeAtributosAnuncios } from "../../types/atributos-anuncios/type-atributos-anuncios";
 
export class SelectAtributosAnuncios{

   /**
     * 
     * @param empresa 
     * @param id id do anuncio
     * @returns 
     */
    async buscaPorIdAnuncio(empresa:string , id:number  ):Promise<typeAtributosAnuncios[]>{

        return new Promise( async (resolve, reject)=>{

             let sql = ` SELECT   *,
                DATE_FORMAT( data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT( data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.atributos_anuncios  
             where  id_anuncio = ? 
             `;
   
 
            const params = [id ]
            await conn.query( sql, params  ,(err:any, result:any )=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                   
                }
            })
        })
    }


}