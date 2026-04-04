import { randomUUID } from "crypto";
import { InsertProduct } from "../models/product/insert.ts";
import { faker } from '@faker-js/faker'
import { DateService } from "../utils/dateService.ts";
import { SelectCategory } from "../models/category/select.ts";
import { InsertCategory } from "../models/category/insert.ts";
import { SelectBrand } from "../models/brand/select.ts";
import { InsertBrand } from "../models/brand/insert.ts";
export class MakeProduct{

    async create(empresa:string ){
        const dateService = new DateService();
         
             const data_cadastro = dateService.obterDataAtual();
                const data_recadastro = dateService.obterDataHoraAtual();

        const price = faker.commerce.price();
         const name =   faker.commerce.product();
        const description =   faker.commerce.productName();
        const category =   faker.commerce.department()
        const specifications=   faker.commerce.productDescription();
         const brand = faker.commerce.productAdjective()

        const id = randomUUID();
            const selectCategory = new SelectCategory();
            const insertCategory = new InsertCategory();

                const selectBrand = new SelectBrand();
                const insertBrand = new InsertBrand();

        const arrVerifyBrand = await selectBrand.findByParams(empresa, { descricao: brand})
            let codeBrand =0;
                if(arrVerifyBrand.length === 0  ){
                     const result =   await insertBrand.insert(empresa,{ ativo: 'S', data_cadastro:data_cadastro, data_recadastro:data_recadastro, descricao: brand, id: randomUUID() }  )
                    codeBrand = result.insertId;
                  }

            const arrVerifyCategory = await selectCategory.findByParams(empresa, { descricao: category})
            let codeCategory =0;
                if(arrVerifyCategory.length === 0  ){
                     const result =   await insertCategory.create(empresa, { ativo: 'S', data_cadastro:data_cadastro, data_recadastro:data_recadastro, descricao: category, id: randomUUID() })
                    codeCategory = result.insertId;
                  }



                  const isbn = faker.commerce.isbn(10);
            const insertProduct = new InsertProduct();
            await insertProduct.insert(empresa, {
                id: String(id),
                estoque: 2,
                preco:   price ,
                unidade_medida:'UND',
                grupo: codeCategory,
                origem:'00',
                descricao: name,
                num_fabricante: isbn,
                num_original:  isbn,
                sku: isbn,
                marca: codeBrand,
                class_fiscal:'9999.99.99',
                data_cadastro:data_cadastro,
                data_recadastro: data_recadastro,
                tipo: 1,
                observacoes1:'',
                observacoes2:'',
                observacoes3:'',
                caracteristica:0,
                ativo:'S',
                cst: '00'
            })
    }
}

//  const url = faker.image.url({ height: 480, width: 640 })