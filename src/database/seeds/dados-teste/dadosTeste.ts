import { Insert_Categorias } from "../../../models/categorias/insert";
import { Insert_clientes } from "../../../models/cliente/insert";
import { Cliente } from "../../../models/cliente/interface_cliente";
import { Insert_formaPagamento } from "../../../models/formas_pagamento/insert";
import { Insert_fotos } from "../../../models/fotos/insert";
import { Insert_Marcas } from "../../../models/marcas/insert";
import { InsertProdutos } from "../../../models/produtos/insert";
import { InsertServico } from "../../../models/servicos/insert";
import { Insert_tipos_os } from "../../../models/tipos_os/insert";
import { Insert_Veiculos } from "../../../models/veiculo/insert";
import { categoria } from "../../../types/categoriaProduto/type-categoria";
import { formaPagamentoBanco } from "../../../types/formas_pagamento/type-formas-pagamento";
import { marca } from "../../../types/marcaProduto/type-marca";
import { ProdutoBanco } from "../../../types/produto/type-produto";
import { service } from "../../../types/servico/type-servico";
import { tipo_os } from "../../../types/tipo_os/type-tipo-os";
import { VeiculoBanco } from "../../../types/veiculo/type-veiculo";

type product = Omit<ProdutoBanco,'fotos'>


const produtos:product[]
=
[

  { codigo:1 , id:0,ativo:'S', caracteristica:0 , class_fiscal:'0000.00.00', cst:'00', descricao:'Processador Intel Core I5-10400 Cache 12mb',                estoque:1, grupo:1,marca:1, preco:899, sku:'1555445',origem:0, tipo:0, unidade_medida:'und', num_fabricante:'1434124', num_original:'', data_cadastro:'2025-11-14',data_recadastro:'2025-11-14 16:12:45',observacoes1:'',observacoes2:'',observacoes3:'' },
  { codigo:2 , id:0,ativo:'S', caracteristica:0 , class_fiscal:'0000.00.00', cst:'00', descricao:'SSD, Kingston, SA400S37/960G',                              estoque:1, grupo:2,marca:3, preco:389, sku:'1555223',origem:0, tipo:0, unidade_medida:'und', num_fabricante:'7316573929277', num_original:'', data_cadastro:'2025-11-14',data_recadastro:'2025-11-14 16:12:45',observacoes1:'',observacoes2:'',observacoes3:'' },
  { codigo:3 , id:0,ativo:'S', caracteristica:0 , class_fiscal:'0000.00.00', cst:'00', descricao:'Memória HyperX Fury de 8GB DIMM DDR4 2400Mhz para desktop', estoque:1, grupo:3,marca:3, preco:159, sku:'1555445',origem:0, tipo:0, unidade_medida:'und', num_fabricante:'3982/3920', num_original:'', data_cadastro:'2025-11-14',data_recadastro:'2025-11-14 16:12:45',observacoes1:'',observacoes2:'',observacoes3:'' },
  { codigo:4 , id:0,ativo:'S', caracteristica:0 , class_fiscal:'0000.00.00', cst:'00', descricao:'Placa-mãe Msi Mpg Z790 Carbon, Intel, ATX, DDR5, RGB, Wi-Fi II, Preto - Mpg Z790 Carbon Wifi II', estoque:1, grupo:5,marca:5, preco: 3700, sku:'1555778',origem:0, tipo:0, unidade_medida:'und', num_fabricante:'6514654', num_original:'', data_cadastro:'2025-11-14',data_recadastro:'2025-11-14 16:12:45',observacoes1:'',observacoes2:'',observacoes3:'' },
  { codigo:5 , id:0,ativo:'S', caracteristica:0 , class_fiscal:'0000.00.00', cst:'00', descricao:'Processador AMD Ryzen 5 8500G, 3.5GHz (5.0GHz Turbo)',              estoque:1, grupo:1,marca:2, preco: 900, sku:'4213',origem:0, tipo:0, unidade_medida:'und', num_fabricante:'987654', num_original:'', data_cadastro:'2025-11-14',data_recadastro:'2025-11-14 16:12:45',observacoes1:'',observacoes2:'',observacoes3:'' },
  { codigo:6 , id:0,ativo:'S', caracteristica:0 , class_fiscal:'0000.00.00', cst:'00', descricao:'Placa de Video NVIDIA GeForce RTX 3090 24 GB GDDR6X 384 Bits Asus', estoque:1, grupo:7,marca:4, preco: 1500, sku:'659234',origem:0, tipo:0, unidade_medida:'und', num_fabricante:'9876543412', num_original:'', data_cadastro:'2025-11-14',data_recadastro:'2025-11-14 16:12:45',observacoes1:'',observacoes2:'',observacoes3:'' },
  { codigo:7 , id:0,ativo:'S', caracteristica:0 , class_fiscal:'0000.00.00', cst:'00', descricao:'Water Cooler Corsair 280mm iCUE H115i RGB Elite',                   estoque:1, grupo:6,marca:7, preco: 900, sku:'000234',origem:0, tipo:0, unidade_medida:'und', num_fabricante:'9876543412', num_original:'', data_cadastro:'2025-11-14',data_recadastro:'2025-11-14 16:12:45',observacoes1:'',observacoes2:'',observacoes3:'' },

]

const servicos:service[] =
[
  { codigo: 1, valor:150 ,aplicacao:'Montagem Computador', id:0, tipo_serv:1, data_cadastro:'2025-05-12', data_recadastro:'2025-05-12 12:23:12', ativo:'S'},
  { codigo: 2,valor:100 ,aplicacao:'Formatação', id:0, tipo_serv:1, data_cadastro:'2025-05-12', data_recadastro:'2025-05-12 12:23:12',ativo:'S'},
]
const tiposDeOs:tipo_os[] =[
  { codigo:0, ativo:'S', descricao:"Serviços", id:0, data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05' }
]
const veiculos :VeiculoBanco[]=[
  { codigo:1, placa:'ARI-7664', ano:'2012',ativo:'S',cliente:1, combustivel:'Gasolina',cor:'Preto', id:0, marca:'Fiat', modelo:'Strada Working Celeb.1.4 Fire Flex 8V CS', data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05'  },
  { codigo:2, placa:'AFB-9317', ano:'2016',ativo:'S',cliente:2, combustivel:'Gasolina',cor:'Preto', id:0, marca:'Fiat', modelo:'Toro Volcano 2.0 16V 4x4 TB Diesel Aut.' , data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05' },
]
const marcas:marca[]=[
  {codigo:1, ativo:'S',descricao :'Intel', id:0, data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05'},
  {codigo:2, ativo:'S',descricao :'Amd', id:0, data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05'},
  {codigo:3, ativo:'S',descricao :'Kingston', id:0, data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05'},
  {codigo:5, ativo:'S',descricao :'Msi', id:0, data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05'},
  {codigo:4, ativo:'S',descricao :'Asus', id:0, data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05'},
  {codigo:7, ativo:'S',descricao :'Corsair', id:0, data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05'},
]

const formasPagamento: formaPagamentoBanco[]=[
  { codigo:1, ativo:'S',recebimento:0,desc_maximo:0,id:0,descricao:'A VISTA ',intervalo:0, parcelas:1, data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05'},
  { codigo:2, ativo:'S',recebimento:0,desc_maximo:0,id:0,descricao:'30 DIAS',intervalo:30, parcelas:1, data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05'},
]

const categorias:categoria[]=[
  { codigo:1, ativo:'S',descricao:"Processadores", id:0, data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05' },
  { codigo:2, ativo:'S',descricao:"Hd/Ssd", id:0, data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05' },
  { codigo:3, ativo:'S',descricao:"Memoria", id:0, data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05' },
  { codigo:5, ativo:'S',descricao:"Placas Mãe", id:0, data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05' },
  { codigo:6, ativo:'S',descricao:"Cooler", id:0, data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05' },
  { codigo:7, ativo:'S',descricao:"Placas de video", id:0, data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05' },
]
const clientes:Cliente[]=
[
  {codigo:1, ativo:'S', bairro:'Jardim Sydney', celular:'(44) 99916-0504', cep:'02982-090',cidade:'São Paulo',cnpj:'83.227.465/0001-07',endereco:'Rua Carmem Cunha', estado:'SP',id:0, nome:'Cliente-Teste-0001',ie:'392.840.731.374', numero:'5',vendedor:0, data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05'},
  {codigo:2, ativo:'S', bairro:'Jardim Sydney', celular:'(44) 99915-0205', cep:'02982-090',cidade:'São Paulo',cnpj:'88.987.659/0001-24',endereco:'Rua Carmem Cunha', estado:'SP',id:0, nome:'Cliente-Teste-0002',ie:'322.540.751.574', numero:'6',vendedor:0, data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05'},
  {codigo:3, ativo:'S', bairro:'Jardim Sydney', celular:'(44) 99925-0401', cep:'02982-090',cidade:'São Paulo',cnpj:'88.987.619/0001-25',endereco:'Rua Carmem Cunha', estado:'SP',id:0, nome:'Cliente-Teste-0003',ie:'656.991.912.123', numero:'7',vendedor:0, data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05'},
]
 const fotosProdutos   =[
  {produto:1,sequencia:1, descricao:'intel i5',foto:'',link:'https://i.ibb.co/tpDk4DD5/i5.png' ,data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05' },
  {produto:2,sequencia:1, descricao:'Ssd',foto:'',link:'https://i.ibb.co/Brqvtvj/Screenshot-6.png' ,data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05' },
  {produto:2,sequencia:2, descricao:'Ssd',foto:'',link:'https://i.ibb.co/0ygGXYsR/Screenshot-3.png' ,data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05' },
  {produto:3,sequencia:1, descricao:'memoriaram',foto:'',link:'https://i.ibb.co/60yG7hQN/Screenshot-1.png' ,data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05' },
  {produto:4,sequencia:1, descricao:'https://i.ibb.co/7tvNczCd/Screenshot-2.png',foto:'',link:'https://i.ibb.co/7tvNczCd/Screenshot-2.png' ,data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05' },
  {produto:5,sequencia:1, descricao:'ryzen',foto:'',link:'https://i.ibb.co/L0Cxydc/Screenshot-3.png' ,data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05' },
  {produto:5,sequencia:2, descricao:'ryzen',foto:'',link:'https://i.ibb.co/KjVhB83/RYZEN-5-8400-F.png' ,data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05' },
  {produto:6,sequencia:1, descricao:'https://i.ibb.co/Nnt2b2v7/Screenshot-1.png',foto:'',link:'https://i.ibb.co/Nnt2b2v7/Screenshot-1.png' ,data_cadastro:'2025-05-12' , data_recadastro:'2025-05-12 12:26:05' },
  
]



export async function registerDados(dbName: string): Promise<{ sucess: boolean; message: string }> {

    const insertProd = new InsertProdutos();
    const insertServico = new InsertServico();
    const  insertVeiculo = new Insert_Veiculos();
    const insertCategorias = new Insert_Categorias();
    const insertfpgt = new Insert_formaPagamento();
    const insertMarca = new Insert_Marcas();
    const insertTipoOs = new Insert_tipos_os();
    const insertFotos = new Insert_fotos();
    const insertCliente = new Insert_clientes();

  try {
    for( const i of fotosProdutos ){
          let result =  await insertFotos.cadastrar(dbName, i);
        }

   for(const i of tiposDeOs){
          let result = await insertTipoOs.cadastrar(dbName, i)
        }

   for(const i of marcas){
          let result = await insertMarca.cadastrar(dbName, i)
        }

   for(const i of categorias){
          let result = await insertCategorias.cadastrar(dbName, i)
        }
   for(const i  of produtos){
          let result = await insertProd.insert(dbName, i  as ProdutoBanco )
        }
   for(const i  of servicos){
          let result = await insertServico.insert(dbName, i  )
        }
   for(const i  of veiculos){
          let result = await insertVeiculo.cadastrar(dbName, i  )
        }

   for(const i  of formasPagamento){
          let result = await insertfpgt.cadastrar(dbName, i  )
        }
   for(const i  of clientes){
          let result = await insertCliente.cadastrar(dbName, i  )
        }


      // Se todas as queries forem executadas com sucesso
      return { sucess: true, message: "Dados registrados com sucesso!" };

    } catch (error:any) {
      // Captura erros inesperados fora das queries individuais
      console.error("Erro inesperado:", error);
      return { sucess: false, message: `Ocorreu um erro inesperado: ${error.message}` };
    }
}