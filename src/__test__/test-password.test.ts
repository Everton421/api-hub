import test from "node:test";
import argon2 from 'argon2';

class PasswordService{
   static async hashpassword( password: string ){
        try{
            const hash = await argon2.hash(password);
            
            return hash
        }catch(e){
            console.log(e)
            throw e
        }
    }

 static async verifyPassword(hashedPassword: string, inputPassword:string){
     try{
            const hash = await argon2.verify(hashedPassword,inputPassword );
            return hash
        }catch(e){
            console.log(e)
            throw e
        }
 }
}

test("teste argon", async ( t )=>{
    let hashpassword ;
    const input = 'senha@123'
        await t.test("teste hash senha ",async ()=>{
              const hash =  await PasswordService.hashpassword(input)
            console.log(hash)
            })

    //await t.test("teste verify senha ",async ()=>{
    //    hashpassword ='aaa'
    //          const resultVerify =  await PasswordService.verifyPassword(hashpassword!, input )
    //        console.log(resultVerify)
    //        })


})  