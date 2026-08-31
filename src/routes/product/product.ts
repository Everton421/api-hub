import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { DecodedToken } from '../../services/decoded-token/decodedToken.ts';
import { SelectProduct } from '../../models/product/select.ts';
import { InsertProduct } from '../../models/product/insert.ts';
import { UpdateProduct } from '../../models/product/update.ts';
import { DateService } from '../../utils/dateService.ts';
import { publishMessage } from '../../services/broker/publish-message.ts';
import { type ProductType } from '../../models/product/types/product-type.ts';
import { SelectPhoto } from '../../models/photo/select.ts';
import { InsertPhoto } from '../../models/photo/insert.ts';
import { UpdatePhoto } from '../../models/photo/update.ts';
import { type PhotoType } from '../../models/photo/types/photo-type.ts';
import { InsertProductSector } from '../../models/product-sector/insert.ts';
import { UpdateProductSector } from '../../models/product-sector/update.ts';
import { SelectProductSector } from '../../models/product-sector/select.ts';
import { UpdateMlAnnouncementService } from '../../modules/marketplaces/mercadolivre/announcement/update-announcement/update-ml-announcement-service.ts';
import { UpdateMlAnnouncement } from '../../modules/marketplaces/mercadolivre/announcement/update-announcement/update-ml-announcement.ts';
import { MlAnnouncementMapping } from '../../modules/marketplaces/mercadolivre/announcement/mapping/ml-announcement-mapping.ts';
import { MlAuthServices } from '../../modules/marketplaces/mercadolivre/services/auth/ml-auth-services.ts';
import { SelectMLAccountClient } from '../../models/ml-accounts/select-ml-accounts.ts';
import { UpdateMLAccountClient } from '../../models/ml-accounts/update-ml-accounts.ts';

const ML_API_URL = process.env.ML_API_URL || 'https://api.mercadolibre.com';
const mlAuthServices = new MlAuthServices(new SelectMLAccountClient(), new UpdateMLAccountClient(), ML_API_URL);

type productTypeAndPhotos  = ProductType & { fotos: PhotoType[]; codigo: number }

const photoInputSchema = z.object({
    sequencia: z.number(),
    descricao: z.string().default(''),
    link: z.string().default(''),
    foto: z.string()
});
const productResponseSchema = z.object({
    codigo: z.number(),
    id: z.coerce.string(),
    estoque: z.coerce.number(),
    preco: z.coerce.string(),
    unidade_medida: z.string(),
    grupo: z.number(),
    origem: z.string().nullable(),
    descricao: z.string(),
    num_fabricante: z.string().nullable(),
    num_original: z.string().nullable(),
    sku: z.string().nullable(),
    marca: z.number(),
    ativo: z.enum(["S" ,"N"]).describe('S = ativo, N = inativo'),
    class_fiscal: z.string(),
    cst: z.string().nullable(),
    caracteristica: z.coerce.number().nullable(),
    data_cadastro: z.string(),
    data_recadastro: z.string(),
    observacoes1: z.string().nullable(),
    observacoes2: z.string().nullable(),
    observacoes3: z.string().nullable(),
    tipo: z.number(),
    controle_lote_serie: z.enum(['S', 'N']).default('N'),
    fotos: z.array(
            z.object({
                produto: z.coerce.number(),
                sequencia: z.coerce.number(),
                descricao: z.coerce.string(),
                link: z.coerce.string(),
                foto: z.coerce.string(),
                data_cadastro: z.coerce.string(),
                data_recadastro: z.coerce.string()
            })
    )

});

 

const productsRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/bulk/produtos', {
        schema: {
            tags: ['produtos'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                data_recadastro: z.string().optional(),
                limit: z.coerce.number().optional()
            }),
            response: {
                 200: z.array(productResponseSchema),
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
        const select = new SelectProduct();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const { data_recadastro, limit } = request.query;
        const selectPhoto = new SelectPhoto();
        let arrResult =[]
        try {
            let result = await select.findAll(dbName, data_recadastro, limit );
                    const productResponse:productTypeAndPhotos[] =[]
                      
                    for( let i of result as any ){
                        let fotos:PhotoType[] =[];


                         const resultFotos = await selectPhoto.findByProduct(dbName, i.codigo);
                        fotos = resultFotos  
                        i = {  ...i, fotos } as productTypeAndPhotos;

                        productResponse.push(i)
                    }
            return reply.status(200).send(productResponse);
        } catch (e) {
            console.error('Error fetching products:', e);
            return reply.status(500).send({ success: false, message: 'Error fetching products' });
        }
    });

    server.get('/produtos/search', {
        schema: {
            tags: ['produtos'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                codigo: z.coerce.number().optional(),
                descricao: z.string().optional(),
                marca: z.coerce.number().optional(),
                grupo: z.coerce.number().optional(),
                ativo: z.string().optional(),
                id: z.string().optional(),
                num_fabricante: z.string().optional(),
                num_original: z.string().optional(),
                sku: z.string().optional(),
                limit: z.coerce.number().optional(),
                search: z.coerce.string().optional().describe("Pesquisa nos campos codigo, descricao e id do produto. "),
                orderBy: z.enum(['codigo' , 'descricao', 'id']).default('codigo')
            }),
             response: {
                 200: z.array(productResponseSchema),
                 400: z.object({
                     success: z.boolean(),
                     message: z.string()
                 })
             }
        }
    }, async (request, reply) => {
        const select = new SelectProduct();
        const selectPhoto = new SelectPhoto();

        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;

        try {
                let productsResponseRequest:any[] =[]
                    const { orderBy,  ativo, codigo, descricao, grupo, id, limit, marca, search} =request.query;
            let resultProductsSeachByParams = await select.findByParams(dbName, request.query) as productTypeAndPhotos[];
            if(resultProductsSeachByParams.length > 0 ){

                 for( let p of resultProductsSeachByParams as any[] ) { 
                    const fotos = await selectPhoto.findByProduct(dbName, p.codigo);
                    p.fotos = fotos
                    productsResponseRequest.push(p);
                 }
            }
            return reply.status(200).send(productsResponseRequest);
        } catch (e) {
            console.error('Error searching products:', e);
            return reply.status(400).send({ success: false, message: 'Error searching products' });
        }
    });

    server.get('/produtos/last-codigo', {
        schema: {
            tags: ['produtos'],
            headers: z.object({
                token: z.string()
            }),
            response: {
                200: z.object({
                    codigo: z.number()
                }),
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
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: 'Company identifier not provided' });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;

        try {
            const select = new SelectProduct();
            const result = await select.findLastInsertedCode(dbName);
            return reply.status(200).send({ codigo: result.codigo ?? 0 });
        } catch (e) {
            console.error('Error fetching last product code:', e);
            return reply.status(500).send({ success: false, message: 'Error fetching last product code' });
        }
    });

    server.get('/produtos/:codigo', {
        schema: {
            tags: ['produtos'],
            headers: z.object({
                token: z.string()
            }),
            params: z.object({
                codigo: z.coerce.number()
            }),
            response: {
                200: productResponseSchema,
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
        const select = new SelectProduct();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const { codigo } = request.params;
        const selectPhoto = new SelectPhoto();

        try {
            const result = await select.findByCode(dbName, codigo);
            if (result.length === 0) {
                return reply.status(404).send({ success: false, message: 'Product not found' });
            }

            let product = result[0] as any;

                if(result && result.length > 0 ){
                    
                    const fotos = await selectPhoto.findByProduct(dbName, result[0].codigo!);
                    product.fotos = fotos
            }

            return reply.status(200).send(product);
        } catch (e) {
            console.error('Error fetching product:', e);
            return reply.status(400).send({ success: false, message: 'Error fetching product' });
        }
    });

    server.post('/produtos', {
        schema: {
            tags: ['produtos'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: z.object({
                codigo: z.number().optional(),
                id: z.coerce.string(),
                estoque: z.coerce.number().default(0),
                preco: z.coerce.string().default('0'),
                unidade_medida: z.string().default('und'),
                grupo: z.number(),
                origem: z.union([z.string(), z.number()]).default('0'),
                descricao: z.string(),
                num_fabricante: z.string().default(''),
                num_original: z.string().default(''),
                sku: z.string().default(''),
                marca: z.number(),
                ativo: z.enum(['S', 'N']).default('S'),
                class_fiscal: z.string().default(''),
                cst: z.string().default(''),
                caracteristica: z.number().default(0),
                controle_lote_serie: z.enum(['S', 'N']).default('N'),
                observacoes1: z.string().default(''),
                observacoes2: z.string().default(''),
                observacoes3: z.string().default(''),
                tipo: z.number().default(0),
                fotos: z.array(photoInputSchema).optional().default([])

            }),
            response: {
                201: productResponseSchema,
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

        const data_cadastro = dateService.obterDataAtual();
        const data_recadastro = dateService.obterDataHoraAtual();
        const { id, codigo } = request.body
        const insert = new InsertProduct();
        const select = new SelectProduct();
        
        if( codigo != undefined || id != undefined){
      
            const verifyExistsProduct = await select.searchProductByUniqueParams( dbName, { id: id, code: codigo});
            if(verifyExistsProduct.length > 0 ){
                const  codigoVerifiedProduct  = verifyExistsProduct[0].codigo;
                const  idVerifiedProduct  = verifyExistsProduct[0].id;
                if(codigo == codigoVerifiedProduct) return reply.status(400).send({ success: false, message: `Product Code: ${codigo} already exists.`})
                if(id == idVerifiedProduct) return reply.status(400).send({ success: false, message: `Product ID: ${id} already exists.`})
            }
      
        }

        try {
            const { origem, fotos, ...rest } = request.body;
            const productData: ProductType = {
                ...rest,
                origem: String(origem),
                data_cadastro,
                data_recadastro
            };

            const result = await insert.insert(dbName, productData);
            const insertPhoto = new InsertPhoto();
            const fotosPost: PhotoType[] = [];

            for (const foto of fotos) {
                const photoData: Omit<PhotoType, 'codigo'> = {
                    produto: result.insertId,
                    sequencia: foto.sequencia,
                    descricao: foto.descricao,
                    link: foto.link,
                    foto: foto.foto,
                    data_cadastro,
                    data_recadastro
                };
                const photoResult = await insertPhoto.insert(dbName, photoData);
                fotosPost.push({ ...photoData, codigo: photoResult.insertId });
            }

            const item = { ...productData, codigo: result.insertId , fotos: fotosPost};

            await publishMessage(empresa, 'produto.inserido', item, source);
            return reply.status(201).send(item);
        } catch (e) {
            console.error('Error inserting product:', e);
            return reply.status(400).send({ success: false, message: 'Error inserting product' });
        }
    });

    server.put('/produtos', {
        schema: {
            tags: ['produtos'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: z.object({
                codigo: z.number(),
                id: z.string(),
                 estoque: z.coerce.number().default(0),
                preco: z.coerce.string().default('0'),
                unidade_medida: z.string(),
                grupo: z.number(),
                origem: z.union([z.string(), z.number()]).default('0'),
                descricao: z.string(),
                num_fabricante: z.string().default(''),
                num_original: z.string().default(''),
                sku: z.string().default(''),
                marca: z.number(),
                ativo: z.enum(['S', 'N']).default('S'),
                class_fiscal: z.string().default(''),
                cst: z.string().default(''),
                tipo: z.number().default(0),
                caracteristica: z.number().default(0),
                controle_lote_serie: z.enum(['S', 'N']).default('N'),
                observacoes1: z.string().default(''),
                observacoes2: z.string().default(''),
                observacoes3: z.string().default(''),
                fotos: z.array(photoInputSchema).optional().default([])
            }),
            response: {
                200: productResponseSchema,
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const dateService = new DateService();
        const select = new SelectProduct();
        const update = new UpdateProduct();
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: 'Company identifier not provided' });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const source = request.headers.source as string || 'api_internal';
        const { codigo } = request.body;

        if (!codigo) {
            return reply.status(400).send({ success: false, message: 'Code is required' });
        }

        const existing = await select.findByCode(dbName, codigo);
        if (existing.length === 0) {
            return reply.status(400).send({ success: false, message: 'Product not found' });
        }
        const data_cadastro = existing[0].data_cadastro;
        const data_recadastro = dateService.obterDataHoraAtual();

        try {
            const { origem, fotos, ...rest } = request.body;
            const productData: ProductType = {
                ...rest,
                origem: String(origem),
                data_cadastro,
                data_recadastro
            };

            const result = await update.update(dbName, productData);

            if (result.affectedRows > 0) {
                const updatePhoto = new UpdatePhoto();
                const insertPhoto = new InsertPhoto();

                await updatePhoto.deleteByProduct(dbName, codigo);

                const fotosPut: PhotoType[] = [];
                for (const foto of fotos) {
                    const photoData: Omit<PhotoType, 'codigo'> = {
                        produto: codigo,
                        sequencia: foto.sequencia,
                        descricao: foto.descricao,
                        link: foto.link,
                        foto: foto.foto,
                        data_cadastro,
                        data_recadastro
                    };
                    const photoResult = await insertPhoto.insert(dbName, photoData);
                    fotosPut.push({ ...photoData, codigo: photoResult.insertId });
                }

                const item = { ...productData, fotos: fotosPut };
                await publishMessage(empresa, 'produto.atualizado', item, source);
                return reply.status(200).send(item as any);
            }

            return reply.status(400).send({ success: false, message: 'No rows affected' });
        } catch (e) {
            console.error('Error updating product:', e);
            return reply.status(400).send({ success: false, message: 'Error updating product' });
        }
    });

    server.patch('/produtos', {
        schema: {
            tags: ['produtos'],
            description: "Atualiza o inventário do produto (preço e estoque dos setores) e sincroniza com o Mercado Livre.",
            headers: z.object({
                token: z.string()
            }),
            body: z.object({
                produto: z.coerce.number(),
                preco: z.coerce.number(),
                produto_setor: z.array(z.object({
                    setor: z.coerce.number(),
                    estoque: z.coerce.number()
                })).min(1)
            }),
            response: {
                200: z.object({
                    success: z.boolean(),
                    message: z.string(),
                    data: z.any()
                }),
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
        const select = new SelectProduct();
        const update = new UpdateProduct();
        const selectProductSector = new SelectProductSector();
        const updateProductSector = new UpdateProductSector();
        const insertProductSector = new InsertProductSector();
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: 'Company identifier not provided' });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const { produto, preco, produto_setor } = request.body;

        try {
            const existing = await select.findByCode(dbName, produto);
            if (existing.length === 0) {
                return reply.status(400).send({ success: false, message: 'Product not found' });
            }

            if (!produto_setor || produto_setor.length === 0) {
                return reply.status(400).send({ success: false, message: 'At least one setor is required' });
            }

            const data_recadastro = dateService.obterDataHoraAtual();

            await update.updatePrice(dbName, produto, preco, data_recadastro);

            for (const item of produto_setor) {
                const setorExistente = await selectProductSector.findByProductAndSector(dbName, produto, item.setor);
                if (setorExistente.length > 0) {
                    await updateProductSector.updateStock(dbName, {
                        produto,
                        setor: item.setor,
                        estoque: item.estoque,
                        data_recadastro
                    });
                } else {
                    await insertProductSector.insertOrUpdate(dbName, {
                        produto,
                        setor: item.setor,
                        estoque: item.estoque,
                        local_produto: '',
                        local1_produto: '',
                        local2_produto: '',
                        local3_produto: '',
                        local4_produto: '',
                        data_recadastro
                    });
                }
            }

            await new UpdateMlAnnouncementService(new UpdateMlAnnouncement(new MlAnnouncementMapping(), mlAuthServices)).syncProductByCode(empresa, produto);

            return reply.status(200).send({
                success: true,
                message: 'Inventário atualizado com sucesso',
                data: {
                    produto,
                    preco,
                    produto_setor
                }
            });
        } catch (e) {
            console.error('Error updating product inventory:', e);
            return reply.status(500).send({ success: false, message: 'Error updating product inventory' });
        }
    });
};

export { productsRoute };
export default productsRoute;
