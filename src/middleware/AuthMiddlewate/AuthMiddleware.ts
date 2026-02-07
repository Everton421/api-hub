import { NextFunction, Request, Response } from "express";
import Jwt from "jsonwebtoken";
import { validaContratoLogin } from "../../services/validaContrato/validaContrato";

export async function AuthMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.token) {
        return res.status(401).json({ msg: 'Acesso negado. Token não fornecido.' });
    }
    const token = String(req.headers.token);

    const secret = process.env.SECRET;
    if (!secret) return res.status(500).json({ msg: "Erro interno do servidor [JWT Secret Missing]" })

    let cnpj: string = '';
    Jwt.verify(token, secret, (err: any, decodedPayload: any) => {

        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ msg: 'Token expirado.' });
            }
            console.log(`Erro na verificação do jwt `, err.message);
            return res.status(403).json({ msg: 'Token inválido ou malformado.' });
        }

        if (!decodedPayload || !decodedPayload.cnpj) {
            console.log("Payoad do jwt invalido ", decodedPayload);
            return res.status(403).json({ msg: 'Token inválido : CNPJ ausente.' });
        }

        cnpj = decodedPayload.cnpj

    })

    try {

        let resulValidContr = await validaContratoLogin(cnpj);

        if (resulValidContr.valido === false) {
            return res.status(400).json(
                {
                    erro: true,
                    tipo_contrato: resulValidContr.tipo_contrato,
                    msg: resulValidContr.tipo_contrato === 'T' ? 'Período de teste Expirado.' : `${resulValidContr.motivo}`
                });

        }
    } catch (e) {
        return res.status(500).json(
            { erro: true, msg: "Ocorreu um erro ao tentar verificar o contrato!" });
    }



    next();


}