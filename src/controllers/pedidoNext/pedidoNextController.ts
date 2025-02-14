import { Request, Response } from "express";
import { SelectPedido } from "../../models/pedido/selectPedido";
import { Select_clientes } from "../../models/cliente/select";
import { SelectItensPedido } from "../../models/pedido/selectItens";

export class pedidoNextController{


    async buscaPedidosSimplesPorData( req:Request, res:Response ){ 
        if(!req.query.data)  return res.status(200).json({erro:`é necessario informar uma data`});
        if(!req.query.vendedor)  return res.status(200).json({erro:`é necessario informar o vendedor`});
        if(!req.headers.cnpj) return  res.status(200).json({erro:"É necessario informar o codigo da empresa "})
    
        let headerCnpj:string = String(req.headers.cnpj);
        let empresa = headerCnpj.replace(/\D/g, '');
        empresa= `\`${empresa}\``;

      const select = new SelectPedido();
  
       let paramData = req.query.data
        let paramVendedor:number = Number(req.query.vendedor)

    let pedidos:any[] =[]
        try{ 
              let data:any = await select.buscaPordata(empresa, paramData, paramVendedor)
                pedidos = data
        
            }catch(e){ 
            console.log(e)
         }  

         return res.status(200).json(pedidos)
    }

    async buscaPedidosCompleto(req:Request, res:Response){

        let headerCnpj:string = String(req.headers.cnpj);
        let empresa = headerCnpj.replace(/\D/g, '');
        empresa= `\`${empresa}\``;

        const codigo:number = Number(req.query.codigo);2222

   let selectOrcamento = new SelectPedido();
    let select_clientes = new Select_clientes();
    const selectItensPedido = new SelectItensPedido();

    try{

        const dados_orcamentos:any  = await selectOrcamento.validaExistencia(  empresa, codigo );
         if( dados_orcamentos.length === 0 ) return res.status(200).json([]);
            const orcamentos_registrados = await Promise.all(dados_orcamentos.map( async (i:any) =>{
                let produtos: any = [];
                let servicos: any = [];
                let parcelas: any = [];
                let cliente:any;
 

                try{
                  const resultCliente = await select_clientes.buscaPorcodigo(empresa, i.cliente);
                  cliente = resultCliente.length > 0 ? resultCliente[0] : {};
                }catch(e){ console.log(`erro ao buscar os produtos do pedido ${i.codigo}`)}

                try{
                   produtos = await selectItensPedido.buscaProdutosDoOrcamento(empresa, i.codigo);
                }catch(e){ console.log(`erro ao buscar os produtos do pedido ${i.codigo}`)}
                
                try{
                   servicos = await selectItensPedido.buscaServicosDoOrcamento(empresa, i.codigo);
                }catch(e){ console.log(`erro ao buscar os servicos do pedido ${i.codigo}`)}
                
                try{
                  parcelas = await selectItensPedido.buscaParcelasDoOrcamento(empresa, i.codigo);
                }catch(e){ console.log(`erro ao buscar as parcelas do pedido ${i.codigo}`)}
            
                    return {
                        ...i,
                        produtos,
                        servicos,
                        parcelas,
                        cliente
                    }
                }))

         return res.status(200).json(orcamentos_registrados);

        } catch (error) {
             console.error("Erro ao buscar orcamentos:", error);
             return res.status(500).json({ error: "Erro interno ao buscar orcamentos." });
        }
     }

}