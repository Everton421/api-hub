import { conn } from "../../database/databaseConfig";
import { newUserEmpresa, usuarioEmpresa } from "./interface";


export class Insert_UsuarioEmpresa{

async insert_usuario( empresa:any, usuario:newUserEmpresa ){
    let sql =
    `  INSERT INTO ${empresa}.usuarios
        (
            nome,
            email,
            cnpj,
            senha,
            responsavel
        )VALUES
         ( ?, ?, ?, ?, ? )
        `;
    return new Promise  ( async ( resolve ,reject )=>{

        await conn.query( sql,[ usuario.usuario, usuario.email, usuario.cnpj, usuario.senha, usuario.responsavel ] ,(err:any, result:any )=>{
            if(err){
                reject(err)
            }else{  
                resolve(result);
            }
        } )
    })
 }

}
