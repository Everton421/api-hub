import { Request, Response } from "express";
import { Select_UsuarioEmpresa } from "../../models/usuariosEmpresa/select";
import { UsuariosApi } from "../../models/usuariosApi/usuarios";
import { UsuarioApi } from "../../models/usuariosApi/interface";
import { db_api } from "../../database/databaseConfig";
import { validaContratoLogin } from "../../services/validaContrato/validaContrato";
 
export class Login {

    async login( req:Request,res:Response){
        let selectUserApi = new UsuariosApi();
        let selectUserEmpresa = new Select_UsuarioEmpresa();
        
        if(!req.body.email) return res.status(400).json({erro:true, msg:`É Necessario Informar o Email`})  ;
        
        if(!req.body.senha || req.body.senha ==='' )  return res.status(400).json({erro:true, msg:`É Necessario Informar a Senha`})  ;
        
        let  { email , senha  } = req.body 

 

        let validUserEmail = await selectUserApi.selectPorEmail( email  );

        if( validUserEmail.length > 0 ){
            let validPassword =validUserEmail[0].senha 
            if(validPassword !== String(senha) ){
                return res.status(400).json({ erro:true, msg:`Senha Incorreta!`});
            }
 

        } else{
            return res.status(400).json({erro:true, msg:`Usuário não Encontrado!`});
            
        }    
        
        
   
        let validUserApi = await selectUserApi.selectPorEmailSenha( email,senha ); 

            if(validUserApi.length > 0  ){
                
           //     let empresa = `\`${validUserApi[0].cnpj }\``;
                
                let empresa = validUserApi[0].cnpj.replace(/\D/g, '');
                empresa= `\`${empresa}\``;



                

                let resultValidContrato = await validaContratoLogin(validUserApi[0].cnpj)

                    if(resultValidContrato.valido === false ){
                        return res.status(400).json(
                            {
                                erro:true,
                                tipo_contrato: resultValidContrato.tipo_contrato,
                                msg:    resultValidContrato.tipo_contrato === 'T' ? 'Período de teste Expirado.' :`${resultValidContrato.motivo}`  
                                });

                    }

             //   console.log(resultValidContrato)
                


              let arrUser  = await selectUserEmpresa.buscaPorEmailSenha( empresa,email,senha  );
               if( arrUser.length > 0 ){

                      let useLogin:any = arrUser[0];
                     return res.status(200).json( 
                         {
                            status:{
                            ok:true
                            } ,                            
                            data:{
                              email: useLogin.email,
                              senha: useLogin.senha ,
                              empresa:validUserApi[0].cnpj,
                              codigo:useLogin.codigo,
                              nome:useLogin.nome,
                              tipo_contrato: useLogin.tipo_contrato,
                              data_contrato:useLogin.data_contrato,
                              dias_contrato: useLogin.dias_contrato
                            }
                            })
                   }

            } 
           

      //  return res.status(200).json(req.body)
    }
}