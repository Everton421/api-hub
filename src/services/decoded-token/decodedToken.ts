import Jwt from "jsonwebtoken";


type decoded = {
    cnpj: string,
    email: string,
    codigo: number
    iat: number
}

interface responseDecodToken {
    success: boolean,
    message?: string
    payload?: decoded
}


export function DecodedToken(token: string): responseDecodToken {
    const secret = process.env.SECRET;
    if (!secret) {
        return { success: false, message: `secret nao informado` }
    }
    let decoded;
    Jwt.verify(token, secret, (err: any, decodedPayload: any) => {
        if (err) {

            if (err.name === 'TokenExpiredError') {
                console.log(err.name)
                return { success: false, message: `Token expirado. ${err.name}` }

            }
            return { success: false, message: `Erro na verificação do jwt ${err.message}` }
        }
        if (!decodedPayload || !decodedPayload.cnpj) {
            console.log("Payoad do jwt invalido ", decodedPayload);
            return { success: false, message: `Payoad do jwt invalido ${decodedPayload}` }
        }
        decoded = decodedPayload as decoded;

    })

    return { success: true, message: '', payload: decoded }

}