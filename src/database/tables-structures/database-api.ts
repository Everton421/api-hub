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

            `

        ]

        const values = [ db_api ]
        for( const i of arrSql ) {
                await conn.query(i, values);
        }

     }
 }
 