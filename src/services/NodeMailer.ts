 const nodemailer = require('nodemailer');

export function NodeMailerService(){

const mail = process.env.MAIL;
const passwordMail = process.env.PASSWORD_MAIL;
const host_mail  = process.env.HOST_MAIL;

                // Criar um objeto de transporte
                const transporter = nodemailer.createTransport({
                    host:  host_mail,
                    port: 465,
                    secure: true, // usa SSL
                    auth: {
                    user: mail,
                    pass: passwordMail,
                    },
                    tls: {
                    rejectUnauthorized: false  // Ignora erros de certificado
                    }
                });
        

          transporter.verify(function(error:any, success:any) {
            if (error) {
                  console.log('Erro de conexão:', error);
            } else {
                  console.log('O servidor está pronto para receber nossas mensagens');
            }
          });

          function gerarNumeroAleatorio() {
            return Math.floor(100000 + Math.random() * 900000);
          }
          
          
          let aux =gerarNumeroAleatorio();
        // Enviar o email


        
        async function main(destinatario:string, codigo:number) {

            const info = await transporter.sendMail({
              from: mail,
            to: destinatario,
            subject: "INTERSIG ✔", // Subject line
            text: "Recuperação de Senha", // plain text body
            html: `  
            <!DOCTYPE html>
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Recuperação de Senha</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        width: 100%;
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    h2 {
                        color: #333;
                    }
                    p {
                        font-size: 16px;
                        color: #555;
                        line-height: 1.5;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 25px;
                        background-color: #007bff;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 16px;
                        text-align: center;
                        margin-top: 20px;
                    }
                    .footer {
                        font-size: 12px;
                        color: #888;
                        text-align: center;
                        margin-top: 30px;
                    }
                    .footer a {
                        color: #888;
                        text-decoration: none;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Recuperação de Senha</h2>
                    <p>Olá,</p>
                    <p>Recebemos uma solicitação para redefinir a senha da sua conta, segue o codigo de recuperação.</p>
                        <h3 style="color:#333" >
                            ${codigo}
                        </h3>
                         <h4>
                            Atenção este codigo é valido apenas por 10 minutos.
                        </h4>

                    <p>Se você não fez essa solicitação, simplesmente ignore este e-mail. Sua senha não será alterada.</p>
                    
                    <div class="footer">
                        <p>Se você tiver dúvidas, entre em contato com nossa equipe de suporte em <a href="mailto:support@exemplo.com">suporte@intersig.com.br</a>.</p>
                        <p>Atenciosamente,</p>
                        <p><strong>Equipe de Suporte</strong></p>
                    </div>
                </div>
            </body>
            </html>
            `,  
          });
    
          console.log("Message sent: %s", info.messageId);
        }

      return {main   }

}