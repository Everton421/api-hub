import { Router,Request,Response, NextFunction } from "express";
import { conn  } from "./database/databaseConfig";
import 'dotenv/config';
import { checkToken } from "./middleware/cheqtoken";
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

  const crypt = require('crypt');
  const router = Router();
  export const versao = '/v1'

    router.get(`${versao}/`, async (req:Request, res:Response)=>{
       await conn.getConnection(
         async (err:Error)=>{
           if(err){
               return res.json({"erro": "falha ao se conectar ao banco de dados1 "})
           }else{
             return  res.json({"ok":true});
           }
         }
       )

    })

    router.get(`${versao}/teste`,checkToken,(req,res)=>{ 
      return  res.json({"ok":true});
    })

 
 router.get(`${versao}/offline/produtos`,   checkToken,  new ProdutoController().buscaGeral )//ok
 router.post(`${versao}/produto`,          checkToken, new ProdutoController().cadastrar)//ok
 router.get(`${versao}/produtos`,  checkToken,  new ProdutoController().buscaProdutos)//ok
 router.get(`${versao}/produto/:codigo`,  checkToken,  new ProdutoController().buscaProdutoNextPorCodigo)//ok
 router.put(`${versao}/produto`,  checkToken,  new ProdutoController().update)//ok


 router.get(`${versao}/offline/clientes`,   checkToken,  new ClienteController().buscaGeral )//ok
 router.post(`${versao}/cliente`,           checkToken, new ClienteController().cadastrar)//ok
 router.get(`${versao}/clientes`,           checkToken, new ClienteController().buscaClientes)//ok
 router.put(`${versao}/cliente`,            checkToken,  new ClienteController().atualizar)//ok


 router.get(`${versao}/categorias` , checkToken, new CategoriaController().buscaCategorias)//ok

 router.get(`${versao}/offline/categorias`,   new CategoriaController().buscaGeral )//ok
 router.post(`${versao}/categoria`,   new CategoriaController().cadastrar )//ok
 router.put(`${versao}/categoria` , checkToken, new CategoriaController().atualizar)//ok

 router.post(`${versao}/marca`,   new MarcasController().cadastrar )//ok
 router.put(`${versao}/marca` , checkToken, new MarcasController().atualizar)//ok
 router.get(`${versao}/offline/marcas`,   new MarcasController().buscaGeral )
 router.get(`${versao}/marcas`,   new MarcasController().buscaMarcas )//ok

 router.get(`${versao}/servicos`,   checkToken,  new ServicosController().buscaServicos )//ok
 router.put(`${versao}/servico`,   checkToken,  new ServicosController().update )//ok
 router.get(`${versao}/offline/servicos`,         checkToken,  new ServicosController().buscaGeral ) //ok
 router.get(`${versao}/servicos/:servico`,  checkToken,  new ServicosController().buscaServicosNext)//ok
 router.post(`${versao}/servico`,  checkToken,  new ServicosController().cadastrar)//ok

 router.post(`${versao}/empresa`,   checkToken, new CreateEmpresa().create)//ok
 router.post(`${versao}/empresa/validacao`, checkToken,  new CreateEmpresa().validaExistencia)//ok
 


 router.get(`${versao}/offline/veiculos`,         checkToken,  new VeiculoController().busca )//ok
 router.put(`${versao}/veiculo`, checkToken, new VeiculoController().update);//ok
 router.post(`${versao}/veiculo`, checkToken, new VeiculoController().insert);//ok
 router.get(`${versao}/veiculos`,         checkToken,  new VeiculoController().buscaVeiculos )//ok
 

 router.post(`${versao}/formas_pagamento`,checkToken, new FormasController().cadastrar) //ok
 router.get(`${versao}/offline/formas_pagamento`, checkToken,  new FormasController().buscaGeral )//ok
 router.put(`${versao}/formas_pagamento`, checkToken,  new FormasController().atualizar )//ok
 router.get(`${versao}/formas_pagamento`, checkToken,  new FormasController().buscaFormaPagamento )//ok

 
 router.get(`${versao}/offline/fotos`,   checkToken,  new fotosController().buscaGeral )
 router.post(`${versao}/offline/fotos`,   checkToken,  new fotosController().cadastrar_deletarFotos )


 router.get(`${versao}/offline/tipo_os`, checkToken,  new TipoOsController().buscaGeral )
 router.get(`${versao}/tipo_os`, checkToken,  new TipoOsController().buscaTiposDeOs )
 router.post(`${versao}/tipo_os`, checkToken,  new TipoOsController().cadastrar )
 router.put(`${versao}/tipo_os`, checkToken,  new TipoOsController().atualizar )

 

 router.get(`${versao}/pedidos`,  checkToken,  new pedidoController().select)
 router.post(`${versao}/pedidos`, checkToken, new pedidoController().insert)
 router.get(`${versao}/pedidos/vendas`,  checkToken,  new pedidoNextController().novaBusca)
 router.get(`${versao}/pedido`,  checkToken,  new pedidoNextController().buscaPedidosCompleto)
 ////////

  router.post(`${versao}/enviar_codigo`,  checkToken, new EnvioCodigoValidador().main);
  router.post(`${versao}/alterar_senha`,  checkToken, new Alterar_senha().main);

//

 router.post(`${versao}/login`, checkToken,  new Login().login)
 router.post(`${versao}/registrar_usuario`,checkToken, new UsuariosController().cadastrar)
 router.get(`${versao}/usuarios`,checkToken, new UsuariosController().busca) 
/////
////


////


//////////// rotas next
 


 
 router.get(`${versao}/next/cliente/:codigo`,  checkToken,  new ClienteController().buscaClienteNextPorCodigo)



 router.get(`${versao}/next/fotos`,  checkToken,  new fotosController().buscafotosNext)
 
 router.get(`${versao}/next/veiculos/:cliente`,         checkToken,  new VeiculoController().buscaPorCliente )



 



 
    export {router} 