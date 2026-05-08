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
import { type PhotoType } from '../../models/photo/types/photo-type.ts';

type productTypeAndPhotos  = ProductType & { fotos: PhotoType[] }
const productResponseSchema = z.object({
    codigo: z.number(),
    id: z.coerce.string(),
    estoque: z.coerce.number(),
    preco: z.coerce.string(),
    unidade_medida: z.string(),
    grupo: z.number(),
    origem: z.string(),
    descricao: z.string(),
    num_fabricante: z.string(),
    num_original: z.string(),
    sku: z.string(),
    marca: z.number(),
    ativo: z.enum(["S" ,"N"]).describe('S = ativo, N = inativo'),
    class_fiscal: z.string(),
    cst: z.string(),
    caracteristica: z.coerce.number().default(0),
    data_cadastro: z.string(),
    data_recadastro: z.string(),
    observacoes1: z.string(),
    observacoes2: z.string(),
    observacoes3: z.string(),
    tipo: z.number(),
    fotos: z.array(
            z.object({
                produto: z.number(),
                sequencia: z.number(),
                descricao: z.string(),
                link: z.string(),
                foto: z.string(),
                data_cadastro: z.string(),
                data_recadastro: z.string()
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
                 for( const p of resultProductsSeachByParams as any[] ) { 
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

                if(result.length > 0 ){
                    const fotos = await selectPhoto.findByProduct(dbName, result[0]?.codigo);
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
                observacoes1: z.string().default(''),
                observacoes2: z.string().default(''),
                observacoes3: z.string().default(''),
                tipo: z.number().default(0),

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
        const { id } = request.body
        const insert = new InsertProduct();
        const select = new SelectProduct();
        const verify = await select.findByParams( dbName, { id: id})
        if(verify.length > 0 ) return reply.status(400).send({ success: false, message: `Product ID: ${id} already exists.`})
        try {
            const { origem, ...rest } = request.body;
            const productData: ProductType = {
                ...rest,
                origem: String(origem),
                data_cadastro,
                data_recadastro,
                codigo: 0
            };

            const result = await insert.insert(dbName, productData);
            const item = { ...productData, codigo: result.insertId , fotos:[]};

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
                observacoes1: z.string().default(''),
                observacoes2: z.string().default(''),
                observacoes3: z.string().default('')
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
            const { origem, ...rest } = request.body;
            const productData: ProductType = {
                ...rest,
                origem: String(origem),
                data_cadastro,
                data_recadastro
            };

            const result = await update.update(dbName, productData);

            if (result.affectedRows > 0) {
                const item = { ...productData, fotos:[] };
                await publishMessage(empresa, 'produto.atualizado', item, source);
                return reply.status(200).send(item);
            }

            return reply.status(400).send({ success: false, message: 'No rows affected' });
        } catch (e) {
            console.error('Error updating product:', e);
            return reply.status(400).send({ success: false, message: 'Error updating product' });
        }
    });
};

export { productsRoute };
export default productsRoute;
