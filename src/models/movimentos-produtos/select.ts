import { conn } from "../../database/databaseConfig";
import { IMovimentosProdutos } from "./types/movimentos_produtos";
 
type query = {
    setor:number
    produto:number
    quantidade:string
    tipo:string
    historico:string
    data_recadastro:string
     codigo :number,
    usuario:number

}

type queryAll= {
    data_recadastro:string
    usuario?:number
}
export class SelectMovimentosProdutos{
    
    async   findAll(empresa:any, query:queryAll )   {
        return new Promise <IMovimentosProdutos[]> ( async ( resolve , reject ) =>{
            
            let sql = ` select 
            *,
               coalesce( DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro
            from ${empresa}.movimentos_produtos  `
    
                let paramQuery =[];
                let valueQuery=[];
             if( query.usuario && query.usuario !== 0  ){
                paramQuery.push( ' usuario = ? ')
                valueQuery.push(query.usuario)
             }


            if(query.data_recadastro && query.data_recadastro !== '' ){
                paramQuery.push( ' data_recadastro >  ? ')
                valueQuery.push(query.data_recadastro);
            }
            let whereClause = ` WHERE `;
            
             let finalSql = sql;

            if(paramQuery.length > 0 ){
                finalSql = sql + whereClause +  paramQuery.join(' AND ') 
            }
                  
            await conn.query(finalSql, valueQuery, (err:any, result:IMovimentosProdutos[] )=>{
                if (err)  reject(err); 
                  resolve(result)
            })
         })
    }

    async findByParam(empresa: string, query:Partial<query>): Promise<IMovimentosProdutos[]> {
   
            let {
            setor,
            produto,
            quantidade,
            tipo,
            historico,
            data_recadastro,
            codigo,
            usuario
            } = query;
    
            let baseSql = `
                SELECT
                    *,
                 coalesce( DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro
                FROM  ${empresa}.movimentos_produtos
            `;  
    
            const conditions: string[] = [];
            const params: any[] = [];
    
         if (codigo) {
                conditions.push(" codigo = ?"); // Placeholder (?) para o parâmetro
                params.push(codigo);          // Adiciona o valor ao array de parâmetros
            }
            
            if (setor) {
                conditions.push(" setor = ?"); // Placeholder (?) para o parâmetro
                params.push(setor);          // Adiciona o valor ao array de parâmetros
            }
            
            if (produto) {
                conditions.push(" produto = ?");
                params.push( produto );  
            }

            if(quantidade){
                conditions.push(' quantidade = ? ');
                params.push(`${quantidade}`)
            }
            if(tipo){
                conditions.push(' tipo = ? ');
                params.push(`${tipo}`)
            }
             if(usuario){
                conditions.push(' usuario = ? ');
                params.push( usuario )
            }
            if(historico){
                conditions.push(' historico  like  ? ');
                params.push(`%${historico}%`)
            }
           
                if(data_recadastro){
                conditions.push( ' WHERE data_recadastro >  ? ')
                params.push(data_recadastro);
            }

            let whereClause = "";
            
            if (conditions.length > 0) {
                whereClause = " WHERE " + conditions.join(" AND ");
            }
    
            //conditions.join(" LIMIT ?");
    
    
            const finalSql = baseSql + whereClause  
    
            try {
           
                 return new Promise <IMovimentosProdutos[]> ( async ( resolve , reject ) =>{
                    await conn.query(finalSql, params,(err:any, result:IMovimentosProdutos[] )=>{
                        if (err){
                            reject(err);
                        }else{
                            resolve(result)
    
                        } 
                    })
    
                 })
    
    
            } catch (err) {
                console.error("Erro ao executar a query:", err);
                throw new Error("Falha ao buscar setorres no banco de dados.");
                // Ou `reject(err)` se estivesse dentro do `new Promise` original, mas com async/await é melhor lançar.
            }
       }

     
    async   findByCodeProduct(empresa:any,  produto:number )   {
        return new Promise <IMovimentosProdutos[]> ( async ( resolve , reject ) =>{
            
            let sql = ` select 
            *,
                 coalesce( DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro
            from ${empresa}.movimentos_produtos where produto = ?  `
    
             
            await conn.query(sql, produto, (err:any, result:IMovimentosProdutos[] )=>{
                if (err)  reject(err); 
                  resolve(result)
            })
         })
    }
 async   findByProdSector(empresa:any,  produto:number, setor:number )   {
        return new Promise <IMovimentosProdutos[]> ( async ( resolve , reject ) =>{
            
            let sql = ` select 
            *,
                 coalesce( DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro
            from ${empresa}.movimentos_produtos where produto = ?  and setor = ? `
    
             
            await conn.query(sql, [produto,setor], (err:any, result:IMovimentosProdutos[] )=>{
                if (err)  reject(err); 
                  resolve(result)
            })
         })
    }
}