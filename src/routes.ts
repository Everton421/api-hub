import { Router,Request,Response, NextFunction } from "express";
import { conn  } from "./database/databaseConfig";
import 'dotenv/config';
import { ProdutoController } from "./controllers/produtos/produtoController";
import { ClienteController } from "./controllers/cliente/clienteController";
import { CreateEmpresa } from "./controllers/empresa/empresaController";
import { Login } from "./controllers/login/login";
import { UsuariosController } from "./controllers/usuariosController/usuariosController";
import { pedidoController } from "./controllers/pedido/pedidoController";
import { ServicosController } from "./controllers/servicos/servicosController";
import { FormasController } from "./controllers/formas_pagamento/formasController";
import { TipoOsController } from "./controllers/tipos_os/tipoOsController";
import { VeiculoController } from "./controllers/veiculo/VeiculoController";
import { EnvioCodigoValidador } from "./controllers/recuperarConta/EnvioCodigoValidador";  
import { Alterar_senha } from "./controllers/recuperarConta/alterarSenha";
import { CategoriaController } from "./controllers/categorias/categoriaController";
import { MarcasController } from "./controllers/marcas/marcasController";
import { fotosController } from "./controllers/fotos/fotosController";
import { pedidoNextController } from "./controllers/pedidoNext/pedidoNextController";
import { AuthMiddleware    } from "./middleware/AuthMiddlewate/AuthMiddleware"; 
import { SelectPedido } from "./models/pedido/selectPedido";
import { ProdutoSetorController } from "./controllers/produtos-setor/produto-setor-controller";
import { SetorController } from "./controllers/setor/setor-controller";
import { MovimentosProdutosController } from "./controllers/movimentos-produtos/movimentos-produtos-controller";
import { LocaisController } from "./controllers/locais/locais-controller";
import { InsertDistribuicaoLocaisSetor } from "./models/distribuicao_locais_setor/insert";
import { DistribuicaoController } from "./controllers/distribuicao-locais/distribuicao-controller";

  const crypt = require('crypt');
  const router = Router();
  export const versao = '/v1'

    router.get(`${versao}/`, AuthMiddleware,async (req:Request, res:Response)=>{
   
       await conn.query("SELECT 1 ", (err ,result )=>{
         if(err){
               return res.json({"erro": "falha ao se conectar ao banco de dados  "})
           }else{
            console.log(result)
             return  res.json({"ok":true});
           }
       })
    })

    router.get(`${versao}/teste`,AuthMiddleware,(req,res)=>{ 
      return  res.json({"ok":true});
    })

 
 router.get(`${versao}/offline/produtos`,    AuthMiddleware,  new ProdutoController().findAll )//ok
 router.post(`${versao}/produto`,            AuthMiddleware, new ProdutoController().insert)//ok
 router.get(`${versao}/produtos`,           AuthMiddleware, new ProdutoController().findByParam)//ok
 router.get(`${versao}/produto/:codigo`,     AuthMiddleware, new ProdutoController().findByCode)//ok
 router.put(`${versao}/produto`,             AuthMiddleware, new ProdutoController().update)//ok


 router.get(`${versao}/offline/clientes`,    new ClienteController().findAll )//ok
 router.post(`${versao}/cliente`,            AuthMiddleware, new ClienteController().insert)//ok
 router.get(`${versao}/clientes`,            AuthMiddleware, new ClienteController().findByParam)//ok
 router.put(`${versao}/cliente`,             AuthMiddleware, new ClienteController().update)//ok


 router.get(`${versao}/categorias` ,         AuthMiddleware, new CategoriaController().findByParam)//ok
 router.get(`${versao}/offline/categorias`,    new CategoriaController().findAll )//ok
 router.post(`${versao}/categoria`,          AuthMiddleware, new CategoriaController().insert )//ok
 router.put(`${versao}/categoria` ,          AuthMiddleware, new CategoriaController().update)//ok

 router.post(`${versao}/marca`,              AuthMiddleware, new MarcasController().insert )//ok
 router.put(`${versao}/marca` ,              AuthMiddleware, new MarcasController().update)//ok
 router.get(`${versao}/offline/marcas`,       new MarcasController().findAll )
 router.get(`${versao}/marcas`,              AuthMiddleware, new MarcasController().findByParam )//ok

 router.get(`${versao}/servicos`,            AuthMiddleware,  new ServicosController().findByParam )//ok
 router.put(`${versao}/servico`,             AuthMiddleware,  new ServicosController().update )//ok
 router.get(`${versao}/offline/servicos`,       new ServicosController().findAll ) //ok
 router.get(`${versao}/servicos/:servico`,   AuthMiddleware,  new ServicosController().buscaServicosNext)//ok
 router.post(`${versao}/servico`,            AuthMiddleware,  new ServicosController().insert)//ok

 router.post(`${versao}/empresa`,               new CreateEmpresa().create)//ok
 router.post(`${versao}/empresa/validacao`,   AuthMiddleware,  new CreateEmpresa().validaExistencia)//ok
 


 router.get(`${versao}/offline/veiculos`,     new VeiculoController().findAll )//ok
 router.put(`${versao}/veiculo`,             AuthMiddleware, new VeiculoController().update);//ok
 router.post(`${versao}/veiculo`,            AuthMiddleware, new VeiculoController().insert);//ok
 router.get(`${versao}/veiculos`,            AuthMiddleware,  new VeiculoController().findByParam )//ok
 

 router.post(`${versao}/formas_pagamento`,  AuthMiddleware, new FormasController().insert) //ok
 router.get(`${versao}/offline/formas_pagamento`,   new FormasController().findAll )//ok
 router.put(`${versao}/formas_pagamento`,  AuthMiddleware,  new FormasController().update )//ok
 router.get(`${versao}/formas_pagamento`,  AuthMiddleware,  new FormasController().findByParam )//ok

 
 router.get(`${versao}/offline/fotos`,     AuthMiddleware,  new fotosController().findAll )
 router.post(`${versao}/offline/fotos`,    AuthMiddleware,  new fotosController().insertOrUpdateItens )
 router.get(`${versao}/next/fotos`,   AuthMiddleware,   new fotosController().buscafotosNext)


 router.get(`${versao}/offline/tipo_os`,   new TipoOsController().findAll )
 router.get(`${versao}/tipo_os`,          AuthMiddleware,  new TipoOsController().findByParam )
 router.post(`${versao}/tipo_os`,         AuthMiddleware,  new TipoOsController().insert )
 router.put(`${versao}/tipo_os`,          AuthMiddleware,  new TipoOsController().update )

 

 router.get(`${versao}/pedidos`,        AuthMiddleware, new pedidoController().select)
 router.post(`${versao}/pedidos`,       AuthMiddleware, new pedidoController().insert)
 router.get(`${versao}/pedidos/vendas`, AuthMiddleware,   new pedidoNextController().findByParam)
 router.get(`${versao}/pedido`,         AuthMiddleware, new pedidoNextController().findCompleteOrderByCode)

 router.get(`${versao}/pedidos_totais`,    AuthMiddleware, new pedidoController().selectTotais )
 router.get(`${versao}/pedidos_ultimos_inseridos`,    AuthMiddleware, new pedidoController().selectUltimosInseridos )
 router.get(`${versao}/pedidos_totais_por_data`,    AuthMiddleware, new pedidoController().selectTotaiPorData )


 router.get(`${versao}/produto_setor/:produto`,   AuthMiddleware, new ProdutoSetorController().findByCode)//ok
 router.get( `${versao}/produto_setor`,           AuthMiddleware, new ProdutoSetorController().findBysProdSector)
 router.post(`${versao}/produto_setor`,            AuthMiddleware, new ProdutoSetorController().updateSaldo)//ok
 router.get( `${versao}/offline/produto_setor`,           AuthMiddleware, new ProdutoSetorController().findAll)

 /**
  * processa dados dos produtos nos setores
  */
 router.post( `${versao}/offline/produto_setor`,           AuthMiddleware, new ProdutoSetorController().updateOffline)


 router.get( `${versao}/offline/setores`,  AuthMiddleware, new SetorController().findAll)
 router.put( `${versao}/setores`,  AuthMiddleware, new SetorController().update)
 router.post( `${versao}/setores`,  AuthMiddleware, new SetorController().insert)
 router.get( `${versao}/setores`,  AuthMiddleware, new SetorController().findByParam)

 router.get( `${versao}/offline/movimentos_produtos`,  AuthMiddleware, new MovimentosProdutosController().findAll)
 //router.put( `${versao}/movimentos_produtos`,  AuthMiddleware, new MovimentosProdutosController().update)
 router.post( `${versao}/movimentos_produtos`,  AuthMiddleware, new MovimentosProdutosController().insert)
 router.get( `${versao}/movimentos_produtos`,           AuthMiddleware, new MovimentosProdutosController().findByParam)
 router.post( `${versao}/offline/movimentos_produtos`,  AuthMiddleware, new MovimentosProdutosController().updateOffline )

 router.post(`${versao}/offline/distribuicao_locais_setor`,  AuthMiddleware, new DistribuicaoController().update)
 router.get(`${versao}/offline/distribuicao_locais_setor`,  AuthMiddleware, new DistribuicaoController().findAll)
 router.get(`${versao}/distribuicao_locais_setor`,  AuthMiddleware, new DistribuicaoController().findByParam)

 ////////
 router.get( `${versao}/locais`,  AuthMiddleware, new LocaisController().busca)
 router.post( `${versao}/locais`,  AuthMiddleware, new LocaisController().insert)
 router.put( `${versao}/locais`,  AuthMiddleware, new LocaisController().update)

 ////////

  router.post(`${versao}/enviar_codigo`,   new EnvioCodigoValidador().main);
  router.post(`${versao}/alterar_senha`,   new Alterar_senha().main);

//

 router.post(`${versao}/login`,   new Login().login2)

 router.post(`${versao}/usuarios`,AuthMiddleware, new UsuariosController().cadastrar)

 router.get(`${versao}/usuarios`,AuthMiddleware, new UsuariosController().busca)


/////
//// 


 
 
 router.get(`${versao}/next/veiculos/:cliente`,          AuthMiddleware,  new VeiculoController().findByClient )
 router.get( `${versao}/next/movimentos_produtos`,           AuthMiddleware, new MovimentosProdutosController().findCompleteByParam)

 
 
    export {router} 