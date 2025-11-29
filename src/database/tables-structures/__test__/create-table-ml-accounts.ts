import { CreateTablesAnuncios } from "../create-table-anuncios";
import { CreateTableMLAccounts } from "../create-table-ml-accounts";

const obj = new CreateTableMLAccounts()
const createAnuncTable = new CreateTablesAnuncios();
 
 
async function teste( ) {
         let  dbName = `\`${12264558911}\``;

     
    let aux = await  createAnuncTable.createTable(dbName)  
        console.log (aux)
  
}

teste();