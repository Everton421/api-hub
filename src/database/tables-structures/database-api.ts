import { conn, db_api } from "../databaseConfig.ts"
 
 
 export class CreateTablesApi {

     async createtables(){
        const arrSql = [
            `CREATE DATABASE IF NOT EXISTS ??;`,
            `
CREATE TABLE IF NOT EXISTS ??.empresas  (
                 codigo  int(11) NOT NULL AUTO_INCREMENT,
                 id  int(10) unsigned NOT NULL DEFAULT 0,
                 responsavel  int(11) NOT NULL DEFAULT 0,
                 cnpj  varchar(255) NOT NULL DEFAULT '',
                 nome  varchar(255) NOT NULL DEFAULT '',
                 email  varchar(255) DEFAULT NULL,
                 telefone  varchar(255) DEFAULT NULL,
                 banco_dados  varchar(255) DEFAULT NULL,
                 logo_url  varchar(500) DEFAULT NULL COMMENT 'URL do logo da empresa',
                 cor_fonte  varchar(7) DEFAULT '#333333' COMMENT 'Cor da fonte',
                 cor_fundo  varchar(7) DEFAULT '#FFFFFF' COMMENT 'Cor de fundo',
                 cor_banner  varchar(7) DEFAULT '#1a73e8' COMMENT 'Cor do banner',
                 tipo_contrato  enum('T','N') DEFAULT 'T' COMMENT 't=teste, N=normal',
                 data_contrato  date DEFAULT '0000-00-00',
                 dias_contrato  int(10) DEFAULT 30,
                 inicio_contrato  date DEFAULT '0000-00-00',
                 fim_contrato  date DEFAULT '0000-00-00',
                 token  varchar(255) NOT NULL DEFAULT '',
                 PRIMARY KEY ( codigo ) USING BTREE
                 ) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
            `,
            `
            CREATE TABLE IF NOT EXISTS ??.usuarios (
                  codigo  int(11) NOT NULL AUTO_INCREMENT,
                  nome  varchar(255) NOT NULL DEFAULT '',
                  senha  varchar(255) NOT NULL DEFAULT '',
                  email  varchar(255) DEFAULT NULL,
                  cnpj  varchar(255) NOT NULL DEFAULT '',
                  responsavel  enum('S','N') DEFAULT 'N',
                  cod_recuperador  varchar(255) DEFAULT NULL,
                  data_expiracao  datetime DEFAULT '0000-00-00 00:00:00',
                  telefone  varchar(255) DEFAULT NULL,
                 codigo_perfil int(10)  DEFAULT 0,
                PRIMARY KEY ( codigo )
                ) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
               `,
               `
            CREATE TABLE IF NOT EXISTS ??.users_ml_integrations (
                 codigo  int(11) NOT NULL AUTO_INCREMENT,
                  ml_user_id varchar(255) ,
                  system_user_code varchar(255) ,
                   cnpj varchar(255) ,
                     integration_name varchar(255) ,
                    created_at varchar(255) ,
                PRIMARY KEY ( codigo )

                ) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


               `,
               ` CREATE TABLE  IF NOT EXISTS ??.marketplaces  (
                     id  int(11) NOT NULL AUTO_INCREMENT,
                     sigla  varchar(10) DEFAULT NULL,
                     plataforma  varchar(255) DEFAULT NULL,
                     url_logo  varchar(255) DEFAULT NULL,
                    PRIMARY KEY ( Id )
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
               
               `

        ]

        const values = [ db_api ]
        for( const i of arrSql ) {
                await conn.query(i, values);
        }

     }
 }
 