import { conn } from "../../database/databaseConfig";

export class CreateOrcamento {


    converterData(data: string): string {
      const [dia, mes, ano] = data.split('/');
      return `${ano}-${mes}-${dia}`;
  }
    obterDataAtual() {
      const dataAtual = new Date();
      const dia = String(dataAtual.getDate()).padStart(2, '0');
      const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
      const ano = dataAtual.getFullYear();
      return `${ano}-${mes}-${dia}`;
  }


  async create ( empresa:any, orcamento:any) {
      return new Promise((resolve, reject)=>{

      const dataAtual = this.obterDataAtual();

      let codigo_pedido;
      let {
          codigo,
          forma_pagamento,
          descontos,
          observacoes,
          observacoes2,
          quantidade_parcelas,
          total_geral,
          total_produtos,
          total_servicos,
          totalSemDesconto,
          situacao,
          tipo,
          vendedor,
          data_cadastro,
          data_recadastro,
          veiculo,
          tipo_os,
          contato,
          just_ipi,
          just_icms,
          just_subst,
          enviado,
          id
      } = orcamento;

      enviado = 'S';

      const servicos = orcamento.servicos;
      const parcelas = orcamento.parcelas;
      const produtos = orcamento.produtos;
       const cliente = orcamento.cliente;

      if (!id)   id = 0;

      if (!situacao)   situacao = 'EA';
      if (!vendedor)   vendedor = 1;
      if (!tipo_os) tipo_os = 0;
      if (!tipo ) tipo  = 1;
      if (!veiculo)    veiculo = 0;
      if (!data_cadastro)   data_cadastro = dataAtual;
      if (!data_recadastro)   data_recadastro = dataAtual;
      if (!total_servicos) total_servicos = 0;
      if (!contato)  contato = '';
      if (!observacoes)  observacoes = '';
      if (!observacoes2)  observacoes2 = '';
      if (!just_ipi) just_ipi = '';
      if (!just_icms)  just_icms = '';
      if (!just_subst)   just_subst = '';
      if (!forma_pagamento)  forma_pagamento = 0
      if (!descontos)  descontos = 0
      if (!quantidade_parcelas)    quantidade_parcelas = 0;

       
      let sql = `INSERT INTO 
      ${empresa}.pedidos 
      ( codigo ,  id ,  vendedor , situacao, contato ,  descontos ,  forma_pagamento ,  quantidade_parcelas ,  total_geral ,  total_produtos ,  total_servicos ,  cliente ,  veiculo ,  data_cadastro ,  data_recadastro ,  tipo_os ,  enviado, tipo, observacoes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )  
        `
        conn.query(
          sql,
          [codigo ,  id ,  vendedor ,  situacao, contato,  descontos ,  forma_pagamento ,  quantidade_parcelas ,  total_geral ,  total_produtos ,  total_servicos ,  cliente.codigo,  veiculo ,  data_cadastro ,  data_recadastro ,  tipo_os ,  enviado, tipo, observacoes ],
          async    (err: any, result: any) => {
              if (err) {
                  console.log(err)
                   reject(err)
              } else {

                 
                  let status = null;

                     if (produtos.length > 0) {
                     try{
                         await this.cadastraProdutosDoPedido(produtos,empresa, codigo, );
                         status = true
                      }catch(e){ console.log(e)} 
                     }

            
                     if(parcelas.length > 0  ){
                          try{
                           await this.cadastraParcelasDoPeidido( parcelas, empresa, codigo );
                           status == true   
                        }catch(e) {
                              console.log(e)
                          }    
                     }
                     if(servicos.length > 0 ){
                          try{
                              await this.cadastraServicosDoPedido(servicos, codigo, empresa);
                              status == true   
                          
                            }catch(e){console.log(e)}
                     }
                     
                      

                      resolve({ codigo:codigo, status:status} ) ;
                  }
              }
          )

      })

  }

  async cadastraProdutosDoPedido(produtos:any ,empresa:any, codigoPedido:any ){
      return new Promise( async (resolve, reject )=>{

          let i=1;
          for(let p of produtos){
              let {
                  codigo,
                  preco,
                  quantidade,
                  desconto,
                  total,
              } = p

               if( !preco) preco = 0;
               if( !quantidade) quantidade = 0;
               if( !desconto) desconto = 0;
             
               if( !total) total = 0;
          
 
           

           const sql =  ` INSERT INTO ${empresa}.produtos_pedido ( pedido ,  codigo ,  desconto ,  quantidade ,  preco ,  total ) VALUES (? , ?, ?, ?, ?, ?) `;
              let dados = [ codigoPedido, codigo, desconto, quantidade, preco, total ]
            await conn.query( sql,dados ,(error:any, resultado:any)=>{
                 if(error){
                         reject(" erro ao inserir produto do orcamento "+ error);
                 }else{
                  resolve(resultado)
                     console.log(`produto  inserido com sucesso`);
                 }
              })

              if(i === produtos.length){
                  return;
              }
              i++;
          }
      })
  }
 

  async cadastraParcelasDoPeidido(parcelas:any,empresa:any, codigoPedido:any){
    let obj  = new CreateOrcamento();
    parcelas.forEach( async (p: any) => {
        
    let {
        pedido ,  parcela ,  valor ,vencimento  
    } = p     
        
        let sql = `  INSERT INTO ${empresa}.parcelas ( pedido ,  parcela ,  valor, vencimento ) VALUES ( ?  , ?,  ?, ?  )`;
        let dados = [ codigoPedido ,  parcela ,  valor ,vencimento ]


          await   conn.query( sql,  dados , (err: any, resultParcelas:any) => {
                  if (err) {
                      console.log("erro ao inserir parcelas !" + err)
                      //  return response.status(500).json({ err: "erro ao as parcelas" });
                  } else {
                      console.log('  Parcela inserida com sucesso '    )
                  }
              }
          )
      })

  }
 


    async cadastraServicosDoPedido( servicos:any, codigoPedido:any, empresa:any ){
        return new Promise( async (resolve, reject )=>{

     
          if (servicos.length > 0) {
            let i=1;
            for(let s of servicos){
                let {
                    codigo,
                    preco,
                    quantidade,
                    desconto,
                    total,
                    valor,
                } = s
  
                 if( !preco) preco = 0;
                 if( !quantidade) quantidade = 0;
                 if( !desconto) desconto = 0;
                 if( !total) total = 0;
   
              const sql =  ` INSERT INTO    ${empresa}.servicos_pedido  ( pedido ,  codigo ,  desconto ,  quantidade ,  valor ,  total ) VALUES ( ?, ?, ?, ?, ?, ?)   `;

                let dados = [ codigoPedido ,  codigo ,  desconto ,  quantidade ,  valor ,  total  ]
              await conn.query( sql,dados ,(error:any, resultado:any)=>{
                   if(error){
                           reject(" erro ao inserir servico do orcamento "+ error);
                   }else{
                    resolve(resultado)
                       console.log(`servico  inserido com sucesso`);
                   }
                })
  
                if(i === servicos.length){
                    return;
                }
                i++;
          
          } }
        })
}
 

}
