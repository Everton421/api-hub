import Jwt from "jsonwebtoken";


type decoded = {
    cnpj: string,
    email: string,
    senha: string,
    codigo: number
    iat: number
}

interface responseDecodToken {
    erro: boolean,
    msg?: string
    payload?: decoded
}


export function DecodedToken(token: string): responseDecodToken {
    const secret = process.env.SECRET;
    if (!secret) {
        return { erro: true, msg: `secret nao informado` }
    }
    let decoded;
    Jwt.verify(token, secret, (err: any, decodedPayload: any) => {
        if (err) {

            if (err.name === 'TokenExpiredError') {
                //return res.status(401).json({ msg: 'Token expirado.' });
                console.log(err.name)
                return { erro: "true", msg: `'Token expirado. ' ${err.name}` }

            }
            //   console.log(`Erro na verificação do jwt `, err.message);
            return { erro: "true", msg: `Erro na verificação do jwt ${err.message}` }
        }
        if (!decodedPayload || !decodedPayload.cnpj) {
            console.log("Payoad do jwt invalido ", decodedPayload);
            return { erro: "true", msg: `Payoad do jwt invalido ${decodedPayload}` }
        }
        decoded = decodedPayload as decoded;

    })

    return { erro: false, payload: decoded, msg: '' }

}