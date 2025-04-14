import { conn } from "../../database/databaseConfig"
import { VeiculoBanco } from "../../types/veiculo/veiculo";



type veic = Omit<VeiculoBanco, 'codigo'>;

export class Insert_Veiculos{




    async cadastrar( empresa:string, veiculo:veic ){
        return new Promise( async (resolve, reject )=>{
            
            const {
                id,
                cliente,
                placa,
                marca,
                modelo,
                ano,
                cor,
                combustivel,
                data_cadastro,
                data_recadastro
                     
            } = veiculo;

            let sql = `
                    INSERT INTO ${empresa}.veiculos
                     (
                     id,
                     cliente,
                     placa,
                     marca,
                     modelo,
                     ano,
                     cor,
                     combustivel,
                     data_cadastro,
                     data_recadastro
                     ) VALUES
                    (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ? 
                    )
                     `;
            const values =  [  id, cliente, placa, marca, modelo, ano, cor, combustivel, data_cadastro, data_recadastro]


            await conn.query( sql , values,(err:any, result:any )=>{
                if(err){
                    console.log('erro ao tentar cadastrar o veiculo')
                    reject(err);
                }else{
                    resolve(result);
                }
            })  
        })
    }
}