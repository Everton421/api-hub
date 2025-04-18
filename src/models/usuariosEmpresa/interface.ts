export interface usuarioEmpresa {
    codigo:number,
    nome:string,
    email:string,
    cnpj:string,
    senha:string,
    responsavel:string        
    }

export type newUserEmpresa = Omit<usuarioEmpresa , "codigo"> 
