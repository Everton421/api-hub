import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { DecodedToken } from '../../services/decoded-token/decodedToken.ts';
import { SelectProductSector } from '../../models/product-sector/select.ts';
import { InsertProductSector } from '../../models/product-sector/insert.ts';
import { DateService } from '../../utils/dateService.ts';
import { publishMessage } from '../../services/broker/publish-message.ts';
import { type ProductSectorType } from '../../models/product-sector/types/product-sector-type.ts';

const productSectorResponseSchema = z.object({
    setor: z.number(),
    produto: z.number(),
    estoque: z.number(),
    local_produto: z.string(),
    local1_produto: z.string(),
    local2_produto: z.string(),
    local3_produto: z.string(),
    local4_produto: z.string(),
    data_recadastro: z.string(),
    id_produto: z.string(),
    id_setor: z.string()
});

const productSectorBodySchema = z.object({
    setor: z.number(),
    produto: z.number(),
    estoque: z.number().default(0),
    local_produto: z.string().default(''),
    local1_produto: z.string().default(''),
    local2_produto: z.string().default(''),
    local3_produto: z.string().default(''),
    local4_produto: z.string().default('')
});

const productSectorOfflineBodySchema = z.array(z.object({
    setor: z.number(),
    produto: z.number(),
    estoque: z.number(),
    local_produto: z.string().default(''),
    local1_produto: z.string().default(''),
    local2_produto: z.string().default(''),
    local3_produto: z.string().default(''),
    local4_produto: z.string().default(''),
    data_recadastro: z.string().optional()
}));

const productSectorRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/bulk/produtos-setor', {
        schema: {
            tags: ['produtos-setor'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                data_recadastro: z.string().optional(),
                limit: z.coerce.number().optional()
            }),
            response: {
                200: z.array(productSectorResponseSchema),
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
        const select = new SelectProductSector();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const { data_recadastro, limit } = request.query;

        try {
            let result = await select.findAll(dbName, data_recadastro);
            if (limit && result.length > limit) {
                result = result.slice(0, limit);
            }
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Error fetching product sectors:', e);
            return reply.status(500).send({ success: false, message: 'Error fetching product sectors' });
        }
    });

    server.get('/produtos-setor/search', {
        schema: {
            tags: ['produtos-setor'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                produto: z.coerce.number().optional(),
                setor: z.coerce.number().optional()
            }),
            response: {
                200: z.array(productSectorResponseSchema),
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const select = new SelectProductSector();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const { produto, setor } = request.query;

        if (!produto) {
            return reply.status(400).send({ success: false, message: 'Product code is required' });
        }

        try {
            let result;
            if (setor) {
                result = await select.findByProductAndSector(dbName, produto, setor);
            } else {
                result = await select.findByProduct(dbName, produto);
            }
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Error searching product sectors:', e);
            return reply.status(400).send({ success: false, message: 'Error searching product sectors' });
        }
    });

    server.put('/produtos-setor', {
        schema: {
            tags: ['produtos-setor'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: productSectorBodySchema,
            response: {
                200: z.object({
                    success: z.boolean(),
                    message: z.string()
                }),
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const dateService = new DateService();
        const select = new SelectProductSector();
        const insert = new InsertProductSector();
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: 'Company identifier not provided' });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const source = request.headers.source as string || 'api_internal';
        const { produto, setor, estoque, local_produto, local1_produto, local2_produto, local3_produto, local4_produto } = request.body;

        const data_recadastro = dateService.obterDataHoraAtual();

        try {
            const existing = await select.findByProductAndSector(dbName, produto, setor);

            if (existing.length > 0) {
                const resultVerify = existing[0];
                if (new Date(data_recadastro) > new Date(resultVerify.data_recadastro)) {
                    const objInsert = {
                        setor,
                        produto,
                        estoque,
                        local_produto,
                        local1_produto,
                        local2_produto,
                        local3_produto,
                        local4_produto,
                        data_recadastro
                    };
                    await insert.insertOrUpdate(dbName, objInsert);
                    const [updated] = await select.findByProductAndSector(dbName, produto, setor);
                    await publishMessage(empresa, 'produtosetor.atualizado', updated, source);
                    return reply.status(200).send({ success: true, message: 'Stock updated successfully' });
                } else {
                    return reply.status(200).send({ success: true, message: 'No update needed - sent date is older or equal' });
                }
            } else {
                const objInsert = {
                    setor,
                    produto,
                    estoque,
                    local_produto,
                    local1_produto,
                    local2_produto,
                    local3_produto,
                    local4_produto,
                    data_recadastro
                };
                await insert.insertOrUpdate(dbName, objInsert);
                const [newResult] = await select.findByProductAndSector(dbName, produto, setor);
                await publishMessage(empresa, 'produtosetor.atualizado', newResult, source);
                return reply.status(200).send({ success: true, message: 'Stock updated successfully' });
            }
        } catch (e) {
            console.error('Error updating product sector:', e);
            return reply.status(400).send({ success: false, message: 'Error updating product sector' });
        }
    });

    server.put('/bulk/produtos-setor', {
        schema: {
            tags: ['produtos-setor'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: productSectorOfflineBodySchema,
            response: {
                200: z.object({
                    success: z.boolean(),
                    itens: z.array(z.object({
                        produto: z.number()
                    }))
                }),
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const dateService = new DateService();
        const select = new SelectProductSector();
        const insert = new InsertProductSector();
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: 'Company identifier not provided' });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const source = request.headers.source as string || 'api_internal';
        const dados = request.body;

        if (!Array.isArray(dados) || dados.length === 0) {
            return reply.status(400).send({ success: false, message: 'Array of items is required' });
        }

        const updatedItens: { produto: number }[] = [];

        try {
            for (const item of dados) {
                if (!item.setor || !item.produto || item.estoque === undefined) {
                    return reply.status(400).send({ success: false, message: 'Setor, produto and estoque are required for each item' });
                }

                const data_recadastro = item.data_recadastro || dateService.obterDataHoraAtual();

                const existing = await select.findByProductAndSector(dbName, item.produto, item.setor);

                if (existing.length > 0) {
                    const resultVerify = existing[0];
                    if (new Date(data_recadastro) > new Date(resultVerify.data_recadastro)) {
                        const objInsert = {
                            setor: item.setor,
                            produto: item.produto,
                            estoque: item.estoque,
                            local_produto: item.local_produto,
                            local1_produto: item.local1_produto,
                            local2_produto: item.local2_produto,
                            local3_produto: item.local3_produto,
                            local4_produto: item.local4_produto,
                            data_recadastro
                        };
                        await insert.insertOrUpdate(dbName, objInsert);
                        const [updated] = await select.findByProductAndSector(dbName, item.produto, item.setor);
                        await publishMessage(empresa, 'produtosetor.atualizado', updated, source);
                        updatedItens.push({ produto: item.produto });
                    }
                } else {
                    const objInsert = {
                        setor: item.setor,
                        produto: item.produto,
                        estoque: item.estoque,
                        local_produto: item.local_produto,
                        local1_produto: item.local1_produto,
                        local2_produto: item.local2_produto,
                        local3_produto: item.local3_produto,
                        local4_produto: item.local4_produto,
                        data_recadastro
                    };
                    await insert.insertOrUpdate(dbName, objInsert);
                    const [newResult] = await select.findByProductAndSector(dbName, item.produto, item.setor);
                    await publishMessage(empresa, 'produtosetor.atualizado', newResult, source);
                    updatedItens.push({ produto: item.produto });
                }
            }

            return reply.status(200).send({ success: true, itens: updatedItens });
        } catch (e) {
            console.error('Error updating product sectors offline:', e);
            return reply.status(400).send({ success: false, message: 'Error updating product sectors offline' });
        }
    });
};

export { productSectorRoute };
export default productSectorRoute;
