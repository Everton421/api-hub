import { conn } from "../../database/databaseConfig"
import { newUserEmpresa, usuarioEmpresa } from "./interface";

export class Select_UsuarioEmpresa{

    async buscaGeral( empresa:any){
        return new Promise<usuarioEmpresa[]>( async ( resolve, reject )=>{
            let sql = ` select * from ${empresa}.usuarios;`
            await conn.query( sql ,( err:any, result:any )=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        })
    }

    async buscaPorEmail( empresa:any,email:any ){
        return new Promise<usuarioEmpresa[]>( async ( resolve, reject )=>{
            let sql = ` select * from ${empresa}.usuarios where email = ? ;`
            await conn.query( sql ,[ email ],( err:any, result:any )=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        })
    }
  
    async buscaPorCodigo( empresa:any,codigo:any ){
        return new Promise<usuarioEmpresa[]>( async ( resolve, reject )=>{
            let sql = ` select * from ${empresa}.usuarios where codigo = ? ;`
            await conn.query( sql ,[ codigo ],( err:any, result:any )=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        })
    }
    async buscaPorEmailSenha( empresa:any,email:any, senha:any ){
        return new Promise<usuarioEmpresa[]>( async ( resolve, reject )=>{
            let sql = ` select * from ${empresa}.usuarios where email = ? and senha = ?    ;`
            await conn.query( sql ,[ email, senha  ],( err:any, result:any )=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        })
    }
    async buscaPorEmailNome( empresa:any,email:any, usuario:any ){
        return new Promise<usuarioEmpresa[]>( async ( resolve, reject )=>{
            let sql = ` select * from ${empresa}.usuarios where email = ? and nome = ?    ;`
            await conn.query( sql ,[ email, usuario  ],( err:any, result:any )=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        })
    }




}