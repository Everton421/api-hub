import { conn } from "../../database/databaseConfig"
import { Select_fotos } from "./select"


export class Delete_fotos{

    async delete(codigoProduto:Number ){

    const select = new Select_fotos();

    try{
        await conn.query(`DELETE FROM fotos_produtos WHERE produto=${codigoProduto}`)
        console.log('imagens deletadas com sucesso!')
    }catch(e){ console.log('erro ao deletar as imagens do produto:', codigoProduto)}

}
 

}
