import z from "zod";
import { type UsuarioApi } from "../../models/users-api/interface.ts";
import { SelectUsersApi } from "../../models/users-api/select.ts";
import { SelectCompany } from "../../models/company/select.ts";
import { CompanyStructure } from "../../database/tables-structures/company-structure.ts";
import { InsertCompany } from "../../models/company/insert.ts";
import { Update_empresa } from "../../models/company/update.ts";
import { DateService } from "../../utils/dateService.ts";
import { InsertUsersApi } from "../../models/users-api/insert.ts";
import jwt from 'jsonwebtoken';
import { DecodedToken } from "../../services/decoded-token/decodedToken.ts";
import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { InsertUserCompany } from "../../models/user-company/insert.ts";
import { MakeProduct } from "../../factories/make-product.ts";
import { MakeService } from "../../factories/make-service.ts";
import { MakeClient } from "../../factories/make-client.ts";
import { MakeOrder } from "../../factories/make-order.ts";


    type newUserOmitCode = Omit<UsuarioApi, "codigo">;
    type ativo = { ativo: 'S' | 'N' }
    type newUser = newUserOmitCode & ativo


 const  companyRoute : FastifyPluginAsyncZod = async ( server )=>{
server.get('/empresa', { 
            schema: { 
                tags: ['empresas'],
                headers:z.object({
                         token: z.string()
                    }),
                    response: {
                        200: z.object({
                              cnpj:z.string(),
                              data_contrato: z.string(), 
                              telefone:z.string() ,
                              nome:z.string() ,
                              email:z.string() ,
                              codigo: z.number(),
                              responsavel: z.number(),
                              logo_url: z.string().nullable(),
                              cor_fonte: z.string(),
                              cor_fundo: z.string(),
                              cor_banner: z.string()
                        }),
                        400: z.object({ success: z.boolean(), message: z.string()})
                    }
                          
            }
        },
        async ( request, reply )=>{
                            let decodToken = DecodedToken(String(request.headers.token))
                            const selectCompany = new SelectCompany();
      
                                  const { cnpj } = decodToken.payload!;
                            const resultCompany = await selectCompany.findByCnpj(cnpj);
                             if(resultCompany.length >  0 ){
    
                                    const company = resultCompany[0];
                                    return reply.status(200).send({ 
                                        cnpj: company.cnpj, 
                                        data_contrato: company.data_contrato, 
                                        telefone: company.telefone, 
                                        nome: company.nome,
                                        email: company.email, 
                                        codigo: company.codigo, 
                                        responsavel: company.responsavel,
                                        logo_url: company.logo_url,
                                        cor_fonte: company.cor_fonte,
                                        cor_fundo: company.cor_fundo,
                                        cor_banner: company.cor_banner
                                    });
                             }else{
                               return reply.status(400).send({success:false, message:"Compony not found." });
    
                             }
    
                       } 
    );

    server.put('/empresa', { 
        schema: { 
            tags: ['empresas'],
            headers: z.object({
                token: z.string()
            }),
            body: z.object({
                logo_url: z.string().url().optional(),
                cor_fonte: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().default('#333333'),
                cor_fundo: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().default('#FFFFFF'),
                cor_banner: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().default('#1a73e8')
            }),
            response: {
                200: z.object({
                    success: z.boolean(),
                    message: z.string(),
                    data: z.object({
                        cnpj: z.string(),
                        nome: z.string(),
                        email: z.string(),
                        telefone: z.string(),
                        logo_url: z.string().nullable(),
                        cor_fonte: z.string(),
                        cor_fundo: z.string(),
                        cor_banner: z.string()
                    })
                }),
                500: z.object({ success: z.boolean(), message: z.string() }),
                400: z.object({ success: z.boolean(), message: z.string() }),
                401: z.object({ success: z.boolean(), message: z.string() })
            }
        }
    },
    async (request, reply) => {
        const decodedToken = DecodedToken(String(request.headers.token));
        
        if (!decodedToken.success || !decodedToken.payload) {
            return reply.status(401).send({ success: false, message: "Token inválido" });
        }

        const { logo_url, cor_fonte, cor_fundo, cor_banner } = request.body;
        const cnpj = decodedToken.payload.cnpj;

        const selectCompany = new SelectCompany();
        const resultCompany = await selectCompany.findByCnpj(cnpj);

        if (resultCompany.length === 0) {
            return reply.status(400).send({ success: false, message: "Empresa não encontrada" });
        }

        const updateEmpresa = new Update_empresa();
        const updateData = {
            logo_url,
            cor_fonte,
            cor_fundo,
            cor_banner
        };

        try {
            await updateEmpresa.atualizar_dados_empresa(cnpj, updateData);
            
            const updatedCompany = await selectCompany.findByCnpj(cnpj);
            const company = updatedCompany[0];

            return reply.status(200).send({
                success: true,
                message: "Empresa atualizada com sucesso",
                data: {
                    cnpj: company.cnpj,
                    nome: company.nome,
                    email: company.email,
                    telefone: company.telefone,
                    logo_url: company.logo_url,
                    cor_fonte: company.cor_fonte,
                    cor_fundo: company.cor_fundo,
                    cor_banner: company.cor_banner
                }
            });
        } catch (error) {
            console.error("Erro ao atualizar empresa:", error);
            return reply.status(500).send({ success: false, message: "Erro ao atualizar empresa" });
        }
    });

    server.post('/criar-empresa' ,  {
          schema:
            {
                tags: ['empresas'],
                body: z.object({
                    usuario: z.object({
                        nome: z.string().max(255),
                        email: z.string().max(255),
                        senha: z.string().max(255),
                        telefone: z.string().max(255) 
                    }),
                    empresa: z.object({
                        cnpj: z.string().max(14),
                         nome_empresa: z.string().max(255),
                         email_empresa:z.string().max(255),
                         telefone_empresa: z.string().max(255),
                         dados_teste: z.boolean().default( true ),
                         tipo_contrato: z.enum([ 'T' , 'N']).default("T"),
                    })

                })
            }
    }, async (request, reply )=>{

            const selectUsersApi = new SelectUsersApi();
            const selectCompany = new SelectCompany();
            const companyStructure = new CompanyStructure();
            const insertUsersCompany = new InsertUserCompany();
            const insertCompany = new InsertCompany();
            const dateService = new DateService();
            const insertUsersApi = new InsertUsersApi();
                     const factoryProduct = new MakeProduct();
                     const makeService = new MakeService();
                     const makeClient = new MakeClient();
                     const makeOrder = new MakeOrder();
            const { empresa , usuario }  = request.body;
            let  { cnpj, tipo_contrato,dados_teste  } = empresa;
            const { nome, email, senha, telefone } = usuario;

                const email_empresa: string = request.body.empresa.email_empresa;
                const nome_empresa: string = request.body.empresa.nome_empresa;
                const telefone_empresa: string = request.body.empresa.telefone_empresa;

            let responsavel: string = "S";
            const ativo = 'S'

                cnpj = cnpj.replace(/\D/g, '');  // Remove qualquer caractere que não seja número
                const codigo_perfil = 0 ; 
                    let objUser: newUser = { nome, email, cnpj, senha, responsavel, telefone, ativo , codigo_perfil };
                        
                    // Regex para remover caracteres não numéricos
                    cnpj = cnpj.replace(/\D/g, '');  // Remove qualquer caractere que não seja número

                    if (cnpj.length < 11 || cnpj.length > 14) {
                    return reply.status(400).send({ success: false, message: "CPF/CNPJ inválido." });
                    } else {
                    if (cnpj.length === 12 || cnpj.length === 13) {
                        return reply.status(400).send({ success: false, message: "CPF/CNPJ inválido." });
                    }
                    }

                  const  dbName = `\`${cnpj}\``;  // Usando o CNPJ formatado como nome do banco

                    
                        let validUserApi: UsuarioApi[] = await selectUsersApi.findByEmail(
                          objUser.email
                        );
                        if (validUserApi.length > 0)
                          return reply.status(400).send({
                              sucess: false,
                              message: ` Já existe usuario cadastrado com este email ${objUser.email}`,
                            });
                            
                            const verify = await selectCompany.verifyExistsCompany(cnpj);
                            if(verify){
                                return reply.status(400).send({ sucess: false, message: "A empresa com o cnpj/cpf informado já foi cadastrada."})
                              }else{
                                
                                const userApiRegister = await insertUsersApi.insertUser(objUser);
                                    //console.log("RESULT INSERT USER API : ", userApiRegister)
                                                  await companyStructure.createStructure(cnpj);
                                    if(userApiRegister.insertId > 0 ){

                                            
                                             let objEmpresa = {
                                                responsavel: userApiRegister.insertId,
                                                cnpj: cnpj,
                                                nome_empresa: nome_empresa,
                                                email_empresa: email_empresa,
                                                telefone_empresa: telefone_empresa,
                                                tipo_contrato: tipo_contrato,
                                                data_contrato: dateService.obterDataAtual(),
                                                dias_contrato: 30,
                                                inicio_contrato: dateService.obterDataAtual(),
                                                fim_contrato: '0000-00-00'
                                                };
                                               const resultInsertCompany = await insertCompany.insertCompany(objEmpresa);
                                           
                                                /// //////////////// 
                                                ///   items de teste
                                                
                                                  await factoryProduct.createByFakeStoreApi( dbName, 5)
                                                  await makeService.createService( dbName,3)
                                                  await makeClient.create(dbName, 5)
                                                  await makeOrder.create(dbName,'EA');
                                                /// //////////
                               const userCompanyRegister = await insertUsersCompany.insert(dbName, objUser)
                               const userCompanyId = userCompanyRegister.insertId;
                            const secret = process.env.SECRET;
                              if (!secret) {
                                  console.error("Erro crítico: JWT_SECRET não está definido!");
                                  return reply.status(500).send({ msg: "Erro interno do servidor [JWT Secret Missing]." });
                                }
                                const payload = {
                                                      cnpj: cnpj,
                                                      email: email,
                                                      senha: senha,
                                                      codigo:userCompanyId
                                                    }
                                                    const token = jwt.sign(
                                                      payload, secret
                                                    )
                              return reply.status(200).send( { success: true, message: "Empresa registrada com sucesso!" } );
                                    }
                            }


    });
    
 
}

export { companyRoute}
export default  companyRoute