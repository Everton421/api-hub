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
                  origem  varchar(255) DEFAULT '00',
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
                  caracteristica int(10) NOT NULL DEFAULT 0,
                  PRIMARY KEY ( codigo )
              );`,
      `CREATE TABLE IF NOT EXISTS ??.servicos (
                  codigo int(11) unsigned NOT NULL AUTO_INCREMENT,
                  id varchar(255) NOT NULL DEFAULT 0,
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
                id varchar(255) NOT NULL DEFAULT '0',
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
                codigo_perfil int(10) NOT NULL,
                PRIMARY KEY (codigo) USING BTREE 
            );`,
      `CREATE TABLE IF NOT EXISTS ??.tipos_os (
                  codigo  int(11) NOT NULL AUTO_INCREMENT,
                  id  varchar(255)NOT NULL DEFAULT 0,
                  descricao TEXT NOT NULL,
                  data_cadastro  date NOT NULL DEFAULT '2000-01-01',
                  data_recadastro  datetime NOT NULL DEFAULT '2000-01-01 00:00:00' , 
                  ativo  char(1) NOT NULL DEFAULT 'S',
                PRIMARY KEY ( codigo )
            );`,

      `CREATE TABLE IF NOT EXISTS ??.veiculos (
                codigo  int(11) NOT NULL AUTO_INCREMENT,
                id varchar(255) NOT NULL DEFAULT 0,
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
                  id  varchar(255) NOT NULL DEFAULT 0,
                  data_cadastro  date NOT NULL DEFAULT '2000-01-01',
                  data_recadastro  datetime NOT NULL DEFAULT '2000-01-01 00:00:00' , 
                  descricao  varchar(255) NOT NULL DEFAULT '',
                  ativo  char(1) NOT NULL DEFAULT 'S',
                PRIMARY KEY ( codigo )
              ) ;
              `,
      ` CREATE TABLE IF NOT EXISTS ??.marcas  (
                codigo  int(11) NOT NULL AUTO_INCREMENT,
                id  varchar(255) NOT NULL DEFAULT 0,
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
              codigo int(10) unsigned NOT NULL AUTO_INCREMENT,
              id  int(11) NOT NULL DEFAULT 0,
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
            `,
      `CREATE TABLE IF NOT EXISTS ??.perfis (
                codigo  int(11) NOT NULL AUTO_INCREMENT,
                id  varchar(255) NOT NULL DEFAULT '0',
                nome  varchar(50) NOT NULL,
                data_cadastro  date NOT NULL DEFAULT '2000-01-01',
                data_recadastro  datetime NOT NULL DEFAULT '2000-01-01 00:00:00' , 
                ativo  char(1) NOT NULL DEFAULT 'S',
                PRIMARY KEY (codigo)
              ) ENGINE=InnoDB  DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
            `,
      `CREATE TABLE IF NOT EXISTS ??.permissoes (
                codigo  int(11) NOT NULL AUTO_INCREMENT,
                id  varchar(255) NOT NULL DEFAULT '0',
                descricao  varchar(255) NOT NULL,
                data_cadastro  date NOT NULL DEFAULT '2000-01-01',
                data_recadastro  datetime NOT NULL DEFAULT '2000-01-01 00:00:00' , 
                ativo  char(1) NOT NULL DEFAULT 'S',
                PRIMARY KEY (codigo)
              ) ENGINE=InnoDB  DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
            `,
      `CREATE TABLE IF NOT EXISTS ??.perfil_permissoes (
                codigo_perfil  int(11) NOT NULL,
                codigo_permissao  int(11) NOT NULL,
                PRIMARY KEY (codigo_perfil, codigo_permissao)
              ) ENGINE=InnoDB  DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
            `
    ];

   


        try {
          const tablePromises = sqlTables.map(async (query) => {
              await conn.query(query, [database_name]);
          });

          await Promise.all(tablePromises);
          await this.seedDefaultData(database_name);

        } catch (tableErr) {
          console.log("[X] Erro ao tentar registrar o banco de dados da empresa.")
        }
      
  }

  private async seedDefaultData(database_name: string) {
    const dataAtual = new Date().toISOString().split('T')[0];
    const dataHoraAtual = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const perfis = [
      { id: '1', nome: 'Administrador' },
      { id: '2', nome: 'Gerente' },
      { id: '3', nome: 'Vendedor' },
      { id: '4', nome: 'Estoque' }
    ];

    const permissoes = [
      { id: 'produtos.ler', descricao: 'Visualizar produtos' },
      { id: 'produtos.criar', descricao: 'Criar produtos' },
      { id: 'produtos.editar', descricao: 'Editar produtos' },
      { id: 'produtos.deletar', descricao: 'Excluir produtos' },
      { id: 'pedidos.ler', descricao: 'Visualizar pedidos' },
      { id: 'pedidos.criar', descricao: 'Criar pedidos' },
      { id: 'pedidos.editar', descricao: 'Editar pedidos' },
      { id: 'pedidos.deletar', descricao: 'Excluir pedidos' },
      { id: 'clientes.ler', descricao: 'Visualizar clientes' },
      { id: 'clientes.criar', descricao: 'Criar clientes' },
      { id: 'clientes.editar', descricao: 'Editar clientes' },
      { id: 'clientes.deletar', descricao: 'Excluir clientes' },
      { id: 'usuarios.ler', descricao: 'Visualizar usuários' },
      { id: 'usuarios.criar', descricao: 'Criar usuários' },
      { id: 'usuarios.editar', descricao: 'Editar usuários' },
      { id: 'usuarios.deletar', descricao: 'Excluir usuários' },
      { id: 'servicos.ler', descricao: 'Visualizar serviços' },
      { id: 'servicos.criar', descricao: 'Criar serviços' },
      { id: 'servicos.editar', descricao: 'Editar serviços' },
      { id: 'servicos.deletar', descricao: 'Excluir serviços' },
      { id: 'setores.ler', descricao: 'Visualizar setores' },
      { id: 'setores.criar', descricao: 'Criar setores' },
      { id: 'setores.editar', descricao: 'Editar setores' },
      { id: 'setores.deletar', descricao: 'Excluir setores' },
      { id: 'veiculos.ler', descricao: 'Visualizar veículos' },
      { id: 'veiculos.criar', descricao: 'Criar veículos' },
      { id: 'veiculos.editar', descricao: 'Editar veículos' },
      { id: 'veiculos.deletar', descricao: 'Excluir veículos' },
      { id: 'relatorios.ler', descricao: 'Visualizar relatórios' },
      { id: 'configuracoes.ler', descricao: 'Visualizar configurações' },
      { id: 'configuracoes.editar', descricao: 'Editar configurações' }
    ];

    const permAdministrador = permissoes.map(p => p.id);

    const permGerente = [
      'produtos.ler', 'produtos.criar', 'produtos.editar',
      'pedidos.ler', 'pedidos.criar', 'pedidos.editar',
      'clientes.ler', 'clientes.criar', 'clientes.editar',
      'usuarios.ler',
      'servicos.ler', 'servicos.criar', 'servicos.editar',
      'setores.ler', 'setores.criar', 'setores.editar',
      'veiculos.ler', 'veiculos.criar', 'veiculos.editar',
      'relatorios.ler'
    ];

    const permVendedor = [
      'produtos.ler',
      'pedidos.ler', 'pedidos.criar', 'pedidos.editar',
      'clientes.ler', 'clientes.criar', 'clientes.editar',
      'servicos.ler',
      'veiculos.ler', 'veiculos.criar'
    ];

    const permEstoque = [
      'produtos.ler', 'produtos.criar', 'produtos.editar',
      'clientes.ler',
      
      'setores.ler', 'setores.criar', 'setores.editar',
      'veiculos.ler'
    ];

    const perfilPermissoes: { [key: string]: string[] } = {
      '1': permAdministrador,
      '2': permGerente,
      '3': permVendedor,
      '4': permEstoque
    };

    try {
      const insertPerfil = `INSERT INTO ??.perfis (id, nome, data_cadastro, data_recadastro, ativo) VALUES (?, ?, ?, ?, 'S')`;
      const insertPermissao = `INSERT INTO ??.permissoes (id, descricao, data_cadastro, data_recadastro, ativo) VALUES (?, ?, ?, ?, 'S')`;
      const insertPerfilPermissao = `INSERT INTO ??.perfil_permissoes (codigo_perfil, codigo_permissao) VALUES (?, ?)`;

      for (const perfil of perfis) {
        await conn.query(insertPerfil, [database_name, perfil.id, perfil.nome, dataAtual, dataHoraAtual]);
      }

      for (const permissao of permissoes) {
        await conn.query(insertPermissao, [database_name, permissao.id, permissao.descricao, dataAtual, dataHoraAtual]);
      }

      const [permRows] = await conn.query(`SELECT codigo, id FROM ??.permissoes`, [database_name]) as [any[], any];
      const permMap = new Map(permRows.map(p => [p.id, p.codigo]));

      for (const [perfilId, permIds] of Object.entries(perfilPermissoes)) {
        for (const permId of permIds) {
          const codigoPermissao = permMap.get(permId);
          if (codigoPermissao) {
            await conn.query(insertPerfilPermissao, [database_name, parseInt(perfilId), codigoPermissao]);
          }
        }
      }

      console.log(`[✓] Seed de perfis e permissões criado para ${database_name}`);
    } catch (err) {
      console.log("[X] Erro ao criar seed de perfis/permissões:", err);
    }
  }
}