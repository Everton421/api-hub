import { conn } from "../../database/databaseConfig.ts";
import { type Requirements } from "./types/requirements.ts";

type input = Omit<Requirements, 'codigo'> & { codigo?: number }

export class UpdateRequirements{
    async update( dbName:string, data: input){
       
        const columns = [ ];


        const values = [];
            if(data.data_requerimento){
                columns.push(' data_requerimento = ? ');
                values.push(data.data_requerimento);
            }
            if(data.requerente){
                columns.push(' requerente = ? ');
                values.push(data.requerente);
            }
            if(data.data_efetuacao){
                 columns.push(' data_efetuacao = ? ');
                values.push(data.data_efetuacao);
            }
            if(data.responsavel){
                columns.push(' responsavel = ? ');
                values.push(data.responsavel);
            }
            if(data.pedido){
                        columns.push(' pedido = ? ');
                values.push(data.pedido);
            }
            if(data.setor_origem){
                   columns.push(' setor_origem = ? ');
                values.push(data.setor_origem);
            }
            if(data.setor_destino){
                 columns.push(' setor_destino = ? ');
                values.push(data.setor_destino);
            }
            if(data.historico){
             columns.push(' historico = ? ');
                values.push(data.historico);
            }
            if(data.situacao){
                columns.push(' situacao = ? ');
                values.push(data.situacao);
            }

            const whereClause  = ` WHERE codigo = ? `
            values.push(data.codigo);

            const baseSql = `UPDATE ${dbName}.requerimentos SET `;
                const finalSql = baseSql + columns.join(' , ') + whereClause

     const [result] = await conn.query(finalSql, values);
            return { insertId: (result as any).insertId };
    }
}