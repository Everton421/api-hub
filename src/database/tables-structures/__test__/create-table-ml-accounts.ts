import { CreateTableMLAccounts } from "../ml-accounts";

const obj = new CreateTableMLAccounts()

 
 
async function teste( ) {
     
    let aux=     await  obj.createTable('57473685000100')  
        console.log (aux)
  
}

teste();