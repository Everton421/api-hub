import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { DecodedToken } from "../../services/decoded-token/decodedToken.ts";
import { SelectPerfil } from "../../models/perfil/select.ts";
import { InsertPerfil } from "../../models/perfil/insert.ts";
import { UpdatePerfil } from "../../models/perfil/update.ts";
import { SelectPermissao } from "../../models/permissao/select.ts";
import { DateService } from "../../utils/dateService.ts";
import { publishMessage } from "../../services/broker/publish-message.ts";

const perfilRoute: FastifyPluginAsyncZod = async (server) => {
    server.get("/bulk/perfis", {
        schema: {
            tags: ["perfis"],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                withPermissoes: z.enum(["S", "N"]).optional().default("N"),
                ativo: z.string().optional()
            }),
            response: {
                200: z.array(z.object({
                    codigo: z.number(),
                    id: z.string(),
                    nome: z.string(),
                    data_cadastro: z.string(),
                    data_recadastro: z.string(),
                    ativo: z.string(),
                    permissoes: z.array(z.object({
                        codigo: z.number(),
                        id: z.string(),
                        descricao: z.string()
                    })).optional()
                })),
                400: z.object({ success: z.boolean(), message: z.string() }),
                500: z.object({ success: z.boolean(), message: z.string() })
            }
        }
    }, async (request, reply) => {
        const decodedToken = DecodedToken(String(request.headers.token));
        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: "Token inválido" });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, "");
        const dbName = `\`${empresa}\``;
        const select = new SelectPerfil();

        try {
            const withPermissoes = request.query.withPermissoes === "S";
            const result = withPermissoes
                ? await select.findAllWithPermissoes(dbName)
                : await select.findAll(dbName);
            return reply.status(200).send(result);
        } catch (e) {
            console.error("Erro ao buscar perfis:", e);
            return reply.status(500).send({ success: false, message: "Erro ao buscar perfis" });
        }
    });

    server.get("/perfis/search", {
        schema: {
            tags: ["perfis"],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                codigo: z.coerce.number().optional(),
                id: z.string().optional(),
                nome: z.string().optional(),
                ativo: z.string().optional(),
                withPermissoes: z.enum(["S", "N"]).optional().default("N")
            }),
            response: {
                200: z.array(z.object({
                    codigo: z.number(),
                    id: z.string(),
                    nome: z.string(),
                    data_cadastro: z.string(),
                    data_recadastro: z.string(),
                    ativo: z.string(),
                    permissoes: z.array(z.object({
                        codigo: z.number(),
                        id: z.string(),
                        descricao: z.string()
                    })).optional()
                })),
                400: z.object({ success: z.boolean(), message: z.string() })
            }
        }
    }, async (request, reply) => {
        const decodedToken = DecodedToken(String(request.headers.token));
        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: "Token inválido" });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, "");
        const dbName = `\`${empresa}\``;
        const { withPermissoes, ...params } = request.query;
        const select = new SelectPerfil();

        try {
            const result = await select.findByParams(dbName, params);
            
            if (withPermissoes === "S" && result.length > 0) {
                const resultsWithPermissoes = await Promise.all(
                    result.map(p => select.findByCodeWithPermissoes(dbName, p.codigo))
                );
                return reply.status(200).send(resultsWithPermissoes.flat());
            }
            
            return reply.status(200).send(result);
        } catch (e) {
            console.error("Erro ao buscar perfis:", e);
            return reply.status(400).send({ success: false, message: "Erro ao buscar perfis" });
        }
    });

    server.post("/perfis", {
        schema: {
            tags: ["perfis"],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: z.object({
                id: z.string(),
                nome: z.string()
            }),
            response: {
                200: z.object({
                    success: z.boolean(),
                    message: z.string(),
                    data: z.object({
                        codigo: z.number(),
                        id: z.string(),
                        nome: z.string()
                    })
                }),
                400: z.object({ success: z.boolean(), message: z.string() })
            }
        }
    }, async (request, reply) => {
        const dateService = new DateService();
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: "Token inválido" });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, "");
        const dbName = `\`${empresa}\``;
        const source = request.headers.source as string || "api_internal";
        const { id, nome } = request.body;

        const data_cadastro = dateService.obterDataAtual();
        const data_recadastro = dateService.obterDataHoraAtual();

        const select = new SelectPerfil();
        const verify = await select.findByParams(dbName, { id });
        if (verify.length > 0) {
            return reply.status(400).send({ success: false, message: `Perfil ID ${id} já existe.` });
        }

        try {
            const insert = new InsertPerfil();
            const result = await insert.insert(dbName, { id, nome, data_cadastro, data_recadastro, ativo: "S" });

            const item = { codigo: result.insertId, id, nome, ativo: "S", data_cadastro, data_recadastro };
            await publishMessage(empresa, "perfil.inserido", item, source);

            return reply.status(200).send({
                success: true,
                message: "Perfil criado com sucesso",
                data: item
            });
        } catch (e) {
            console.error("Erro ao criar perfil:", e);
            return reply.status(400).send({ success: false, message: "Erro ao criar perfil" });
        }
    });

    server.put("/perfis", {
        schema: {
            tags: ["perfis"],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: z.object({
                codigo: z.number(),
                id: z.string(),
                nome: z.string()
            }),
            response: {
                200: z.object({
                    success: z.boolean(),
                    message: z.string(),
                    data: z.object({
                        codigo: z.number(),
                        id: z.string(),
                        nome: z.string()
                    })
                }),
                400: z.object({ success: z.boolean(), message: z.string() })
            }
        }
    }, async (request, reply) => {
        const dateService = new DateService();
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: "Token inválido" });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, "");
        const dbName = `\`${empresa}\``;
        const source = request.headers.source as string || "api_internal";
        const { codigo, id, nome } = request.body;

        if (!codigo) {
            return reply.status(400).send({ success: false, message: "Código é obrigatório" });
        }

        const select = new SelectPerfil();
        const existing = await select.findByCode(dbName, codigo);
        if (existing.length === 0) {
            return reply.status(400).send({ success: false, message: "Perfil não encontrado" });
        }

        const data_cadastro = existing[0].data_cadastro;
        const data_recadastro = dateService.obterDataHoraAtual();

        try {
            const update = new UpdatePerfil();
            const result = await update.update(dbName, { codigo, id, nome, data_cadastro, data_recadastro, ativo: existing[0].ativo });

            if (result.affectedRows > 0) {
                const item = { codigo, id, nome, ativo: existing[0].ativo, data_cadastro, data_recadastro };
                await publishMessage(empresa, "perfil.atualizado", item, source);
                return reply.status(200).send({ success: true, message: "Perfil atualizado", data: item });
            }

            return reply.status(400).send({ success: false, message: "Nenhuma alteração realizada" });
        } catch (e) {
            console.error("Erro ao atualizar perfil:", e);
            return reply.status(400).send({ success: false, message: "Erro ao atualizar perfil" });
        }
    });

    server.delete("/perfis", {
        schema: {
            tags: ["perfis"],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            querystring: z.object({
                codigo: z.coerce.number()
            }),
            response: {
                200: z.object({ success: z.boolean(), message: z.string() }),
                400: z.object({ success: z.boolean(), message: z.string() })
            }
        }
    }, async (request, reply) => {
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: "Token inválido" });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, "");
        const dbName = `\`${empresa}\``;
        const source = request.headers.source as string || "api_internal";
        const { codigo } = request.query;

        if (!codigo) {
            return reply.status(400).send({ success: false, message: "Código é obrigatório" });
        }

        const select = new SelectPerfil();
        const existing = await select.findByCode(dbName, codigo);
        if (existing.length === 0) {
            return reply.status(400).send({ success: false, message: "Perfil não encontrado" });
        }

        try {
            const update = new UpdatePerfil();
            await update.delete(dbName, codigo);
            await publishMessage(empresa, "perfil.deletado", { codigo }, source);
            return reply.status(200).send({ success: true, message: "Perfil deletado" });
        } catch (e) {
            console.error("Erro ao deletar perfil:", e);
            return reply.status(400).send({ success: false, message: "Erro ao deletar perfil" });
        }
    });

    server.get("/permissoes", {
        schema: {
            tags: ["permissoes"],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                ativo: z.string().optional()
            }),
            response: {
                200: z.array(z.object({
                    codigo: z.number(),
                    id: z.string(),
                    descricao: z.string(),
                    data_cadastro: z.string(),
                    data_recadastro: z.string(),
                    ativo: z.string()
                })),
                400: z.object({ success: z.boolean(), message: z.string() }),
                500: z.object({ success: z.boolean(), message: z.string() })
            }
        }
    }, async (request, reply) => {
        const decodedToken = DecodedToken(String(request.headers.token));
        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: "Token inválido" });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, "");
        const dbName = `\`${empresa}\``;
        const select = new SelectPermissao();

        try {
            const params: { ativo?: string } = {};
            if (request.query.ativo) params.ativo = request.query.ativo;
            
            const result = await select.findByParams(dbName, params);
            return reply.status(200).send(result);
        } catch (e) {
            console.error("Erro ao buscar permissões:", e);
            return reply.status(500).send({ success: false, message: "Erro ao buscar permissões" });
        }
    });

    server.get("/perfis/:codigo/permissoes", {
        schema: {
            tags: ["perfis"],
            headers: z.object({
                token: z.string()
            }),
            params: z.object({
                codigo: z.coerce.number()
            }),
            response: {
                200: z.object({
                    perfil: z.object({
                        codigo: z.number(),
                        id: z.string(),
                        nome: z.string()
                    }),
                    permissoes: z.array(z.object({
                        codigo: z.number(),
                        id: z.string(),
                        descricao: z.string()
                    }))
                }),
                400: z.object({ success: z.boolean(), message: z.string() })
            }
        }
    }, async (request, reply) => {
        const decodedToken = DecodedToken(String(request.headers.token));
        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: "Token inválido" });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, "");
        const dbName = `\`${empresa}\``;
        const { codigo } = request.params;

        const selectPerfil = new SelectPerfil();
        const selectPermissao = new SelectPermissao();

        try {
            const perfil = await selectPerfil.findByCode(dbName, codigo);
            if (perfil.length === 0) {
                return reply.status(400).send({ success: false, message: "Perfil não encontrado" });
            }

            const permissoes = await selectPermissao.findByPerfil(dbName, codigo);

            return reply.status(200).send({
                perfil: {
                    codigo: perfil[0].codigo,
                    id: perfil[0].id,
                    nome: perfil[0].nome
                },
                permissoes
            });
        } catch (e) {
            console.error("Erro ao buscar permissões do perfil:", e);
            return reply.status(400).send({ success: false, message: "Erro ao buscar permissões" });
        }
    });

    server.post("/perfis/:codigo/permissoes", {
        schema: {
            tags: ["perfis"],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            params: z.object({
                codigo: z.coerce.number()
            }),
            body: z.object({
                permissoes: z.array(z.number())
            }),
            response: {
                200: z.object({ success: z.boolean(), message: z.string() }),
                400: z.object({ success: z.boolean(), message: z.string() })
            }
        }
    }, async (request, reply) => {
        const decodedToken = DecodedToken(String(request.headers.token));
        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: "Token inválido" });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, "");
        const dbName = `\`${empresa}\``;
        const source = request.headers.source as string || "api_internal";
        const { codigo } = request.params;
        const { permissoes } = request.body;

        if (!permissoes || !Array.isArray(permissoes)) {
            return reply.status(400).send({ success: false, message: "Lista de permissões inválida" });
        }

        const selectPerfil = new SelectPerfil();
        const selectPermissao = new SelectPermissao();
        const update = new UpdatePerfil();

        try {
            const perfil = await selectPerfil.findByCode(dbName, codigo);
            if (perfil.length === 0) {
                return reply.status(400).send({ success: false, message: "Perfil não encontrado" });
            }

            for (const codigoPermissao of permissoes) {
                const exists = await selectPermissao.exists(dbName, codigoPermissao);
                if (!exists) {
                    return reply.status(400).send({ success: false, message: `Permissão ${codigoPermissao} não encontrada` });
                }
            }

            await update.deletePermissoes(dbName, codigo);
            const insert = new InsertPerfil();
            await insert.insertPermissoes(dbName, codigo, permissoes);

            const updatedPermissoes = await selectPermissao.findByPerfil(dbName, codigo);
            await publishMessage(empresa, "perfil.permissoes.atualizadas", { codigo, permissoes: updatedPermissoes }, source);

            return reply.status(200).send({ success: true, message: "Permissões atualizadas com sucesso" });
        } catch (e) {
            console.error("Erro ao atualizar permissões do perfil:", e);
            return reply.status(400).send({ success: false, message: "Erro ao atualizar permissões" });
        }
    });
};

export { perfilRoute };
export default perfilRoute;
