
import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { DecodedToken } from "../../services/decoded-token/decodedToken.ts";
import { DateService } from "../../utils/dateService.ts";
import { SelectCategory } from "../../models/category/select.ts";
import { InsertCategory } from "../../models/category/insert.ts";
import { publishMessage } from "../../services/broker/publish-message.ts";
import { UpdateCategory } from "../../models/category/update.ts";

export const categoryRoute : FastifyPluginAsyncZod = async ( server )=>{
    server.get('/bulk/categorias' ,  {
          schema:
            {
                tags: ['categorias'],
                headers: z.object({
                    token: z.string()
                }),
                querystring: z.object({
                    data_recadastro: z.string(),
                    limit: z.number().optional()
                }),
                response: { 
                    200: z.array(
                        z.object({
                            codigo : z.number(),
                             id : z.string(),
                             data_cadastro : z.string(),
                             data_recadastro : z.string(),
                             descricao : z.string(),
                             ativo : z.enum([ "S" , "n" ]).default('S')
                        })
                        ),
                        500: z.object({
                            sucess: z.boolean(),
                            message: z.string()
                        }),
                        400: z.object({
                        sucess: z.boolean(),
                            message: z.string()
                        })
                }
            }
    }, async (request, reply )=>{
        const dateService = new DateService();

        let select = new SelectCategory();
        let decodToken = DecodedToken(String(request.headers.token))
        let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');
        let dbName = `\`${empresa}\``;
        const limit = request.query.limit;
          let data_recadastro: string = '';

       if (request.query.data_recadastro) {

                if (!dateService.isValidDate(request.query.data_recadastro as string)) {
                    return reply.status(400).send({
                        sucess: true,
                        message: "Informe a data no formato YYYY-MM-DD HH:mm:ss"
                    });
                    }

                data_recadastro = String(request.query.data_recadastro);
            }
        try {

            let resultado: any = await select.findAll(dbName, limit, data_recadastro);
            return reply.status(200).send(resultado)

        } catch (e) {
            console.log("ocorreu um erro ao consultar as categorias", e)
            return reply.status(500).send({ sucess: true, message: "ocorreu um erro ao consultar as categorias" })

        }
    });



        server.get('/categorias/search', {
            schema: {
                tags: ['categorias'],
                headers: z.object({
                    token: z.string()
                }),
                querystring: z.object({
                    codigo: z.coerce.number().optional(),
                    descricao: z.string().optional(),
                    id: z.coerce.string().optional(),
                    ativo: z.string().optional(),
                    limit: z.coerce.number().optional()
                }),
                response: {
                    200: z.array(z.object({
                        codigo: z.number(),
                        id: z.string(),
                        data_cadastro: z.string(),
                        data_recadastro: z.string(),
                        descricao: z.string(),
                        ativo: z.string()
                    })),
                    400: z.object({
                        success: z.boolean(),
                        message: z.string()
                    })
                }
            }
        }, async (request, reply) => {
            const select = new SelectCategory();
            const decodedToken = DecodedToken(String(request.headers.token));
            const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
            const dbName = `\`${empresa}\``;
    
            try {
                const result = await select.findByParams(dbName, request.query);
                return reply.status(200).send(result);
            } catch (e) {
                console.error('Error searching brands:', e);
                return reply.status(400).send({ success: false, message: 'Error searching category' });
            }
        });
    

      server.post('/categorias', {
            schema: {
                tags: ['categorias'],
                headers: z.object({
                    token: z.string(),
                    source: z.string().optional()
                }),
                body: z.object({
                    id: z.string(),
                    descricao: z.string(),
                    ativo: z.enum(['S', 'N']).default('S')
                }),
                response: {
                    200: z.object({
                        codigo: z.number(),
                        id: z.string(),
                        data_cadastro: z.string(),
                        data_recadastro: z.string(),
                        descricao: z.string(),
                        ativo: z.string()
                    }),
                    400: z.object({
                        success: z.boolean(),
                        message: z.string()
                    })
                }
            }
        }, async (request, reply) => {
            const dateService = new DateService();
            const decodedToken = DecodedToken(String(request.headers.token));
    
            if (!decodedToken.payload?.cnpj) {
                return reply.status(400).send({ success: false, message: 'Company identifier not provided' });
            }
    
            const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
            const dbName = `\`${empresa}\``;
            const source = request.headers.source as string || 'api_internal';
            const { id, descricao, ativo } = request.body;
    
            const data_cadastro = dateService.obterDataAtual();
            const data_recadastro = dateService.obterDataHoraAtual();
    
            const insert = new InsertCategory();
            const select = new SelectCategory();
                const verify = await select.findById(dbName, id, 1 );
                if(verify.length > 0 ){
                    return reply.status(400).send({ success: false , message: `Category ID ${id} already exists.`})
                }
            try {
                const result = await insert.create(dbName, { id, descricao, ativo, data_cadastro, data_recadastro });
                const item = { codigo: result.insertId, id, descricao, ativo, data_cadastro, data_recadastro };
                await publishMessage(empresa, 'categoria.inserido', item, source);
                return reply.status(200).send(item);
            } catch (e) {
                console.error('Error inserting brand:', e);
                return reply.status(400).send({ success: false, message: 'Error inserting category' });
            }
        });

         server.put('/categorias', {
                schema: {
                    tags: ['categorias'],
                    headers: z.object({
                        token: z.string(),
                        source: z.string().optional()
                    }),
                    body: z.object({
                        codigo: z.number(),
                        id: z.string(),
                        descricao: z.string(),
                        ativo: z.enum(['S', 'N']).default('S')
                    }),
                    response: {
                        200: z.object({
                            codigo: z.number(),
                            id: z.string(),
                            data_cadastro: z.string(),
                            data_recadastro: z.string(),
                            descricao: z.string(),
                            ativo: z.string()
                        }),
                        400: z.object({
                            success: z.boolean(),
                            message: z.string()
                        })
                    }
                }
            }, async (request, reply) => {
                const dateService = new DateService();
                const select = new SelectCategory();
                const update = new UpdateCategory();
                const decodedToken = DecodedToken(String(request.headers.token));
        
                if (!decodedToken.payload?.cnpj) {
                    return reply.status(400).send({ success: false, message: 'Company identifier not provided' });
                }
        
                const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
                const dbName = `\`${empresa}\``;
                const source = request.headers.source as string || 'api_internal';
                const { codigo, id, descricao, ativo } = request.body;
        
                if (!codigo) {
                    return reply.status(400).send({ success: false, message: 'Code is required' });
                }
        
                const existing = await select.findByCode(dbName, codigo, 1 );
                if (existing.length === 0) {
                    return reply.status(400).send({ success: false, message: 'category not found' });
                }
        
                const data_cadastro = existing[0].data_cadastro;
                const data_recadastro = dateService.obterDataHoraAtual();
        
                try {
                    const result = await update.update(dbName, { codigo, id, descricao, ativo, data_cadastro, data_recadastro });
        
                    if (result.affectedRows > 0) {
                        const item = { codigo, id, descricao, ativo, data_cadastro, data_recadastro };
                        await publishMessage(empresa, 'categoria.atualizado', item, source);
                        return reply.status(200).send(item);
                    }
        
                    return reply.status(400).send({ success: false, message: 'No rows affected' });
                } catch (e) {
                    console.error('Error updating brand:', e);
                    return reply.status(400).send({ success: false, message: 'Error updating category' });
                }
            });
    
}

  