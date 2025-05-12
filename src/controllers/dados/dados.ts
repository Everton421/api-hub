import { DateService } from "../../services/dateService"

 
const dateService = new DateService();

 export const dadosFic = ()=>{


 const produtos = [
    {
		"codigo": 1,
		"id": 1,
		"estoque": 1,
		"preco": 400,
		"grupo": 1,
		"origem": "2",
	    "descricao": "PROD-TESTE-0001",
		"num_fabricante": "1434124",
		"num_original": "324243",
		"sku": "1555445",
		"marca": 1,
		"ativo": "S",
		"class_fiscal": "00",
		"cst": "00",
		"data_recadastro": dateService.obterDataHoraAtual(),
		"data_cadastro": dateService.obterDataAtual(),
		"observacoes1": "",
		"observacoes2": "",
		"observacoes3": "",
		"tipo": 1
	},
	{
		"codigo": 2,
		"id": 2,
		"estoque": 0,
		"preco": 192.83,
		"grupo": 2,
		"origem": "0",
		"descricao": "PROD-TESTE-0002",
		"num_fabricante": "7316573929277",
		"num_original": "ALR399365L",
		"sku": "",
		"marca": 148,
		"ativo": "S",
		"class_fiscal": "24958",
		"cst": "00",
		"data_recadastro": dateService.obterDataHoraAtual(),
		"data_cadastro": dateService.obterDataAtual(),
		"observacoes1": "",
		"observacoes2": "",
		"observacoes3": "",
		"tipo": 8
	},
	{
		"codigo": 3,
		"id": 3,
		"estoque": 0,
		"preco": 86.37,
		"grupo": 2,
		"origem": "0",
		"descricao": "PROD-TESTE-0003",
		"num_fabricante": "3982/3920",
		"num_original": "802740",
		"sku": "7316574201396",
		"marca": 43,
		"ativo": "S",
		"class_fiscal": "24959",
		"cst": "00",
		"data_recadastro": dateService.obterDataHoraAtual(),
		"data_cadastro": dateService.obterDataAtual(),
		"observacoes1": null,
		"observacoes2": null,
		"observacoes3": null,
		"tipo": 0
	},
 ]
 const clientes = [
    {
		"codigo": 1,
		"id": "1",
		"celular": "(44) 99916-0504",
		"nome": "CLIENT-TESTE-0001",
		"cep": "02982-090",
		"endereco": "Rua Carmem Cunha",
		"ie": "392.840.731.374",
		"numero": "5",
		"cnpj": "83.227.465/0001-07",
		"ativo": "S",
		"cidade": "São Paulo",
		"data_recadastro": dateService.obterDataHoraAtual(),
		"data_cadastro": dateService.obterDataAtual(),
		"vendedor": 0,
		"bairro": "Jardim Sydney",
		"estado": "SP"
	},
	{
		"codigo": 2,
		"id": "0",
		"celular": "(22) 22222-2222",
	    "nome": "CLIENT-TESTE-0002",
		 "cep": "04472-030",
		"endereco": "Rua Mazinho",
		"ie": "656.991.912.536",
		"numero": "2",
		"cnpj": "88.987.659/0001-24",
		"ativo": "S",
		"cidade": "São Paulo",
		"data_recadastro": dateService.obterDataHoraAtual(),
		"data_cadastro": dateService.obterDataAtual(),
		"vendedor": 0,
		"bairro": "Jardim Novo Pantanal",
		"estado": "SP"
	},
 ]

 const servicos = [
    	{
		"codigo": 1,
		"id": 0,
		"valor": 3,
		"aplicacao": "SUBSTITUIR PIVO DA SUSPENSAO 11",
		"tipo_serv": 3,
			"data_recadastro": dateService.obterDataHoraAtual(),
		"data_cadastro": dateService.obterDataAtual(),
		"ativo": "S"
	},
	{
		"codigo": 2,
		"id": 0,
		"valor": 900,
		"aplicacao": "REVISAR DIFERENCIAL",
		"tipo_serv": 0,
		"data_recadastro": dateService.obterDataHoraAtual(),
		"data_cadastro": dateService.obterDataAtual(),
		"ativo": "S"
	},
 ]

 const categorias = [
    	{
		"codigo": 1,
		"id": 0,
		 "data_recadastro": dateService.obterDataHoraAtual(),
		"data_cadastro": dateService.obterDataAtual(),
		"descricao": "LUBRIFICANTE",
		"ativo": "S"
	},
	{
		"codigo": 1,
		"id": 0,
		 "data_recadastro": dateService.obterDataHoraAtual(),
		"data_cadastro": dateService.obterDataAtual(),
		"descricao": "MOTOR",
		"ativo": "S"
	},
 ]
 const marcas = [
    {
		"codigo": 1,
		"id": 2,
	  "data_recadastro": dateService.obterDataHoraAtual(),
		"data_cadastro": dateService.obterDataAtual(),
		"descricao": "TINKEN7",
		"ativo": "S"
	},
	{
		"codigo": 2,
		"id": 0,
		  "data_recadastro": dateService.obterDataHoraAtual(),
		"data_cadastro": dateService.obterDataAtual(),
		"descricao": "TINKEN9",
		"ativo": "S"
	},
 ]
 const veiculos = [
    {
		"codigo": 1,
		"id": 0,
		"cliente": 1,
		"placa": "ARI-7664",
		"marca": "Fiat",
		"modelo": "Strada Working Celeb.1.4 Fire Flex 8V CS",
		"ano": "2012",
		"cor": "Preto",
		"combustivel": "23",
		  "data_recadastro": dateService.obterDataHoraAtual(),
		"data_cadastro": dateService.obterDataAtual(),
		"ativo": "S"
	},
	{
		"codigo": 5,
		"id": 0,
		"cliente": 6,
		"placa": "AFB-9317",
		"marca": "Fiat",
		"modelo": "Toro Volcano 2.0 16V 4x4 TB Diesel Aut.",
		"ano": "2016",
		"cor": "Prata",
		"combustivel": "2",
		  "data_recadastro": dateService.obterDataHoraAtual(),
		"data_cadastro": dateService.obterDataAtual(),
		"ativo": "S"
	},
 ]
 const formasDePagamento = [
    	{
		"codigo": 1,
		"id": 1,
		"descricao": "A VISTA",
		"desc_maximo": 100,
		"parcelas": 1,
		"intervalo": 30,
		"recebimento": 0,
		  "data_recadastro": dateService.obterDataHoraAtual(),
		"data_cadastro": dateService.obterDataAtual(),
		"ativo": "S"
	},
	{
		"codigo": 2,
		"id": 2,
		"descricao": "30 DIAS",
		"desc_maximo": 100,
		"parcelas": 1,
		"intervalo": 0,
		"recebimento": 0,
		  "data_recadastro": dateService.obterDataHoraAtual(),
		"data_cadastro": dateService.obterDataAtual(),
		"ativo": "S"
	},
 ]
 const tiposOs = [
    {
		"codigo": 1,
		"id": 1,
		"descricao": "SERVICOS",
		  "data_recadastro": dateService.obterDataHoraAtual(),
		"data_cadastro": dateService.obterDataAtual(),
		"ativo": "S"
	},
 ]
 const fotos =[
	{
		"produto": 242618,
		"sequencia": 1,
		"descricao": "ft",
		"link": "https://i.ibb.co/H7grssp/RYZEN-5.png",
		"foto": "Wm5Rdw==",
        "data_recadastro": dateService.obterDataHoraAtual(),
		"data_cadastro": dateService.obterDataAtual(),
	},
	{
		"produto": 242618,
		"sequencia": 2,
		"descricao": "ft",
		"link": "https://i.ibb.co/Brqvtvj/Screenshot-6.png",
		"foto": "SUE9PQ==",
        "data_recadastro": dateService.obterDataHoraAtual(),
		"data_cadastro": dateService.obterDataAtual(),
	},
	{
		"produto": 242618,
		"sequencia": 3,
		"descricao": "ft",
		"link": "https://i.ibb.co/hFyNBk2/Screenshot-5.png",
		"foto": "SUE9PQ==",
        "data_recadastro": dateService.obterDataHoraAtual(),
		"data_cadastro": dateService.obterDataAtual(),
	}
    ]
 return { fotos,tiposOs, formasDePagamento, veiculos,marcas,categorias ,servicos,clientes,produtos}
 }
