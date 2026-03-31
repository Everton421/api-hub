import { conn , db_api} from "../databaseConfig.ts";

export class CompanyStructure {

  async createStructure(database_name: string) {
    // IMPORTANTE: Não adicione as crases manualmente. 
    // O driver (mysql/mysql2) fará isso automaticamente e de forma segura ao usar "??".
    
    const sqlTables = [
      `CREATE DATABASE IF NOT EXISTS ??;`
      ,
      `CREATE TABLE IF NOT EXISTS ??.produtos (
                  codigo int(11) unsigned NOT NULL AUTO_INCREMENT,
                  id  varchar(255) NOT NULL DEFAULT 0,
                  estoque  double DEFAULT 0,
                  preco  decimal(10,2) DEFAULT 0.00,
                  unidade_medida  varchar(255) DEFAULT 'UND',
                  grupo  int(11) DEFAULT 0,
                  origem  char(1) NOT NULL DEFAULT '0',
                  descricao  varchar(255) NOT NULL DEFAULT '',
                  num_fabricante  varchar(255) NOT NULL DEFAULT '',
                  num_original  varchar(255) DEFAULT NULL DEFAULT '',
                  sku  varchar(255) NOT NULL DEFAULT '',
                  marca  int(11) DEFAULT 0,
                  ativo  char(1) NOT NULL DEFAULT 'S',
                  class_fiscal  varchar(255) NOT NULL DEFAULT '',
                  cst  char(3) DEFAULT '00',
                  data_cadastro  date NOT NULL DEFAULT '2000-01-01',
                  data_recadastro  datetime NOT NULL DEFAULT '2000-01-01 00:00:00' , 
                  observacoes1  blob DEFAULT NULL,
                  observacoes2  blob DEFAULT NULL,
                  observacoes3  blob DEFAULT NULL,
                  tipo  int(10) NOT NULL DEFAULT 0,
                  PRIMARY KEY ( codigo )
              );`,
      `CREATE TABLE IF NOT EXISTS ??.servicos (
                  codigo int(11) unsigned NOT NULL AUTO_INCREMENT,
                  id  int(10) unsigned NOT NULL DEFAULT 0,
                  valor REAL DEFAULT 0,
                  aplicacao TEXT NOT NULL,
                  tipo_serv INTEGER DEFAULT 0,
                  data_cadastro  date NOT NULL DEFAULT '2000-01-01',
                  data_recadastro  datetime NOT NULL DEFAULT '2000-01-01 00:00:00' , 
                  ativo  char(1) NOT NULL DEFAULT 'S',
                  PRIMARY KEY ( codigo)
            );`,
      `CREATE TABLE IF NOT EXISTS ??.clientes (
            codigo int(11) unsigned NOT NULL AUTO_INCREMENT,
            id  varchar(255) NOT NULL DEFAULT '0',
            celular  varchar(255) DEFAULT NULL,
            nome  varchar(255) NOT NULL DEFAULT '',
            cep  varchar(255) NOT NULL DEFAULT '00000-000',
            endereco  varchar(255) DEFAULT NULL,
            ie  varchar(255) DEFAULT '',
            numero  varchar(255) DEFAULT '',
            cnpj  varchar(255) DEFAULT '',
            ativo  char(1) NOT NULL DEFAULT 'S',
            cidade  varchar(255) DEFAULT NULL,
            data_cadastro  date NOT NULL DEFAULT '2000-01-01',
            data_recadastro  datetime NOT NULL DEFAULT '2000-01-01 00:00:00' , 
            vendedor  int(11) NOT NULL DEFAULT 0,
            bairro  varchar(255) DEFAULT NULL,
            estado  char(2) DEFAULT NULL,
            PRIMARY KEY ( codigo )
            );`,
      `CREATE TABLE IF NOT EXISTS ??.forma_pagamento (
                codigo int(11) unsigned NOT NULL AUTO_INCREMENT,
                id int(10) unsigned NOT NULL DEFAULT 0,
                descricao TEXT NOT NULL, 
                desc_maximo INTEGER DEFAULT 0,  
                parcelas INTEGER DEFAULT 0,  
                intervalo INTEGER DEFAULT 0,  
                recebimento INTEGER DEFAULT 0,
                data_cadastro  date NOT NULL DEFAULT '2000-01-01',
                data_recadastro  datetime NOT NULL DEFAULT '2000-01-01 00:00:00' , 
                ativo  char(1) NOT NULL DEFAULT 'S',
                  PRIMARY KEY (codigo)
            );`,

      `CREATE TABLE IF NOT EXISTS ??.pedidos (
                codigo bigint(20)  unsigned NOT NULL DEFAULT 0,
                id  varchar(255) NOT NULL DEFAULT '0',
                id_externo  varchar(255) DEFAULT NULL,
                id_interno  varchar(255) DEFAULT NULL,
                vendedor  int(11) NOT NULL DEFAULT 0,
                situacao  char(2) NOT NULL DEFAULT 'EA',
                situacao_separacao  enum('N','P','I') NOT NULL DEFAULT 'N', 
                contato  varchar(255) DEFAULT NULL,
                descontos decimal(10,2) NOT NULL DEFAULT 0.00,
                frete decimal(10,2) DEFAULT 0.00,
                forma_pagamento  int(11) DEFAULT 0,
                observacoes  blob DEFAULT NULL,
                quantidade_parcelas  int(11) DEFAULT 0,
                total_geral  decimal(10,2) DEFAULT 0.00,
                total_produtos  decimal(10,2) DEFAULT 0.00, 
                total_servicos  decimal(10,2) DEFAULT 0.00, 
                cliente  int(11) NOT NULL DEFAULT 0,
                veiculo  int(11) NOT NULL DEFAULT 0,
                data_cadastro  date NOT NULL DEFAULT '2000-01-01',
                data_recadastro  datetime NOT NULL DEFAULT '2000-01-01 00:00:00' , 
                tipo_os  int(11) DEFAULT 0,
                enviado  enum('N','S') NOT NULL DEFAULT 'S',
                tipo  int(11) NOT NULL DEFAULT 1, 
                PRIMARY KEY (codigo),
                KEY id (id) USING BTREE
            );`,
      `CREATE TABLE IF NOT EXISTS ??.produtos_pedido (
                pedido bigint(20) unsigned NOT NULL DEFAULT 0,
                codigo INTEGER NOT NULL,
                desconto decimal(10,2) DEFAULT 0.00,
                quantidade decimal(10,2) NOT NULL DEFAULT 0.00,
                preco decimal(10,2) DEFAULT 0.00,
                frete decimal(10,2) DEFAULT 0.00, 
                total decimal(10,2) DEFAULT 0.00, 
                quantidade_separada decimal(10,2) DEFAULT 0.00,
                quantidade_faturada decimal(10,2) DEFAULT 0.00
            );`,
      `CREATE TABLE IF NOT EXISTS ??.servicos_pedido (
                pedido bigint(20) unsigned NOT NULL DEFAULT 0,
                codigo INTEGER NOT NULL,
                desconto decimal(10,2) DEFAULT 0.00,
                quantidade decimal(10,2) NOT NULL DEFAULT 0.00,
                valor decimal(10,2) DEFAULT 0.00,
                total decimal(10,2) DEFAULT 0.00 
            );`,
      `CREATE TABLE IF NOT EXISTS ??.parcelas (
                pedido bigint(20) unsigned NOT NULL DEFAULT 0,
                parcela INTEGER NOT NULL,
                valor decimal(10,2) NOT NULL DEFAULT 0.00,
                vencimento date NOT NULL DEFAULT '0000-00-00' 
        
            );`,
      `CREATE TABLE IF NOT EXISTS ??.usuarios (
                codigo  int(10)  NOT NULL AUTO_INCREMENT,
                nome TEXT NOT NULL,
                senha TEXT NOT NULL,
                email varchar(255),
                cnpj varchar(255),
                responsavel varchar(255) DEFAULT 'N',
                ativo  char(1) NOT NULL DEFAULT 'S',
                PRIMARY KEY (codigo) USING BTREE 
            );`,
      `CREATE TABLE IF NOT EXISTS ??.tipos_os (
                  codigo  int(11) NOT NULL AUTO_INCREMENT,
                  id  int(10) unsigned NOT NULL DEFAULT 0,
                  descricao TEXT NOT NULL,
                  data_cadastro  date NOT NULL DEFAULT '2000-01-01',
                  data_recadastro  datetime NOT NULL DEFAULT '2000-01-01 00:00:00' , 
                  ativo  char(1) NOT NULL DEFAULT 'S',
                PRIMARY KEY ( codigo )
            );`,

      `CREATE TABLE IF NOT EXISTS ??.veiculos (
                codigo  int(11) NOT NULL AUTO_INCREMENT,
                id int(10) unsigned NOT NULL DEFAULT 0,
                cliente INTEGER NOT NULL DEFAULT 0,
                placa varchar(255) NOT NULL DEFAULT '',
                marca varchar(255) NOT NULL DEFAULT '',
                modelo varchar(255) NOT NULL DEFAULT '',
                ano varchar(255) NOT NULL DEFAULT '',
                cor varchar(255) NOT NULL DEFAULT '',
                combustivel varchar(255) NOT NULL DEFAULT '',
                data_cadastro  date NOT NULL DEFAULT '2000-01-01',
                data_recadastro  datetime NOT NULL DEFAULT '2000-01-01 00:00:00' , 
                ativo  char(1) NOT NULL DEFAULT 'S',
                  PRIMARY KEY ( codigo )
            );`,

      `CREATE TABLE IF NOT EXISTS ??.api_config (
                codigo INTEGER PRIMARY KEY NOT NULL,
                url TEXT NOT NULL,
                porta INTEGER NOT NULL DEFAULT 3000,
                token TEXT NOT NULL 
            );`,
      ` CREATE TABLE IF NOT EXISTS ??.fotos_produtos (
              produto int(10) unsigned NOT NULL DEFAULT 0,
              sequencia int(10) unsigned NOT NULL DEFAULT 0,
              descricao varchar(50) DEFAULT NULL,
              link text NOT NULL,
              foto longblob DEFAULT NULL,
              data_cadastro date NOT NULL DEFAULT '0000-00-00',
              data_recadastro datetime DEFAULT NULL,
              PRIMARY KEY ( produto , sequencia ) USING BTREE
            ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci ROW_FORMAT=DYNAMIC;
              `,
      ` CREATE TABLE IF NOT EXISTS ??.categorias  (
                  codigo  int(11) NOT NULL AUTO_INCREMENT,
                  id  int(10) unsigned NOT NULL DEFAULT 0,
                  data_cadastro  date NOT NULL DEFAULT '2000-01-01',
                  data_recadastro  datetime NOT NULL DEFAULT '2000-01-01 00:00:00' , 
                  descricao  varchar(255) NOT NULL DEFAULT '',
                  ativo  char(1) NOT NULL DEFAULT 'S',
                PRIMARY KEY ( codigo )
              ) ;
              `,
      ` CREATE TABLE IF NOT EXISTS ??.marcas  (
                codigo  int(11) NOT NULL AUTO_INCREMENT,
                id  int(10) unsigned NOT NULL DEFAULT 0,
                data_cadastro  date NOT NULL DEFAULT '2000-01-01',
                data_recadastro  datetime NOT NULL DEFAULT '2000-01-01 00:00:00' , 
                descricao  varchar(255) NOT NULL DEFAULT '',
                ativo  char(1) NOT NULL DEFAULT 'S',
              PRIMARY KEY ( codigo )
            ) ;
            `,
      ` CREATE TABLE IF NOT EXISTS ??.produto_setor  (
              setor  int(10) unsigned NOT NULL DEFAULT 0,
              produto  int(10) unsigned NOT NULL DEFAULT 0,
              estoque  float(15,6) NOT NULL DEFAULT 0.000000,
              local_produto  varchar(20) DEFAULT '',
              local1_produto  varchar(20) DEFAULT '',
              local2_produto  varchar(20) DEFAULT '',
              local3_produto  varchar(20) DEFAULT '',
              local4_produto  varchar(20) DEFAULT '',
              data_recadastro  datetime NOT NULL DEFAULT '2000-01-01 00:00:00' , 
              PRIMARY KEY (setor , produto) USING BTREE,
              KEY PRODUTO (produto,setor) USING BTREE
            ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci ROW_FORMAT=DYNAMIC COMMENT='Produtos do Setor';
            `,
      ` CREATE TABLE IF NOT EXISTS ??.setores (
                codigo  int(11) NOT NULL AUTO_INCREMENT,
                id  varchar(255) NOT NULL DEFAULT '0',
                descricao  text NOT NULL,
              data_cadastro  date NOT NULL DEFAULT '2000-01-01',
                data_recadastro  datetime NOT NULL DEFAULT '2000-01-01 00:00:00' , 
                ativo  char(1) NOT NULL DEFAULT 'S',
                PRIMARY KEY (codigo)
              ) ENGINE=InnoDB  DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
            `,
      ` CREATE TABLE IF NOT EXISTS ??.movimentos_produtos (
              id  int(10) unsigned NOT NULL AUTO_INCREMENT,
              codigo  int(11) NOT NULL DEFAULT 0,
              setor  int(10) DEFAULT 0,
              produto  int(10) DEFAULT 0,
              quantidade  varchar(255) DEFAULT '0',
              unidade_medida varchar(255) NOT NULL DEFAULt 'UND',
              tipo  varchar(255) DEFAULT 'A' COMMENT 'A=acerto',
              historico  varchar(255) DEFAULT NULL,
                data_recadastro  datetime NOT NULL DEFAULT '2000-01-01 00:00:00' , 
              usuario  int(10) NOT NULL,
              ent_sai  char(1) NOT NULL DEFAULT '',
              PRIMARY KEY ( id ),
              UNIQUE KEY  codigo  ( codigo , usuario )
            ) ENGINE=InnoDB   DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
            `,
      `CREATE TABLE IF NOT EXISTS ??.locais (
              codigo  int(11) NOT NULL AUTO_INCREMENT,
              id  varchar(255) NOT NULL DEFAULT '0',
              descricao  text NOT NULL,
              setor  int(11) NOT NULL DEFAULT 0,
              data_cadastro  date NOT NULL DEFAULT '2000-01-01',
              data_recadastro  datetime NOT NULL DEFAULT '2000-01-01 00:00:00' , 
              ativo  char(1) NOT NULL DEFAULT 'S',
              PRIMARY KEY (codigo)
            ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
            `,
      ` CREATE TABLE IF NOT EXISTS ??.distribuicao_locais_setor  (    
                produto  int(11) NOT NULL DEFAULT 0,
                setor  int(11) NOT NULL DEFAULT 0,
                unidade_medida varchar(255)  DEFAULT 'UND',
                quantidade varchar(255) NOT NULL DEFAULT '0',
                local int(11) NOT NULL DEFAULT 0,
                data_cadastro  date NOT NULL DEFAULT '2000-01-01',
                data_recadastro  datetime NOT NULL DEFAULT '2000-01-01 00:00:00' 
          ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
          `,
      ` CREATE TABLE IF NOT EXISTS ??.caracteristicas (
                codigo  int(11) NOT NULL AUTO_INCREMENT,
                id  varchar(255) NOT NULL DEFAULT '0',
                descricao  varchar(255) NOT NULL ,
                unidade  varchar(255) NOT NULL DEFAULT 'Und',
                data_cadastro  date NOT NULL DEFAULT '2000-01-01',
                data_recadastro  datetime NOT NULL DEFAULT '2000-01-01 00:00:00' , 
                ativo  char(1) NOT NULL DEFAULT 'S',
                PRIMARY KEY (codigo)
              ) ENGINE=InnoDB  DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
            `
    ];

   


        try {
          const tablePromises = sqlTables.map(async (query) => {
              await conn.query(query, [database_name]);
          });

        } catch (tableErr) {
          console.log("[X] Erro ao tentar registrar o banco de dados da empresa.")
        }
     
  }
}