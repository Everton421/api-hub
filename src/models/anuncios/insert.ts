import { conn } from "../../database/databaseConfig";
import { typeAnuncios } from "../../types/anuncios/type-anuncio";

type newAnuncio = Omit<typeAnuncios , 'id' | 'data_cadastro' | 'data_recadastro' >

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
type responseFunction = { sucess:boolean, message:string,  insertId?:number}

export class InsertAnuncios{

    async insert( empresa:string,  anuncio:newAnuncio,):Promise<responseFunction> {

            const sql = `
                INSERT INTO ${empresa}.anuncios
                    SET 
                        codigo_produto = ? ,
                        integration_id = ?,
                        plataforma = ?,
                        estoque = ?,
                        preco = ?,
                        unidade_medida = ?,
                        descricao = ? ,
                        titulo = ?,
                        num_fabricante = ?,
                        ativo = ?,
                        sku_externo = ?,
                        id_externo = ?,
                        link = ? ; `
       const values = [ anuncio.codigo_produto, anuncio.integration_id, anuncio.plataforma, anuncio.estoque, anuncio.preco, anuncio.unidade_medida, anuncio.descricao, anuncio.titulo, anuncio.num_fabricante, anuncio.ativo, anuncio.sku_externo, anuncio.id_externo, anuncio.link ]  
 
        return new Promise( ( resolve, reject )=>{
              conn.query( sql ,values, ( err, result )=>{
                if(err){
                    reject({ sucess:false, message:`[Erro ao tentar registrar anuncio] | ${err}` } as responseFunction);
                }else{  
                    resolve( { sucess:true, message: `[ Anuncio registrado com sucesso! ]`, insertId: result.insertId }  as responseFunction  );
                }
              })
        })
    }   
}