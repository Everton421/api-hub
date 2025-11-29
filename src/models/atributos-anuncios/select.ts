import { conn } from "../../database/databaseConfig";


export class SelectAtributosAnuncios{

   /**
     * 
     * @param empresa 
     * @param id id do anuncio
     * @returns 
     */
    async buscaPorIdAnuncio(empresa:string , id:number  ){

        return new Promise( async (resolve, reject)=>{

             let sqlAnuncios = ` SELECT an.*,
                DATE_FORMAT( data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT( data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.atributos_anuncios  
             where  id_anuncio = ? 
             `;

            const params = [id ]
            await conn.query( sqlAnuncios, params  ,(err:any, result:any )=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                    if( result.length > 0 ){

                    }
                }
            })
        })
    }


}