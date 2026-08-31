import { type ResultSetHeader } from "mysql2";
import { conn } from "../databaseConfig.ts";

export class CreateTablePedidoStatus {

    async createTablePedidoStatus(databaseName: string) {
        let result = { sucess: false, message: '' };

        const sql = [
            `CREATE TABLE IF NOT EXISTS ??.pedido_status (
                id  bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                pedido  bigint(20) unsigned NOT NULL COMMENT 'codigo do pedido (pedidos.codigo)',
                marketplace  varchar(10) NOT NULL DEFAULT '' COMMENT 'sigla do marketplace',
                categoria  varchar(20) NOT NULL DEFAULT 'pedido' COMMENT 'pedido | pagamento | frete',
                status_origem  varchar(50) DEFAULT NULL COMMENT 'status bruto da plataforma',
                status_detail  varchar(100) DEFAULT NULL COMMENT 'status_detail da plataforma (ex: accredited)',
                tags  text DEFAULT NULL COMMENT 'JSON array (ex: no_shipping, test_order)',
                situacao  char(2) DEFAULT NULL COMMENT 'situacao local derivada (EA/AI/FI/FP/RE/BM)',
                data_evento  datetime DEFAULT NULL,
                payload_raw  json DEFAULT NULL COMMENT 'pedaco bruto do status da plataforma',
                data_cadastro  timestamp NOT NULL DEFAULT current_timestamp(),
                data_recadastro  timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                PRIMARY KEY ( id ),
                UNIQUE KEY  uk_pedido_marketplace_categoria  ( pedido , marketplace , categoria ),
                KEY  idx_marketplace  ( marketplace )
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`
        ];

        for (const i of sql) {
            const [resultCreateTable] = await conn.query(i, [databaseName]);
            const resutl = resultCreateTable as ResultSetHeader;
            if (resutl.serverStatus > 0) {
                result.sucess = true;
            } else {
                result.sucess = false;
                return result;
            }
        }
        return result;
    }
}
