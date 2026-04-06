
export interface UsuarioApi {
    codigo: number,
    nome: string,
    email: string,
    cnpj: string,
    senha: string,
    responsavel: string
    telefone: string
    codigo_perfil: number
}


export type newUser = Omit<UsuarioApi, "codigo"> 
