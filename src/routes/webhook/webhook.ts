import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import crypto from 'node:crypto';
import { DecodedToken } from '../../services/decoded-token/decodedToken.ts';
import { SelectWebhook } from '../../models/webhook/select.ts';
import { InsertWebhook } from '../../models/webhook/insert.ts';
import { UpdateWebhook } from '../../models/webhook/update.ts';
import { DeleteWebhook } from '../../models/webhook/delete.ts';
import axios, { isAxiosError } from 'axios';

const webhookResponseSchema = z.object({
    codigo: z.number(),
    cnpj: z.string(),
    url: z.string(),
    eventos: z.string(),
    secret: z.string(),
    ativo: z.string(),
    ultimo_status: z.number().nullable(),
    ultimo_erro: z.string().nullable(),
    data_cadastro: z.string(),
    data_recadastro: z.string()
});

const webhookRoute: FastifyPluginAsyncZod = async (server) => {

    server.get('/webhooks', {
        schema: {
            tags: ['webhooks'],
            headers: z.object({
                token: z.string()
            }),
            response: {
                200: z.array(webhookResponseSchema),
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const select = new SelectWebhook();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');

        if (!empresa) {
            return reply.status(400).send({ success: false, message: 'CNPJ not found in token' });
        }

        try {
            const result = await select.findByCnpj(empresa);
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Error fetching webhooks:', e);
            return reply.status(400).send({ success: false, message: 'Error fetching webhooks' });
        }
    });

    server.get('/webhooks/health',{
  
        schema: {
            tags: ['webhooks'],
            headers: z.object({
                token: z.string()
            }),
       
            response: {
                200: z.object({ ok: z.boolean()}),
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                }),
                404: z.object({ })
            }
        }
    }, async (request, reply) => {
             const select = new SelectWebhook();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');

        if (!empresa) {
            return reply.status(400).send({ success: false, message: 'CNPJ not found in token' });
        }

        try {
                const result = await select.findByCnpj(empresa);
                const resultHealt = await axios.get(`${result[0].url}/health`);
            return reply.status(200).send({ok:true })

        } catch (e) {
            if( isAxiosError(e) && e.status == 404 ) return reply.status(404).send()
            console.error('Error fetching webhooks:', e);
            return reply.status(400).send({ success: false, message: 'Error fetching webhooks' });
        }
    });
      

    server.get('/webhooks/:codigo', {
        schema: {
            tags: ['webhooks'],
            headers: z.object({
                token: z.string()
            }),
            params: z.object({
                codigo: z.coerce.number()
            }),
            response: {
                200: webhookResponseSchema,
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                }),
                404: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const select = new SelectWebhook();
        const { codigo } = request.params;

        try {
            const result = await select.findByCodigo(codigo);
            if (result.length === 0) {
                return reply.status(404).send({ success: false, message: 'Webhook not found' });
            }
            return reply.status(200).send(result[0]);
        } catch (e) {
            console.error('Error fetching webhook:', e);
            return reply.status(400).send({ success: false, message: 'Error fetching webhook' });
        }
    });

    server.post('/webhooks', {
        schema: {
            tags: ['webhooks'],
            headers: z.object({
                token: z.string()
            }),
            body: z.object({
                url: z.string().url(),
                eventos: z.string()
            }),
            response: {
                200: z.object({
                    success: z.boolean(),
                    message: z.string(),
                    data: webhookResponseSchema
                }),
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const insert = new InsertWebhook();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');

        if (!empresa) {
            return reply.status(400).send({ success: false, message: 'CNPJ not found in token' });
        }

        const { url, eventos } = request.body;
        const secret = crypto.randomBytes(32).toString('hex');

        try {
            const result = await insert.create({ cnpj: empresa, url, eventos, secret });
            const select = new SelectWebhook();
            const [created] = await select.findByCodigo(result.insertId);
            return reply.status(200).send({ success: true, message: 'Webhook created', data: created });
        } catch (e) {
            console.error('Error creating webhook:', e);
            return reply.status(400).send({ success: false, message: 'Error creating webhook' });
        }
    });

    server.put('/webhooks/:codigo', {
        schema: {
            tags: ['webhooks'],
            headers: z.object({
                token: z.string()
            }),
            params: z.object({
                codigo: z.coerce.number()
            }),
            body: z.object({
                url: z.string().url().optional(),
                eventos: z.string().optional(),
                ativo: z.enum(['S', 'N']).optional()
            }),
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
        const update = new UpdateWebhook();
        const { codigo } = request.params;
        const { url, eventos, ativo } = request.body;

        try {
            await update.update(codigo, { url, eventos, ativo });
            return reply.status(200).send({ success: true, message: 'Webhook updated' });
        } catch (e) {
            console.error('Error updating webhook:', e);
            return reply.status(400).send({ success: false, message: 'Error updating webhook' });
        }
    });

    server.delete('/webhooks/:codigo', {
        schema: {
            tags: ['webhooks'],
            headers: z.object({
                token: z.string()
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
                })
            }
        }
    }, async (request, reply) => {
        const del = new DeleteWebhook();
        const { codigo } = request.params;

        try {
            await del.deleteByCodigo(codigo);
            return reply.status(200).send({ success: true, message: 'Webhook deleted' });
        } catch (e) {
            console.error('Error deleting webhook:', e);
            return reply.status(400).send({ success: false, message: 'Error deleting webhook' });
        }
    });

};

export { webhookRoute };
export default webhookRoute;
