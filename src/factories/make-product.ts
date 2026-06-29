import { randomUUID } from "crypto";
import { InsertProduct } from "../models/product/insert.ts";
import { faker } from '@faker-js/faker'
import { DateService } from "../utils/dateService.ts";
import { SelectCategory } from "../models/category/select.ts";
import { InsertCategory } from "../models/category/insert.ts";
import { SelectBrand } from "../models/brand/select.ts";
import { InsertBrand } from "../models/brand/insert.ts";
import axios from "axios";
import { InsertPhoto } from "../models/photo/insert.ts";

type resultFakeStoreApi = { 
    id: number,
    title: string,
    price:number,
    description: string,
    category: string,
    image:  string,
    rating: {
    rate: number,
    count: number
    }
}
export class MakeProduct {


    async create(empresa: string ) {
        const dateService = new DateService();

        const data_cadastro = dateService.obterDataAtual();
        const data_recadastro = dateService.obterDataHoraAtual();

        const price = faker.commerce.price();
        const name = faker.commerce.product();
        const category = faker.commerce.department()
        const brand = faker.commerce.productAdjective()

        const id = randomUUID();
        const selectCategory = new SelectCategory();
        const insertCategory = new InsertCategory();

        const selectBrand = new SelectBrand();
        const insertBrand = new InsertBrand();
        

        const arrVerifyBrand = await selectBrand.findByParams(empresa, { descricao: brand })
        let codeBrand = 0;
        if (arrVerifyBrand.length === 0) {
            const result = await insertBrand.insert(empresa, { ativo: 'S', data_cadastro: data_cadastro, data_recadastro: data_recadastro, descricao: brand, id: randomUUID() })
                
            if(!result.insertId || result.insertId === 0 ){
                return {success: false, message:"Erro ao tentar registar marca." }
            }
            codeBrand = result.insertId;
        
        }

        const arrVerifyCategory = await selectCategory.findByParams(empresa, { descricao: category })
        let codeCategory = 0;
        if (arrVerifyCategory.length === 0) {
            const result = await insertCategory.create(empresa, { ativo: 'S', data_cadastro: data_cadastro, data_recadastro: data_recadastro, descricao: category, id: randomUUID() })
            if(!result.insertId || result.insertId === 0 ){
                return {success: false, message:"Erro ao tentar registar categoria." }
            }
            codeCategory = result.insertId;
        }



        const isbn = faker.commerce.isbn(10);
        const insertProduct = new InsertProduct();
       const resultInsertProduct =  await insertProduct.insert(empresa, {
            id: String(id),
            estoque: 2,
            preco: price,
            unidade_medida: 'UND',
            grupo: codeCategory,
            origem: '00',
            descricao: name,
            num_fabricante: isbn,
            num_original: isbn,
            sku: isbn,
            marca: codeBrand,
            class_fiscal: '9999.99.99',
            data_cadastro: data_cadastro,
            data_recadastro: data_recadastro,
            tipo: 1,
            observacoes1: '',
            observacoes2: '',
            observacoes3: '',
            caracteristica: 0,
            ativo: 'S',
            cst: '00',
            controle_lote_serie: 'N'
        })
        if(!resultInsertProduct.insertId || resultInsertProduct.insertId === 0  ){
            return { success: false, message: "Erro ao tentar registrar produto."}
        }
        return { success: false, message: 'Produto registrado com sucesso.'}

    }
    async createByFakeStoreApi(empresa: string, quantity:number) {
        const dateService = new DateService();

        const data_cadastro = dateService.obterDataAtual();
        const data_recadastro = dateService.obterDataHoraAtual();

        const category = faker.commerce.department()
        const brand = faker.commerce.productAdjective()

        const id = randomUUID();
        const selectCategory = new SelectCategory();
        const insertCategory = new InsertCategory();

        const selectBrand = new SelectBrand();
        const insertBrand = new InsertBrand();
        const insertphoto = new InsertPhoto();

        const resultInsert =[]
        const arrVerifyBrand = await selectBrand.findByParams(empresa, { descricao: brand })
        let codeBrand = 0;
        if (arrVerifyBrand.length === 0) {
            const result = await insertBrand.insert(empresa, { ativo: 'S', data_cadastro: data_cadastro, data_recadastro: data_recadastro, descricao: brand, id: randomUUID() })
                
            if(!result.insertId || result.insertId === 0 ){
                return {success: false, message:"Erro ao tentar registar marca." }
            }
            codeBrand = result.insertId;
        
        }

 

        const resultFakeStore = await axios.get(`https://fakestoreapi.com/products`) ; 
        const result = resultFakeStore.data as resultFakeStoreApi[];

        for( let i = 0;  i <= quantity;  i++  ){
                    const arrVerifyCategory = await selectCategory.findByParams(empresa, { descricao:  result[i].category })
                            let codeCategory = 0;
                            if (arrVerifyCategory.length === 0) {
                                const result = await insertCategory.create(empresa, { ativo: 'S', data_cadastro: data_cadastro, data_recadastro: data_recadastro, descricao: category, id: randomUUID() })
                                if(!result.insertId || result.insertId === 0 ){
                                    return {success: false, message:"Erro ao tentar registar categoria." }
                                }
                                codeCategory = result.insertId;
                            }
                                const isbn = faker.commerce.isbn(10);
        const insertProduct = new InsertProduct();
       const resultInsertProduct =  await insertProduct.insert(empresa, {
            id: String(id),
            estoque: 2,
            preco: String(result[i].rating.count),
            unidade_medida: 'UND',
            grupo: codeCategory,
            origem: '00',
            descricao: result[i].title,
            num_fabricante: isbn,
            num_original: isbn,
            sku: isbn,
            marca: codeBrand,
            class_fiscal: '9999.99.99',
            data_cadastro: data_cadastro,
            data_recadastro: data_recadastro,
            tipo: 1,
            observacoes1: '',
            observacoes2: '',
            observacoes3: '',
            caracteristica: 0,
            ativo: 'S',
            cst: '00',
            controle_lote_serie: 'N'
        })

               if(!resultInsertProduct.insertId || resultInsertProduct.insertId === 0  ){
                return;
                }else{
                const resultInsertPhoto =  await insertphoto.insert(empresa,
                    { 
                        data_cadastro: dateService.obterDataAtual(),
                        data_recadastro:dateService.obterDataHoraAtual(),
                        produto: resultInsertProduct.insertId,
                         descricao:  '',
                          foto: result[i].image,
                           link: result[i].image,
                         sequencia:1
                    }
                )
                        resultInsert.push({codigo:resultInsertProduct.insertId})

                }

        }
 

     
        return resultInsert

    }
}

//  const url = faker.image.url({ height: 480, width: 640 })