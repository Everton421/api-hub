import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { DecodedToken } from '../../services/decoded-token/decodedToken.ts';
import { InsertRequirements } from '../../models/requirements/insert-requirements.ts';
import { UpdateRequirements } from '../../models/requirements/update-requirements.ts';
import { SelectRequirements, SelectItemsRequirements } from '../../models/requirements/select.ts';
import { InsertItemsRequirements, DeleteItemsRequirements } from '../../models/requirements/items-requirements.ts';
import { DateService } from '../../utils/dateService.ts';
import { publishMessage } from '../../services/broker/publish-message.ts';
import { conn } from '../../database/databaseConfig.ts';

const loteSerieItemSchema = z.object({
    lote_serie: z.number(),
    quantidade: z.number()
});

const requirementItemSchema = z.object({
    produto: z.number(),
    quantidade: z.number(),
    descricao: z.string().optional(),
    custo: z.number().optional().nullable(),
    lotes_series: z.array(loteSerieItemSchema).optional()
});

const requirementBodySchema = z.object({
    requerente: z.number(),
    codigo: z.number().optional(),
    responsavel: z.number(),
    setor_origem: z.number(),
    setor_destino: z.number(),
    historico: z.string().optional(),
    itens: z.array(requirementItemSchema),
    data_efetuacao: z.string().optional(),
    situacao: z.enum(['A', 'C', 'E']).default('A'),
});

const requirementUpdateBodySchema = z.object({
    requerente: z.number().optional(),
    setor_origem: z.number().optional(),
    setor_destino: z.number().optional(),
    historico: z.string().optional(),
    situacao: z.enum(['A', 'C', 'E']).default('A'),
    itens: z.array(requirementItemSchema).optional(),
});

const requirementResponseSchema = z.object({
    codigo: z.number(),
    data_requerimento: z.string(),
    requerente: z.coerce.number(),
    data_efetuacao: z.string(),
    responsavel: z.coerce.number(),
    pedido: z.coerce.number().nullable(),
    setor_origem: z.coerce.number(),
    setor_destino: z.coerce.number(),
    historico: z.string(),
    situacao: z.enum(['A','C','E']),
    itens: z.array(z.object({
        produto: z.coerce.number(),
        descricao: z.string().optional(),
        quantidade: z.coerce.number(),
        custo: z.coerce.number().nullable(),
        lotes_series:  z.array(loteSerieItemSchema)
    }))
});

const requirementsRoute: FastifyPluginAsyncZod = async (server) => {
    server.post('/requirements', {
        schema: {
            tags: ['requirements'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: requirementBodySchema,
            response: {
                201: requirementResponseSchema,
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                }),
                500: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const dateService = new DateService();
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: true, message: 'Token inválido' });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const source = request.headers.source as string || 'api_internal';
        const { requerente, setor_origem, setor_destino, responsavel,  historico, data_efetuacao, codigo ,itens , situacao } = request.body;
        const selectRequirements = new SelectRequirements();

        if (!itens || itens.length === 0) {
            return reply.status(400).send({ success: true, message: 'Informe ao menos um item' });
        }
        if(codigo && codigo > 0 ){

                    const sql = `SELECT  
                    codigo
                    FROM ${dbName}.requerimentos WHERE codigo = '${codigo}';`;
            
                console.log(sql)
                    const [result] = await conn.query(sql);

            const verifyExistsByCode = result as any[];

             if(verifyExistsByCode.length > 0 ) {
                 return reply.status(400).send({ success: false, message:  `Requirement Code: ${codigo} already exists.` });
                 }

            //if(verifyExistsByCode.length > 0 ) {
            //    return reply.status(400).send({ success: false, message:  `Requirement Code: ${codigo} already exists.` });
            //    }

        }

        try {
            const insertRequerimento = new InsertRequirements();
            const insertItem = new InsertItemsRequirements();

            const data_requerimento = dateService.obterDataAtual();

            const result = await insertRequerimento.insert(dbName, {
                codigo,
                data_requerimento,
                requerente,
                data_efetuacao: data_efetuacao || '0000-00-00',
                 responsavel,
                pedido: null,
                setor_origem,
                setor_destino,
                historico: historico || '',
                situacao 
            });

            const codigoRequerimento = result.insertId;

            for (const item of itens) {
                await insertItem.insertProductItem(dbName, {
                    requerimento: codigoRequerimento,
                    produto: item.produto,
                    quantidade: item.quantidade,
                    custo: item.custo ?? null
                });

                if (item.lotes_series && item.lotes_series.length > 0) {
                    for (const ls of item.lotes_series) {
                        await insertItem.insertLoteSerieItem(dbName, {
                            requerimento: codigoRequerimento,
                            produto: item.produto,
                            lote_serie: ls.lote_serie,
                            quantidade: ls.quantidade
                        });
                    }
                }
            }

            const selectItems = new SelectItemsRequirements();
            const dbItens = await selectItems.findByRequerimento(dbName, codigoRequerimento);
            const responseItens = [];

            for (const dbItem of dbItens) {
                const dbLotes = await selectItems.findLotesByRequerimentoAndProduto(dbName, codigoRequerimento, dbItem.produto);
                responseItens.push({
                    produto: dbItem.produto,
                    quantidade: dbItem.quantidade,
                    descricao: dbItem.descricao,
                    custo: dbItem.custo,
                    lotes_series: dbLotes.map(l => ({ lote_serie: l.lote_serie, quantidade: l.quantidade }))
                });
            }

            const created = {
                codigo: codigoRequerimento,
                data_requerimento,
                requerente,
                data_efetuacao: data_efetuacao || '0000-00-00',
                responsavel ,
                pedido: null,
                setor_origem,
                setor_destino,
                historico: historico || '',
                situacao ,
                itens: responseItens
            };

            await publishMessage(empresa, 'requerimento.inserido', created, source);

            return reply.status(201).send(created);
        } catch (e) {
            console.error('Error creating requirement:', e);
            return reply.status(500).send({ success: true, message: 'Erro ao criar requerimento' });
        }
    });

    server.get('/requirements', {
        schema: {
            tags: ['requirements'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                codigo: z.coerce.number().optional(),
                situacao:  z.enum(['A','C','E']).optional(),
                data_requerimento: z.string().optional(),
                alterado_apos: z.coerce.string().optional(),
                setor_origem: z.coerce.number().optional(),
                setor_destino: z.coerce.number().optional(),
                requerente: z.coerce.number().optional(),
                responsavel: z.coerce.number().optional(),
                limit: z.coerce.number().optional(),
                search: z.string().optional()
            }),
            response: {
                200: z.array(requirementResponseSchema),
                400: z.object({
                    erro: z.boolean(),
                    message: z.string()
                }),
                500: z.object({
                    erro: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ erro: true, message: 'Token inválido' });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const filters = request.query;
        try {
            const select = new SelectRequirements();
            const selectItems = new SelectItemsRequirements();

            const requirements = await select.findAll(dbName, filters);
            const result = [];

            for (const req of requirements) {
                const dbItens = await selectItems.findByRequerimento(dbName, req.codigo);
                const itens = [];

                for (const dbItem of dbItens) {
                    const dbLotes = await selectItems.findLotesByRequerimentoAndProduto(dbName, req.codigo, dbItem.produto);
                    itens.push({
                        produto: dbItem.produto,
                        descricao: dbItem.descricao,
                        quantidade: dbItem.quantidade,
                        custo: dbItem.custo,
                        lotes_series: dbLotes.map(l => ({ lote_serie: l.lote_serie, quantidade: l.quantidade }))
                    });
                }

                result.push({ ...req, itens });
            }
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Error listing requirements:', e);
            return reply.status(500).send({ erro: true, message: 'Erro ao listar requerimentos' });
        }
    });

    server.get('/requirements/:codigo', {
        schema: {
            tags: ['requirements'],
            headers: z.object({
                token: z.string()
            }),
            params: z.object({
                codigo: z.coerce.number()
            }),
            response: {
                200: requirementResponseSchema,
                400: z.object({
                    erro: z.boolean(),
                    message: z.string()
                }),
                404: z.object({
                    erro: z.boolean(),
                    message: z.string()
                }),
                500: z.object({
                    erro: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ erro: true, message: 'Token inválido' });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const { codigo } = request.params;

        try {
            const select = new SelectRequirements();
            const selectItems = new SelectItemsRequirements();

            const [requirement] = await select.findByCode(dbName, codigo);

            if (!requirement) {
                return reply.status(404).send({ erro: true, message: 'Requerimento não encontrado' });
            }

            const dbItens = await selectItems.findByRequerimento(dbName, codigo);
            const itens = [];

            for (const dbItem of dbItens) {
                const dbLotes = await selectItems.findLotesByRequerimentoAndProduto(dbName, codigo, dbItem.produto);
                itens.push({
                    produto: dbItem.produto,
                    quantidade: dbItem.quantidade,
                    custo: dbItem.custo,
                    lotes_series: dbLotes.map(l => ({ lote_serie: l.lote_serie, quantidade: l.quantidade }))
                });
            }

            return reply.status(200).send({ ...requirement, itens });
        } catch (e) {
            console.error('Error fetching requirement:', e);
            return reply.status(500).send({ erro: true, message: 'Erro ao buscar requerimento' });
        }
    });

    server.put('/requirements/:codigo', {
        schema: {
            tags: ['requirements'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            params: z.object({
                codigo: z.coerce.number()
            }),
            body: requirementUpdateBodySchema,
            response: {
                200: requirementResponseSchema,
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                }),
                404: z.object({
                    success: z.boolean(),
                    message: z.string()
                }),
                500: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: true, message: 'Token inválido' });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const source = request.headers.source as string || 'api_internal';
        const { codigo } = request.params;
        const { itens, ...updateFields } = request.body;

        try {
            const select = new SelectRequirements();
            const [existing] = await select.findByCode(dbName, codigo);

            if (!existing) {
                return reply.status(404).send({ success: true, message: 'Requerimento não encontrado' });
            }

            if (Object.keys(updateFields).length > 0) {
                const update = new UpdateRequirements();
                await update.update(dbName, { ...updateFields, codigo } as any);
            }

            if (itens) {
                const deleteItems = new DeleteItemsRequirements();
                const insertItem = new InsertItemsRequirements();

                await deleteItems.deleteLoteSerieItems(dbName, codigo);
                await deleteItems.deleteProductItems(dbName, codigo);

                for (const item of itens) {
                    await insertItem.insertProductItem(dbName, {
                        requerimento: codigo,
                        produto: item.produto,
                        quantidade: item.quantidade,
                        custo: item.custo ?? null
                    });

                    if (item.lotes_series && item.lotes_series.length > 0) {
                        for (const ls of item.lotes_series) {
                            await insertItem.insertLoteSerieItem(dbName, {
                                requerimento: codigo,
                                produto: item.produto,
                                lote_serie: ls.lote_serie,
                                quantidade: ls.quantidade
                            });
                        }
                    }
                }
            }

            const selectItems = new SelectItemsRequirements();
            const [updated] = await select.findByCode(dbName, codigo);
            const dbItens = await selectItems.findByRequerimento(dbName, codigo);
            const responseItens = [];

            for (const dbItem of dbItens) {
                const dbLotes = await selectItems.findLotesByRequerimentoAndProduto(dbName, codigo, dbItem.produto);
                responseItens.push({
                    produto: dbItem.produto,
                    quantidade: dbItem.quantidade,
                    custo: dbItem.custo,
                    lotes_series: dbLotes.map(l => ({ lote_serie: l.lote_serie, quantidade: l.quantidade }))
                });
            }

            const result = { ...updated, itens: responseItens };

            await publishMessage(empresa, 'requerimento.atualizado', result, source);

            return reply.status(200).send(result);
        } catch (e) {
            console.error('Error updating requirement:', e);
            return reply.status(500).send({ success: true, message: 'Erro ao atualizar requerimento' });
        }
    });

    server.delete('/requirements/:codigo', {
        schema: {
            tags: ['requirements'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            params: z.object({
                codigo: z.coerce.number()
            }),
            response: {
                200: z.object({
                    success: z.boolean(),
                    message: z.string()
                }),
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                }),
                404: z.object({
                    success: z.boolean(),
                    message: z.string()
                }),
                500: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: true, message: 'Token inválido' });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const source = request.headers.source as string || 'api_internal';
        const { codigo } = request.params;

        try {
            const select = new SelectRequirements();
            const [existing] = await select.findByCode(dbName, codigo);

            if (!existing) {
                return reply.status(404).send({ success: true, message: 'Requerimento não encontrado' });
            }

            if (existing.situacao === 'E') {
                return reply.status(400).send({ success: true, message: 'Requerimento efetuado não pode ser cancelado' });
            }

            if (existing.situacao === 'C') {
                return reply.status(400).send({ success: true, message: 'Requerimento já está cancelado' });
            }

            const update = new UpdateRequirements();
            await update.update(dbName, { situacao: 'C', codigo } as any);

            await publishMessage(empresa, 'requerimento.cancelado', { codigo, situacao: 'C' }, source);

            return reply.status(200).send({ success: true, message: 'Requerimento cancelado com sucesso' });
        } catch (e) {
            console.error('Error cancelling requirement:', e);
            return reply.status(500).send({ success: true, message: 'Erro ao cancelar requerimento' });
        }
    });
};

export { requirementsRoute };
export default requirementsRoute;
