 import { type ResultSetHeader } from "mysql2";
import { conn } from "../databaseConfig.ts";

export class CreateTableMLAccounts {

 
 

     async createTableMlAcounts(databaseName: string){
          
          let result = { sucess: false, message:''};

          const sql = [ 
                `CREATE TABLE IF NOT EXISTS ??.ml_accounts (
                           id  int(11) NOT NULL AUTO_INCREMENT,
                             user_id  bigint(20) NOT NULL,
                             ml_user_id  bigint(20) NOT NULL,
                             access_token  text DEFAULT NULL,
                             refresh_token  text DEFAULT NULL,
                             token_expires_in  varchar(255) DEFAULT NULL,
                             PRIMARY KEY ( id ),
                             KEY user_id  ( user_id , ml_user_id)
                             ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

                               ` CREATE TABLE IF NOT EXISTS  ??.anuncios  (
                                        id  int(11) unsigned NOT NULL AUTO_INCREMENT,
                                        codigo_produto  int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'codigo do produto vindo da tabela de produtos.',
                                        integration_id  int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'id da integracao',
                                        plataforma  varchar(255) NOT NULL DEFAULT '' COMMENT 'abreviacao/nome da plataforma',
                                        estoque  decimal(10,2) DEFAULT 0.00, 
                                        preco  decimal(10,2) DEFAULT 0.00, 
                                        unidade_medida  varchar(255) DEFAULT 'UND',
                                        thumbnail varchar(255),
                                        descricao  varchar(255) NOT NULL DEFAULT '',
                                        titulo   varchar(255) NOT NULL DEFAULT '',
                                        num_fabricante  varchar(255) NOT NULL DEFAULT '' COMMENT 'eam/gtim',
                                        ativo  char(1) NOT NULL DEFAULT 'S',
                                        sku_externo  varchar(255) DEFAULT NULL,
                                        id_externo  varchar(255) DEFAULT NULL,
                                        link  varchar(255) DEFAULT NULL,
                                        data_cadastro  timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                                        data_recadastro  timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                                        PRIMARY KEY ( id )
                                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

                               `CREATE TABLE IF NOT EXISTS  ??.atributos_anuncios  (
                                     id  int(11) unsigned NOT NULL AUTO_INCREMENT,
                                     id_anuncio  int(11) NOT NULL comment 'id referente ao anuncio',
                                     id_atributo  varchar(255) NOT NULL comment 'ID do atributo ( ex:  BRAND ,  MODEL , VOLTAGE )',
                                     nome_atributo  varchar(255) comment 'nome legivel ( ex:  Marca ,  Modelo )',
                                     valor_atributo  varchar(255) comment 'O valor ( ex:  Intel, i5-10400)',
                                     id_valor_atributo  varchar(255)comment 'ID do valor ( ex: 2230284 - o ML usa muito isso)',
                                       data_cadastro  timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                                        data_recadastro  timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                                    PRIMARY KEY ( id )
                                    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`
          ]    
          for( const i of sql ){
                     const [ resultCreateTable ] = await conn.query(i, [databaseName]);
                         const resutl = resultCreateTable as ResultSetHeader;
                      if( resutl.serverStatus > 0 ){
                         result.sucess = true;
                         }else{
                             result.sucess = false;
                             return result;
                         }
                    }
             return result
     }


}
