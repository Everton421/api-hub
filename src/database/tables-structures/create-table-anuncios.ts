import { conn } from "../databaseConfig"

type resultDatabase =
    {
        fieldCount: number,
        affectedRows: number,
        insertId: number,
        serverStatus: number,
        warningCount: number,
        message: string,
        protocol41: boolean,
        changedRows: number
    }
type resulFunction = {
    sucess: boolean
    message: string | number
}

export class CreateTablesAnuncios {


    async createTable(databaseName: string) {

        const atributosAnunciosTable = `CREATE TABLE IF NOT EXISTS  ${databaseName}.atributos_anuncios  (
                                     id  int(11) unsigned NOT NULL AUTO_INCREMENT,
                                     id_anuncio  int(11) NOT NULL comment 'id referente ao anuncio',
                                     id_atributo  varchar(255) NOT NULL comment 'ID do atributo ( ex:  BRAND ,  MODEL , VOLTAGE )',
                                     nome_atributo  varchar(255) comment 'nome legivel ( ex:  Marca ,  Modelo )',
                                     valor_atributo  varchar(255) comment 'O valor ( ex:  Intel, i5-10400)',
                                     id_valor_atributo  varchar(255)comment 'ID do valor ( ex: 2230284 - o ML usa muito isso)',
                                       data_cadastro  timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                                        data_recadastro  timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                                    PRIMARY KEY ( id )
                                    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`;

        const anunciosTable = ` CREATE TABLE IF NOT EXISTS ${databaseName}.anuncios  (
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
                                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`;


        const results = Promise.all([this.execQuery(atributosAnunciosTable), this.execQuery(anunciosTable)]);
        console.log(results)


    }


    async execQuery(sql: string): Promise<resulFunction> {
        return new Promise((resolve, reject) => {

            conn.query(sql, (err: any | string, result: resultDatabase) => {
                if (err) {
                    console.log(err)
                    reject({ sucess: false, message: `[Erro ao registrar tabelas dos anuncios]| ${err}` } as resulFunction);
                } else {
                    console.log(result)
                    resolve({ sucess: true, message: "Tabelas registradas com sucesso" } as resulFunction)
                }
            })
        })
    }
}

