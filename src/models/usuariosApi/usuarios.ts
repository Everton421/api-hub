import { conn, db_api } from "../../database/databaseConfig"
import { newUser, UsuarioApi} from "./interface";

export class UsuariosApi{


        async insertUsuario(usuario:newUser){

                return new Promise( async  (resolve, reject)=>{
                    let sql = `
                        INSERT INTO ${db_api}.usuarios
                        (
                            nome, email, cnpj, senha, responsavel
                        ) values( ?, ?, ?, ? , ? )
                    `;

                    await conn.query(sql, [usuario.usuario, usuario.email, usuario.cnpj, usuario.senha, usuario.responsavel],(err:any, result:any )=>{ 
                        if(err) reject(err);
                        else resolve(result);
                    })

                })
        }


        async selectPorNome(nome:string){
            return new Promise( async  (resolve, reject)=>{
                let sql = `
                    select * from ${db_api}.usuarios where nome = ?
                `;

                await conn.query(sql, [ nome ],(err:any, result:any )=>{ 
                    if(err) reject(err);
                    else 
                        resolve(result);
                })

            })
    }

    async selectPorEmail(email:string){
        return new Promise< UsuarioApi[]>( async  (resolve, reject)=>{

            let sql = `
                select * from ${db_api}.usuarios where email ='${email}'
            `;

            await conn.query(sql,  (err:any, result:any )=>{ 
                if(err){
                    console.log(err); 
                    reject(err);
                }else{ 
                    resolve(result);
                }
             })

        })
    }
 
    async selectPorEmailCodigoValidador(email:string, codigoRecuperador:any){
        return new Promise< UsuarioApi[]>( async  (resolve, reject)=>{
            let sql = `
                select * from ${db_api}.usuarios where email = ? and cod_recuperador = ? 
            `;

            await conn.query(sql, [ email, codigoRecuperador  ],(err:any, result:any )=>{ 
                if(err) reject(err);
                else 
                    resolve(result);
            })

        })
    }

    async selectPorEmailSenha(email:string, senha:any){
        return new Promise< UsuarioApi[]>( async  (resolve, reject)=>{
            let sql = `
                select * from ${db_api}.usuarios where email = ? and senha = ? 
            `;

            await conn.query(sql, [ email, senha  ],(err:any, result:any )=>{ 
                if(err) reject(err);
                else 
                    resolve(result);
            })

        })
    }

    async updateCodigoValidador( codigo:number, data:any, email:any ){
        return new Promise ( async  (resolve, reject)=>{

            let sql = `
                  update ${db_api}.usuarios
                    set cod_recuperador= '${codigo}',
                        data_expiracao='${data}'
                  where email = '${email}'   
            `;

            await conn.query(sql,  (err:any, result:any )=>{ 
                if(err) reject(err);
                else 
                    resolve(result);
            })

        })
    }

    async updateSenha( senha:any,  email:any ){
        return new Promise ( async  (resolve, reject)=>{

            let sql = `
                  update ${db_api}.usuarios
                    set senha = '${senha}' 
                  where email = '${email}'   
            `;

            await conn.query(sql,  (err:any, result:any )=>{ 
                if(err) reject(err);
                else 
                    resolve(result);
            })

        })
    }




}