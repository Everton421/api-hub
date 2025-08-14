export interface usuarioEmpresa {
    codigo:number,
    nome:string,
    email:string,
    cnpj:string,
    senha:string,
    responsavel:string    
    ativo: 'S'| 'N'    
    }

export type newUserEmpresa = Omit<usuarioEmpresa , "codigo"> 
