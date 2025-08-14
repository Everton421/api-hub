import { conn } from "../../database/databaseConfig"

    
    
export async function registerDados( dbName:string ){

 

    const sqlTables = [
        `INSERT INTO ${dbName}.fotos_produtos  VALUES (1,1,'intel i5','https://i.ibb.co/tpDk4DD5/i5.png',NULL,'0000-00-00','0000-00-00 00:00:00'),
 (2,1,'SSD','https://i.ibb.co/Brqvtvj/Screenshot-6.png',X'49413D3D','2000-01-01','2000-01-01 00:00:00'),
 (3,1,'memoria','https://i.ibb.co/hFyNBk2/Screenshot-5.png',X'49413D3D','0000-00-00','2000-01-01 00:00:00'),
 (4,1,'placa mae','https://i.ibb.co/tpQ2byG/Screenshot-4.png',X'706C616361206D6165','0000-00-00','2000-01-01 00:00:00'),
 (5,1,'RYZEN-5','https://i.ibb.co/H7grssp/RYZEN-5.png',X'5A6E5177','0000-00-00','2000-01-01 00:00:00');`,
        `INSERT INTO ${dbName}.categorias VALUES (1,0,'2025-05-12','2025-05-12 12:23:12','LUBRIFICANTE','S'),(2,0,'2025-05-12','2025-05-12 12:23:12','MOTOR','S');`,
        `INSERT INTO ${dbName}.clientes VALUES (1,'0','(44) 99916-0504','CLIENT-TESTE-0001','02982-090','Rua Carmem Cunha','392.840.731.374','5','83.227.465/0001-07','S','São Paulo','2025-05-12','2025-05-12 12:23:12',0,'Jardim Sydney','SP'),(2,'0','(22) 22222-2222','CLIENT-TESTE-0002','04472-030','Rua Mazinho','656.991.912.536','2','88.987.659/0001-24','S','São Paulo','2025-05-12','2025-05-12 12:23:12',0,'Jardim Novo Pantanal','SP'); `,
        ` INSERT INTO ${dbName}.forma_pagamento  VALUES (1,1,'A VISTA',100,1,30,0,'2025-05-12','2025-05-12 12:23:12','S'),(2,2,'30 DIAS',100,1,0,0,'2025-05-12','2025-05-12 12:23:12','S'); `,
         `INSERT INTO ${dbName}.marcas  VALUES (1,2,'2025-05-12','2025-05-12 12:23:12','TINKEN7','S'),(2,0,'2025-05-12','2025-05-12 12:23:12','TINKEN9','S'); `,
        `INSERT INTO ${dbName}.produtos VALUES 
         (1,0,1,400,'UND',1,'2','Processador Intel Core I5-10400 Cache 12mb','1434124','324243','1555445',1,'S','8555.00.00','00','2025-05-12 12:23:12','2025-05-12',X'',X'',X'',1)
        ,(2,0,2,192.83,'UND',2,'0','SSD, Kingston, SA400S37/960G','7316573929277','ALR399365L','',148,'S','8555.00.00','00','2025-05-12 12:23:12','2025-05-12',X'',X'',X'',8),
        (3,0,0,86.37,'UND', 2,'0','Memória HyperX Fury de 8GB DIMM DDR4 2400Mhz para desktop','3982/3920','802740','7316574201396',43,'S','8555.00.00','00','2025-05-12 12:23:12','2025-05-12',X'6E756C6C',X'6E756C6C',X'6E756C6C',0),
        (4,0,3,520.15,'UND', 1,'0','Placa mãe LGA1700 / DDR5 - MSI MPG Z790 Carbon WiFi Gaming (ATX) ','6514654','5346','56486',1,'S','8555.00.00','00','2025-05-12 12:23:12','2025-05-12',NULL,NULL,NULL,1),
        (5,0,5,250,'UND', 1,'0','PROCESSADOR AMD RYZEN 5 8500G 3.5GHZ (MAX TURBO 5.0GHZ) 22MB CACHE AM5','987654','96151','4213',1,'S','8631.00.00','00','2025-05-12 12:23:12','2025-05-12',NULL,NULL,NULL,1);`,
        `INSERT INTO  ${dbName}.servicos  VALUES (1,0,3,'SUBSTITUIR PIVO DA SUSPENSAO 11',3,'2025-05-12','2025-05-12 12:23:12','S'),(2,0,900,'REVISAR DIFERENCIAL',0,'2025-05-12','2025-05-12 12:23:12','S'); `,
        `INSERT INTO  ${dbName}.tipos_os  VALUES (1,1,'SERVICOS','2025-05-12','2025-05-12 12:23:12','S'),(2,1,'SERVICOS','2025-05-12','2025-05-12 12:26:05','S');`,
        `INSERT INTO  ${dbName}.veiculos  VALUES (1,0,1,'ARI-7664','Fiat','Strada Working Celeb.1.4 Fire Flex 8V CS','2012','Preto','23','2025-05-12','2025-05-12 12:23:12','S'),(2,0,6,'AFB-9317','Fiat','Toro Volcano 2.0 16V 4x4 TB Diesel Aut.','2016','Prata','2','2025-05-12','2025-05-12 12:23:12','S');`,
    ]

    sqlTables.forEach( async ( i )=>{

        await conn.query(i, (err, result )=>{
                if(err) throw err;
                else
               console.log("dados registrados com sucesso!")
            return;
        })
    })

}


