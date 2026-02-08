CREATE DATABASE IF NOT EXISTS database_api_mobile; 
CREATE DATABASE IF NOT EXISTS database_teste_api_mobile; 

 
CREATE TABLE IF NOT EXISTS `database_api_mobile`.`empresas` (
  `codigo` int(11) NOT NULL AUTO_INCREMENT,
  `id` int(10) unsigned NOT NULL DEFAULT 0,
  `responsavel` int(11) NOT NULL DEFAULT 0,
  `cnpj` varchar(255) NOT NULL DEFAULT '',
  `nome` varchar(255) NOT NULL DEFAULT '',
  `email` varchar(255) DEFAULT NULL,
  `telefone` varchar(255) DEFAULT NULL,
  `banco_dados` varchar(255) DEFAULT NULL,
  `tipo_contrato` enum('T','N') DEFAULT 'T' COMMENT 't=teste, N=normal',
  `data_contrato` date DEFAULT '0000-00-00',
  `dias_contrato` int(10) DEFAULT 30,
  `inicio_contrato` date DEFAULT '0000-00-00',
  `fim_contrato` date DEFAULT '0000-00-00',
  `token` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`codigo`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

CREATE TABLE IF NOT EXISTS `database_teste_api_mobile`.`empresas` (
  `codigo` int(11) NOT NULL AUTO_INCREMENT,
  `id` int(10) unsigned NOT NULL DEFAULT 0,
  `responsavel` int(11) NOT NULL DEFAULT 0,
  `cnpj` varchar(255) NOT NULL DEFAULT '',
  `nome` varchar(255) NOT NULL DEFAULT '',
  `email` varchar(255) DEFAULT NULL,
  `telefone` varchar(255) DEFAULT NULL,
  `banco_dados` varchar(255) DEFAULT NULL,
  `tipo_contrato` enum('T','N') DEFAULT 'T' COMMENT 't=teste, N=normal',
  `data_contrato` date DEFAULT '0000-00-00',
  `dias_contrato` int(10) DEFAULT 30,
  `inicio_contrato` date DEFAULT '0000-00-00',
  `fim_contrato` date DEFAULT '0000-00-00',
  `token` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`codigo`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

  
CREATE TABLE IF NOT EXISTS `database_api_mobile`.`users_ml_integrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ml_user_id` bigint(20) NOT NULL,
  `system_user_code` int(11) NOT NULL COMMENT 'Códgio da empresa do cliente',
  `cnpj` varchar(255) NOT NULL COMMENT 'Nome do banco para conectar',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `integration_name` varchar(255) NOT NULL DEFAULT '',
  `plataforma` varchar(255) DEFAULT 'ML',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ml_user_id` (`ml_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `database_teste_api_mobile`.`users_ml_integrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ml_user_id` bigint(20) NOT NULL,
  `system_user_code` int(11) NOT NULL COMMENT 'Códgio da empresa do cliente',
  `cnpj` varchar(255) NOT NULL COMMENT 'Nome do banco para conectar',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `integration_name` varchar(255) NOT NULL DEFAULT '',
  `plataforma` varchar(255) DEFAULT 'ML',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ml_user_id` (`ml_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
 
CREATE TABLE IF NOT EXISTS `database_api_mobile`.`usuarios` (
  `codigo` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL DEFAULT '',
  `senha` varchar(255) NOT NULL DEFAULT '',
  `email` varchar(255) DEFAULT NULL,
  `cnpj` varchar(255) NOT NULL DEFAULT '',
  `responsavel` enum('S','N') DEFAULT 'N',
  `cod_recuperador` varchar(255) DEFAULT NULL,
  `data_expiracao` datetime DEFAULT '0000-00-00 00:00:00',
  `telefone` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
 
  
CREATE TABLE IF NOT EXISTS `database_teste_api_mobile`.`usuarios` (
  `codigo` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL DEFAULT '',
  `senha` varchar(255) NOT NULL DEFAULT '',
  `email` varchar(255) DEFAULT NULL,
  `cnpj` varchar(255) NOT NULL DEFAULT '',
  `responsavel` enum('S','N') DEFAULT 'N',
  `cod_recuperador` varchar(255) DEFAULT NULL,
  `data_expiracao` datetime DEFAULT '0000-00-00 00:00:00',
  `telefone` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
 