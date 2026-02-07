
export interface UsuarioApi
{
codigo:number,
nome:string,
email:string,
cnpj:string,
senha:string, 
responsavel:string       
telefone:string
}


export type newUser = Omit<UsuarioApi , "codigo"> 
