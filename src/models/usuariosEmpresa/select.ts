import { conn, db_api } from "../../database/databaseConfig"
import { queryUsuarioEmpresa } from "../../types/usuarioEmpresa/type-usuario-empresa";
import { newUserEmpresa, usuarioEmpresa } from "./interface";

export class Select_UsuarioEmpresa{

    async buscaGeral( empresa:any){
        return new Promise<usuarioEmpresa[]>( async ( resolve, reject )=>{
            let sql = ` select * from ${empresa}.usuarios;`
            await conn.query( sql ,( err:any, result:any )=>{
                if(err){
                    console.log(err)
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
          let sql = ` select u.*, e.tipo_contrato, DATE_FORMAT(e.data_contrato, '%Y-%m-%d') data_contrato  , e.dias_contrato
                     from ${empresa}.usuarios u 
                        join ${db_api}.empresas e 
                        on u.cnpj = e.cnpj
                      where u.email = ? and u.senha = ?    ;`
            await conn.query( sql ,[ email, senha  ],( err:any, result:any )=>{
                if(err){
                    console.log(err)
                    reject(err);

                }else{
                    resolve(result);
                }
            })
        })
    }
    async buscaPorEmailNome( empresa:any,email:any, nome:any ){
        return new Promise<usuarioEmpresa[]>( async ( resolve, reject )=>{
            let sql = ` select * from ${empresa}.usuarios where email = ? and nome = ?    ;`
            await conn.query( sql ,[ email, nome  ],( err:any, result:any )=>{
                if(err){
                    console.log(`erro ao tentar consultar usuario: ${nome}  da empresa ${empresa}`)
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        })
    }

    async novaBusca(empresa:string, query:queryUsuarioEmpresa){
         return new Promise<usuarioEmpresa[]>( async ( resolve, reject )=>{
          
            let sql = ` select * from ${empresa}.usuarios;`

            let paramSql = [];
            const valueSql =[]

            if(query.codigo){
                    paramSql.push(" codigo = ? ")
                    valueSql.push(query.codigo)
            }

            let whereClause
     await conn.query( sql ,( err:any, result:any )=>{
                if(err){
                    console.log(err)
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        })

        }



}