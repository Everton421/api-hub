import { conn } from "../../database/databaseConfig";
import { typeAnuncios } from "../../types/anuncios/type-anuncio";

type OkPacket = {
  fieldCount: number,
  affectedRows: number,
  insertId: number,
  serverStatus: number,
  warningCount: number,
  message: string,
  protocol41: boolean,
  changedRows: number
}

export class UpdateAnuncios{
    
    
    async update(empresa:string, anuncio:typeAnuncios, id:number): Promise<OkPacket > {

        return new Promise(async ( resolve, reject ) =>{

            const sql = 
                ` UPDATE ${empresa}.anuncios SET
                    integration_id =  ${anuncio.integration_id} ,
                    plataforma = '${anuncio.plataforma}',
                    estoque = ${anuncio.estoque},
                    preco = ${anuncio.preco},
                    unidade_medida = '${anuncio.unidade_medida}',
                    descricao = '${anuncio.descricao}',
                    titulo = '${anuncio.titulo}',
                    num_fabricante = '${anuncio.num_fabricante}',
                    ativo = '${anuncio.ativo}',
                    sku_externo = '${anuncio.sku_externo}',
                    id_externo = '${anuncio.id_externo}',
                    link = '${anuncio.link}',
                    thumbnail = '${anuncio.thumbnail}'
                    WHERE id = ${id}
              ` 

           await  conn.query(sql, (err: string , result:OkPacket)=>{
                if( err ){
                    reject(err)
                }else{  
                    resolve(result)
                }
             })

        })


    }
}