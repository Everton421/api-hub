import Jwt from "jsonwebtoken";

interface responseDecodToken {
    success: boolean,
    message?: string
    payload?: dataStateuser
}
type dataStateuser = {
    cnpj: string
    codigo: number
    code_verifier?: string
}

export class DecodedMlStateToken {

    async decodedToken(token: string): Promise<responseDecodToken> {
        const secret = process.env.SECRET_ML_ENCODE_STATE;
        if (!secret) {
            return { success: false, message: `SECRET_ML_ENCODE_STATE secret nao informado.` }
        }

        try {
            const decoded = Jwt.verify(token, secret) as dataStateuser;
            if (!decoded || !decoded.cnpj) {
                console.log("Payload do jwt invalido ", decoded);
                return { success: false, message: `Payload do jwt invalido` }
            }
            return { success: true, message: '', payload: decoded }
        } catch (err: any) {
            if (err?.name === 'TokenExpiredError') {
                console.log(err.name)
                return { success: false, message: `Token expirado. ${err.name}` }
            }
            return { success: false, message: `Erro na verificação do jwt ${err?.message}` }
        }
    }
}