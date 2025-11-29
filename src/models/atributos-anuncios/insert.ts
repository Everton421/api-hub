import { conn } from "../../database/databaseConfig";
import { atributosAnuncios } from "../../types/atributos-anuncios/type-atributos-anuncios";


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

type insertAtributo  = Omit<atributosAnuncios,'id'>;


export class InsertAtributosAnuncios{

    async insert( empresa: string,  atributo: insertAtributo  ):Promise<responseFunction> {

            const sql = `
                INSERT INTO ${empresa}.atributos_anuncios
                    SET 
                    id_anuncio = ?,
                    id_atributo = ?,
                    nome_atributo = ?,
                    valor_atributo = ?,
                    id_valor_atributo = ? ; `

                    const values = [  atributo.id_anuncio, atributo.id_atributo, atributo.nome_atributo, atributo.valor_atributo, atributo.id_valor_atributo ];

 
        return new Promise( ( resolve, reject )=>{
              conn.query( sql ,values, ( err, result )=>{
                if(err){
                    reject({ sucess:false, message:`[Erro ao tentar registrar atributo do anuncio id: ${atributo.id_anuncio} ] | ${err}` } as responseFunction);
                }else{  
                    resolve( { sucess:true, message: `[ Atributo do anuncio ${atributo.id_anuncio} registrado com sucesso! ]`, insertId: result.insertId }  as responseFunction  );
                }
              })
        })
    }   
}