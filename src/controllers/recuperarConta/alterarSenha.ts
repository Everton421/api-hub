import { Request, Response } from "express";
import { UsuariosApi } from "../../models/usuariosApi/usuarios";
import { Update_UsuarioEmpresa } from "../../models/usuariosEmpresa/update";

export class Alterar_senha{

   async main( req:Request, res:Response ){

        let select_usuarioApi = new  UsuariosApi();
        let update_usuarioEmpresa = new Update_UsuarioEmpresa();

        if( !req.body.email) return res.status(200).json({erro:true, msg:"Não foi informado email para validação"})
        if( !req.body.codigo) return res.status(200).json({erro:true, msg:"Não foi informado o codigo para validação"})
        if( !req.body.senha) return res.status(200).json({erro:true, msg:"Não foi informado a nova senha"})

            let reqEmail:string =  String(req.body.email);
            let reqCodigo:string = String(req.body.codigo);
            let reqSenha:any = req.body.senha;

            let validUser:any[] = await select_usuarioApi.selectPorEmail(reqEmail);

                if(validUser.length >  0 ){
                    let data = new Date();
                    let dataAtual = formatData(data)
                    let dataExpiracao = formatData(validUser[0].data_expiracao)
                        if( dataAtual > dataExpiracao){

                            return res.status(200).json({erro:true, msg:"Codigo expirado, é necessario enviar o codigo novamente"})
                        }else{
                            console.log(dataAtual,'>',dataExpiracao)
                            
                                if( reqCodigo !== validUser[0].cod_recuperador ){
                                    console.log(`${reqCodigo} !== ${validUser[0].cod_recuperador}`)
                                    return res.status(200).json({erro:true, msg:"Codigo invalido"})
                                   
                                    }else{
                                    let resultUserApi:any = await  select_usuarioApi.updateSenha(reqSenha, reqEmail)
                                    let cnpj = validUser[0].cnpj.replace(/\D/g, '');
                                        cnpj= `\`${cnpj}\``;
                                 let resultUserEmpresa:any = await update_usuarioEmpresa.updateSenha(cnpj, reqSenha, reqEmail);
                                   if(resultUserApi.affectedRows > 0 && resultUserEmpresa.affectedRows){  res.status(200).json({ok:true, msg:"Senha alterada com sucesso!"})
                                 }else{
                                         res.status(200).json({erro:true, msg:`ocorreu um erro ao tentar atualizar a senha para o usuario ${reqEmail}`})
                                     }
                                }
                 
                        }

                }  else{
                    return res.status(200).json({erro:true, msg:"email nao encontrado"})
                }
                
                
                function obterDataAtual() {
                    const dataAtual = new Date();
                    const dia = String(dataAtual.getDate()).padStart(2, '0');
                    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
                    const ano = dataAtual.getFullYear();
                    const hora = String(dataAtual.getHours()).padStart(2, '0');
                    const minuto = String(dataAtual.getMinutes()).padStart(2, '0');
                    const segundo = String(dataAtual.getSeconds()).padStart(2, '0');
                    return `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
                }
                function formatData(data:any) {
                    const dia = String(data.getDate()).padStart(2, '0');
                    const mes = String(data.getMonth() + 1).padStart(2, '0');
                    const ano = data.getFullYear();
                    const hora = String(data.getHours()).padStart(2, '0');
                    const minuto = String(data.getMinutes()).padStart(2, '0');
                    const segundo = String(data.getSeconds()).padStart(2, '0');
                    return `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
                }
                
    }
}