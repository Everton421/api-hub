import { Request, Response } from "express";
import { UsuariosApi } from "../../models/usuariosApi/usuarios";
import { NodeMailerService } from "../../services/NodeMailer";

export class EnvioCodigoValidador{

    async main( req:Request, res:Response ){

        let select_usuarioApi = new  UsuariosApi();
        let nodemailer = NodeMailerService();

          function gerarNumeroAleatorio() {
                return Math.floor(100000 + Math.random() * 900000);
              }

          if( !req.body.email) return res.status(200).json({erro:true, msg:"Não foi informado email para validação"})

            let reqEmail:string =  String(req.body.email);
            let validUser:any[] = await select_usuarioApi.selectPorEmail(reqEmail);

            if(validUser.length >  0 ){

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

                        let emailUser = validUser[0].email;
                        
                        let dataAtual = new Date();
                        dataAtual.setMinutes(dataAtual.getMinutes() + 10);
                        const novaData = formatData(dataAtual);
                    //  console.log('Data original:', obterDataAtual());
                    //  console.log('Nova data com 5 minutos adicionados:', novaData);
                        
                        let codigoValidador = gerarNumeroAleatorio();
                        await select_usuarioApi.updateCodigoValidador(codigoValidador, novaData,emailUser );

                
                try{
                        nodemailer.main(validUser[0].email, codigoValidador);
                        return res.status(200).json({ok:true, msg:"codigo enviado com sucesso!"})
                    }catch(e){
                        return res.status(200).json({erro:true, msg:"erro ao enviar o email!"})
                    }

            }else{
             return res.status(200).json({erro:true, msg:"email nao encontrado"})
            }

    }
}