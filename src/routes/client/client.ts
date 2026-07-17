import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { DecodedToken } from '../../services/decoded-token/decodedToken.ts';
import { SelectClient } from '../../models/client/select.ts';
import { InsertClient } from '../../models/client/insert.ts';
import { UpdateClient } from '../../models/client/update.ts';
import { DeleteClient } from '../../models/client/delete.ts';
import { DateService } from '../../utils/dateService.ts';
import { publishMessage } from '../../services/broker/publish-message.ts';

const clientResponseSchema = z.object({
    codigo: z.number(),
    id: z.string(),
    celular: z.string().nullable(),
    nome: z.string(),
    cep: z.string(),
    endereco: z.string().nullable(),
    ie: z.string().nullable(),
    numero: z.string(),
    cnpj: z.string(),
    cidade: z.string().nullable(),
    data_cadastro: z.string(),
    data_recadastro: z.string().nullable(),
    vendedor: z.number(),
    estado: z.string().nullable(),
    bairro: z.string().nullable(),
    ativo: z.string()
});

const getClientsRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/bulk/clientes', {
        schema: {
            tags: ['clientes'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                data_recadastro: z.string().optional(),
                limit: z.coerce.number().optional()
            }),
            response: {
                200: z.array(clientResponseSchema),
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
        const select = new SelectClient();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const { data_recadastro, limit } = request.query;

        try {
            const result = await select.findAll(dbName, undefined, data_recadastro);
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Error fetching clients:', e);
            return reply.status(500).send({ success: false, message: 'Error fetching clients' });
        }
    });

    server.get('/clientes/search', {
        schema: {
            tags: ['clientes'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                codigo: z.coerce.number().optional(),
                nome: z.string().optional(),
                cnpj: z.string().optional(),
                ativo: z.string().optional(),
                limit: z.coerce.number().optional(),
                id: z.coerce.string().optional(),
                search: z.coerce.string().optional().describe("Pesquisa nos campos codigo, nome, cnpj e id do cliente. "),
                orderBy: z.enum(['codigo' , 'nome', 'id']).default('codigo')
            }),
            response: {
                200: z.array(clientResponseSchema),
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const select = new SelectClient();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;

        try {
            const result = await select.findByParams(dbName, request.query);
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Error searching clients:', e);
            return reply.status(400).send({ success: false, message: 'Error searching clients' });
        }
    });

    server.get('/clientes/:codigo', {
        schema: {
            tags: ['clientes'],
            headers: z.object({
                token: z.string()
            }),
            params: z.object({
                codigo: z.coerce.number()
            }),
            response: {
                200: clientResponseSchema,
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const select = new SelectClient();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const { codigo } = request.params;

        try {
            const result = await select.findByCode(dbName, codigo);
            if (result.length === 0) {
                return reply.status(400).send({ success: false, message: 'Client not found' });
            }
            return reply.status(200).send(result[0]);
        } catch (e) {
            console.error('Error fetching client:', e);
            return reply.status(400).send({ success: false, message: 'Error fetching client' });
        }
    });

    server.post('/clientes', {
        schema: {
            tags: ['clientes'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: z.object({
                codigo: z.number().optional(),
                id: z.string(),
                celular: z.string(),
                nome: z.string(),
                cep: z.string(),
                endereco: z.string(),
                ie: z.string().optional(),
                numero: z.string(),
                cnpj: z.string(),
                cidade: z.string(),
                vendedor: z.number(),
                estado: z.string(),
                bairro: z.string(),
                ativo: z.enum(['S', 'N']).default('S')
            }),
            response: {
                201: clientResponseSchema,
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
        const { codigo, id, celular, nome, cep, endereco, ie, numero,   cidade, vendedor, estado, bairro, ativo } = request.body;
        let { cnpj } = request.body
        const data_cadastro = dateService.obterDataAtual();
        const data_recadastro = dateService.obterDataHoraAtual();

        let vCnpj = cnpj;
       

        function removerCaracteres(str: string) {
            return str.replace(/\D/g, '');
        }
        vCnpj = removerCaracteres(vCnpj)

        if (vCnpj.length < 11 || vCnpj.length > 14 || vCnpj.length === 12 || vCnpj.length === 13) {
            return reply.status(400).send({ success: true, message: "Invalid cnpj/cpf." });
        }

        if (vCnpj.length === 14) {
            cnpj = vCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5') as string;
        }
        if (vCnpj.length === 11) {
            cnpj = vCnpj.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4') as string;
        }

        const insert = new InsertClient();
        const select  = new SelectClient();

        if (codigo != undefined || id != undefined) {
            const verifyExistsClient = await select.searchClientByUniqueParams(dbName, { id, code: codigo });
            if (verifyExistsClient.length > 0) {
                const codigoVerifiedClient = verifyExistsClient[0].codigo;
                const idVerifiedClient = verifyExistsClient[0].id;
                if (codigo == codigoVerifiedClient) return reply.status(400).send({ success: false, message: `Cliente Code ${codigo} already exists.` });
                if (id == idVerifiedClient) return reply.status(400).send({ success: false, message: `Cliente ID ${id} already exists.` });
            }
        } 

        try {
            const result = await insert.insert(dbName, { 
                ...(codigo !== undefined ? { codigo } : {}),
                id, 
                celular, 
                nome, 
                cep, 
                endereco, 
                ie: ie || '', 
                numero, 
                cnpj, 
                cidade, 
                data_cadastro, 
                data_recadastro, 
                vendedor, 
                estado, 
                bairro, 
                ativo 
            });
            const item = { 
                codigo: result.insertId, 
                id, 
                celular, 
                nome, 
                cep, 
                endereco, 
                ie: ie || '', 
                numero, 
                cnpj, 
                cidade, 
                data_cadastro, 
                data_recadastro, 
                vendedor, 
                estado, 
                bairro, 
                ativo 
            };
            await publishMessage(empresa, 'cliente.inserido', item, source);
            return reply.status(201).send(item);
        } catch (e) {
            console.error('Error inserting client:', e);
            return reply.status(400).send({ success: false, message: 'Error inserting client' });
        }
    });

    server.delete('/clientes/:codigo', {
        schema: {
            tags: ['clientes'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            params: z.object({ codigo: z.coerce.number() }),
            response: {
                200: z.object({ success: z.boolean(), message: z.string() }),
                400: z.object({ success: z.boolean(), message: z.string() }),
                404: z.object({ success: z.boolean(), message: z.string() })
            }
        }
    }, async (request, reply) => {
        const decodedToken = DecodedToken(String(request.headers.token));
        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: 'Company identifier not provided' });
        }
        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const source = request.headers.source as string || 'api_internal';
        const { codigo } = request.params;

        try {
            const select = new SelectClient();
            const existing = await select.findByCode(dbName, codigo);
            if (existing.length === 0) {
                return reply.status(404).send({ success: false, message: 'Client not found' });
            }

            const deleteModel = new DeleteClient();
            await deleteModel.delete(dbName, codigo);
            await publishMessage(empresa, 'cliente.deletado', { codigo }, source);
            return reply.status(200).send({ success: true, message: 'Client deleted successfully' });
        } catch (e) {
            console.error('Error deleting client:', e);
            return reply.status(400).send({ success: false, message: 'Error deleting client' });
        }
    });

    server.put('/clientes', {
        schema: {
            tags: ['clientes'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: z.object({
                codigo: z.number(),
                id: z.string(),
                celular: z.string(),
                nome: z.string(),
                cep: z.string(),
                endereco: z.string(),
                ie: z.string().optional(),
                numero: z.string(),
                cnpj: z.string(),
                cidade: z.string(),
                vendedor: z.number(),
                estado: z.string(),
                bairro: z.string(),
                ativo: z.enum(['S', 'N']).default('S')
            }),
            response: {
                200: clientResponseSchema,
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const dateService = new DateService();
        const select = new SelectClient();
        const update = new UpdateClient();
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: 'Company identifier not provided' });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const source = request.headers.source as string || 'api_internal';
        const { codigo, id, celular, nome , cep, endereco, ie, numero,  cidade, vendedor, estado, bairro, ativo } = request.body;
        let {cnpj} = request.body; 
        if (!codigo) {
            return reply.status(400).send({ success: false, message: 'Code is required' });
        }

        const existing = await select.findByCode(dbName, codigo);
        if (existing.length === 0) {
            return reply.status(400).send({ success: false, message: 'Client not found' });
        }


          let vCnpj = cnpj;
       

        function removerCaracteres(str: string) {
            return str.replace(/\D/g, '');
        }
        vCnpj = removerCaracteres(vCnpj)

        if (vCnpj.length < 11 || vCnpj.length > 14 || vCnpj.length === 12 || vCnpj.length === 13) {
            return reply.status(400).send({ success: true, message: "Invalid cnpj/cpf." });
        }

        if (vCnpj.length === 14) {
            cnpj = vCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5') as string;
        }
        if (vCnpj.length === 11) {
            cnpj = vCnpj.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4') as string;
        }

        const data_cadastro = existing[0].data_cadastro;
        const data_recadastro = dateService.obterDataHoraAtual();

        try {
            const result = await update.update(dbName, { 
                codigo, 
                id, 
                celular, 
                nome, 
                cep, 
                endereco, 
                ie: ie || '', 
                numero, 
                cnpj, 
                cidade, 
                data_cadastro, 
                data_recadastro, 
                vendedor, 
                estado, 
                bairro, 
                ativo 
            });

            if (result.affectedRows > 0) {
                const item = { 
                    codigo, 
                    id, 
                    celular, 
                    nome, 
                    cep, 
                    endereco, 
                    ie: ie || '', 
                    numero, 
                    cnpj, 
                    cidade, 
                    data_cadastro, 
                    data_recadastro, 
                    vendedor, 
                    estado, 
                    bairro, 
                    ativo 
                };
                await publishMessage(empresa, 'cliente.atualizado', item, source);
                return reply.status(200).send(item);
            }

            return reply.status(400).send({ success: false, message: 'No rows affected' });
        } catch (e) {
            console.error('Error updating client:', e);
            return reply.status(400).send({ success: false, message: 'Error updating client' });
        }
    });
};

export { getClientsRoute };
export default getClientsRoute;
