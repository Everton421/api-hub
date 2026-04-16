import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { DecodedToken } from '../../services/decoded-token/decodedToken.ts';
import { SelectPhoto } from '../../models/photo/select.ts';
import { InsertPhoto } from '../../models/photo/insert.ts';
import { DeletePhoto } from '../../models/photo/delete.ts';
import { DateService } from '../../utils/dateService.ts';
import { type PhotoType } from '../../models/photo/types/photo-type.ts';

const photoResponseSchema = z.object({
    codigo: z.number().optional(),
    produto: z.number(),
    sequencia: z.number().nullable().optional(),
    descricao: z.string().nullable().optional(),
    link: z.string().nullable().optional(),
    foto: z.string().nullable().optional(),
    data_cadastro: z.string(),
    data_recadastro: z.string()
});

const photosRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/fotos', {
        schema: {
            tags: ['fotos'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                data_recadastro: z.string().optional()
            }),
            response: {
                200: z.array(photoResponseSchema),
                400: z.object({
                    erro: z.boolean(),
                    msg: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const select = new SelectPhoto();
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ erro: true, msg: 'É necessário informar o token!' });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const { data_recadastro } = request.query;

        try {
            const result = await select.findAll(dbName, data_recadastro);
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Erro ao consultar as fotos dos produtos:', e);
            return reply.status(400).send({ erro: true, msg: 'Ocorreu um erro ao consultar as fotos dos produtos' });
        }
    });

    server.get('/fotos/produto', {
        schema: {
            tags: ['fotos'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                codigo: z.coerce.number()
            }),
            response: {
                200: z.array(photoResponseSchema),
                400: z.object({
                    erro: z.boolean(),
                    msg: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const select = new SelectPhoto();
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ erro: true, msg: 'É necessário informar o token!' });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const codigo = Number(request.query.codigo);

        if (!codigo) {
            return reply.status(400).send({ erro: true, msg: 'É necessário informar o código do produto' });
        }

        try {
            const result = await select.findByProduct(dbName, codigo);
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Erro ao consultar as fotos dos produtos:', e);
            return reply.status(400).send({ erro: true, msg: 'Ocorreu um erro ao consultar as fotos dos produtos' });
        }
    });

    server.post('/fotos/produto', {
        schema: {
            tags: ['fotos'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: z.object({
                produto: z.number(),
                fotos: z.array(z.object({
                    sequencia: z.number().optional(),
                    descricao: z.string().optional(),
                    link: z.string().optional(),
                    foto: z.string().optional(),
                    data_cadastro: z.string().optional(),
                    data_recadastro: z.string().optional()
                }))
            }),
            response: {
                201: z.object({
                    ok: z.boolean(),
                    msg: z.string()
                }),
                400: z.object({
                    erro: z.boolean(),
                    msg: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const select = new SelectPhoto();
        const insert = new InsertPhoto();
        const deletar = new DeletePhoto();
        const dateService = new DateService();
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ erro: true, msg: 'É necessário informar o token!' });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const source = request.headers.source as string || 'api_internal';
        const { produto, fotos } = request.body;

        if (!fotos || fotos.length === 0) {
            return reply.status(400).send({ erro: true, msg: 'É necessário informar as fotos do produto' });
        }

        if (!produto) {
            return reply.status(400).send({ erro: true, msg: 'É necessário informar o código do produto' });
        }

        try {
            const validItems = await select.findByProduct(dbName, produto);

            if (validItems.length > 0) {
                const resultDeleteItens = await deletar.delete(dbName, produto);
                if (resultDeleteItens.serverStatus > 0) {
                    for (const foto of fotos) {
                        const photoData: Omit<PhotoType, 'codigo'> = {
                            produto,
                            sequencia: foto.sequencia,
                            descricao: foto.descricao,
                            link: foto.link,
                            foto: foto.foto,
                            data_cadastro: foto.data_cadastro || dateService.obterDataAtual(),
                            data_recadastro: foto.data_recadastro || dateService.obterDataAtual()
                        };
                        await insert.insert(dbName, photoData);
                    }
                }
            } else {
                for (const foto of fotos) {
                    const photoData: Omit<PhotoType, 'codigo'> = {
                        produto,
                        sequencia: foto.sequencia,
                        descricao: foto.descricao,
                        link: foto.link,
                        foto: foto.foto,
                        data_cadastro: foto.data_cadastro || dateService.obterDataAtual(),
                        data_recadastro: foto.data_recadastro || dateService.obterDataAtual()
                    };
                    await insert.insert(dbName, photoData);
                }
            }

            return reply.status(201).send({
                ok: true,
                msg: 'Fotos alteradas com sucesso'
            });
        } catch (e) {
            console.error('Erro ao registrar as fotos do produto:', e);
            return reply.status(400).send({ erro: true, msg: 'Erro ao registrar as fotos do produto' } as const);
        }
    });
};

export { photosRoute };
export default photosRoute;
