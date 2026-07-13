import  * as argon2   from "argon2";
import test from "node:test";


 test("ARGON2",async ( t )=>{
    await t.test("",async ()=>{

        async function hasPassword(hasPassword: string){
                try{
                    const hash = await argon2.hash(hasPassword);
                    return hash;
                }catch( e ){
                    console.log(`[X] Erro ao tentar gerar senha criptografada.`, e);
                } 
        }

        async function verifyPassword(){

        }
        
    
    })


})