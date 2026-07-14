import { conn } from "../../database/databaseConfig.ts";
import { type Requirements } from "./types/requirements.ts";

type input = Omit<Requirements, 'codigo'> & { codigo?: number }

export class InsertRequirements{
    async insert( dbName:string, data: input){
       
        const columns = [
            'data_requerimento',
            'requerente',
            'data_efetuacao',
            'responsavel',
            'pedido',
            'setor_origem',
            'setor_destino',
            'historico',
            'situacao',
        ];

        const values = [
            data.data_requerimento,
            data.requerente,
            data.data_efetuacao,
            data.responsavel,
            data.pedido,
            data.setor_origem,
            data.setor_destino,
            data.historico,
            data.situacao,
        ];
        


        if(data.codigo && data.codigo != null){
            columns.unshift(' codigo ')
            values.unshift(data.codigo)
        }

        const placeholders = values.map(()=> '?').join(', ');
        const sql =`INSERT INTO ${dbName}.requerimentos (${columns.join(', ')}) VALUES (${placeholders})`;         
     const [result] = await conn.query(sql, values);
            return { insertId: (result as any).insertId };
    }
}