import { categoria } from "../categoriaProduto/type-categoria"
import { marca } from "../marcaProduto/type-marca"

export type ProdutoBanco =
 {
        codigo:number, 
        estoque:number,
        id:number
        preco:number,
        unidade_medida:string, 
        grupo:number,
        origem:number,
        descricao:string, 
        num_fabricante:string, 
        num_original:string, 
        sku:string, 
        marca: number, 
        ativo:string, 
        class_fiscal:string, 
        cst:string, 
        data_cadastro:string, 
        data_recadastro:string, 
        observacoes1:string,  
        observacoes2:string, 
        observacoes3:string,
        caracteristica:number,
        controle_lote_serie: 'S' | 'N',
        tipo:number 
          fotos: any     
}       
export type ProdutoCompleto =
 {
        codigo:number, 
        estoque:number,
        preco:number,
        unidade_medida:string 
        grupo: categoria | {},
        origem:number,
        descricao:string, 
        num_fabricante:string, 
        num_original:string, 
        sku:string, 
        marca: marca | {},
        fotos: IFoto[] | [], 
        ativo:string, 
        class_fiscal:string, 
        cst:string, 
        data_cadastro:string, 
        data_recadastro:string, 
        observacoes1:string,  
        observacoes2:string, 
        observacoes3:string,
        controle_lote_serie: 'S' | 'N', 
        tipo:number 
        
} 