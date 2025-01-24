import { conn } from "../../database/databaseConfig"

export class Insert_fotos{

    async   cadastrar( empresa:string, foto:IFoto) {

        return new Promise( async (resolve, reject ) =>{
let sql = 
        `
        INSERT INTO ${empresa}.fotos_produtos
        (
      produto, 
      sequencia,    
      descricao,   
      link,    
      foto,    
      data_cadastro,   
      data_recadastro  
   )values(
            ${foto.produto}, 
            ${foto.sequencia},
            '${foto.descricao}',
            '${foto.link}',
            '${foto.foto}',
            '${foto.data_cadastro}',
            '${foto.data_recadastro}'
    )
        `

            await conn.query(sql,(err, result)=>{
                    if(err){
                        console.log(err);
                        reject(err);
                    }else{
                        console.log("foto registradaa com sucesso  ",result)
                        resolve(result.affectedRows)
                    }
                })
        })
    }
}