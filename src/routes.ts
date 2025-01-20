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

 
 router.get(`${versao}/offline/produtos`,   checkToken,  new ProdutoController().buscaGeral )
 router.post(`${versao}/produtos`,          checkToken, new ProdutoController().cadastrar)
 router.get(`${versao}/offline/fotos`,   checkToken,  new fotosController().buscaGeral )

 router.get(`${versao}/offline/clientes`,   checkToken,  new ClienteController().buscaGeral )
 router.post(`${versao}/clientes`,          checkToken, new ClienteController().cadastrar)

 router.get(`${versao}/offline/servicos`,         checkToken,  new ServicosController().buscaGeral )
 router.post(`${versao}/servicos`,  checkToken,  new ServicosController().cadastrar)

 router.get(`${versao}/offline/formas_pagamento`, checkToken,  new FormasController().buscaGeral )
 router.post(`${versao}/formas_pagamento`,checkToken, new FormasController().cadastrar)

 router.get(`${versao}/offline/tipo_os`,          checkToken,  new TipoOsController().buscaGeral )
 router.get(`${versao}/offline/veiculos`,         checkToken,  new VeiculoController().busca )

 router.get(`${versao}/pedidos`,  checkToken,  new pedidoController().select)

 ////////
  router.post(`${versao}/enviar_codigo`,  checkToken, new EnvioCodigoValidador().main);
  router.post(`${versao}/alterar_senha`,  checkToken, new Alterar_senha().main);

 router.post(`${versao}/empresa`,   checkToken, new CreateEmpresa().create)
 router.post(`${versao}/empresa/validacao`, checkToken,  new CreateEmpresa().validaExistencia)
//

 router.post(`${versao}/login`, checkToken,  new Login().login)
 router.post(`${versao}/registrar_usuario`,checkToken, new UsuariosController().cadastrar)
/////
 router.post(`${versao}/pedidos`, checkToken, new pedidoController().insert)
////
router.post(`${versao}/offline/categorias`,   new CategoriaController().cadastrar )
router.get(`${versao}/offline/categorias`,   new CategoriaController().buscaGeral )
router.get(`${versao}/offline/categorias/:descricao`,   new CategoriaController().buscaPorDescricao )

////

router.post(`${versao}/offline/marcas`,   new MarcasController().cadastrar )
router.get(`${versao}/offline/marcas`,   new MarcasController().buscaGeral )
router.get(`${versao}/offline/marcas/:descricao`,   new MarcasController().buscaPorDescricao )

//////////// rotas next
 router.get(`${versao}/next/produtos/:produto`,  checkToken,  new ProdutoController().buscaProdutoNext)
    


 
    export {router} 