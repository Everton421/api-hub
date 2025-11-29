import { Request, Response } from "express";
import { SelectUsersMlIntegrations } from "../../models/users-ml-integration/select-users-ml-integration";  
import { DecodedToken } from "../../services/decoded-token/decodedToken";  
import { GetMlItemsService } from "../../services/ml-services/get-itens-ml";

export class MlItensController {
    // ... seus métodos anteriores (callback, getCode) ...

    /**
     * Rota de Teste: Lista produtos do Mercado Livre
     * GET /ml/items
     */
    async getItems(req: Request, res: Response) {
        try {
            // 1. Identifica o Usuário do ERP pelo Token do Header
            if (!req.headers.token) {
                return res.status(400).json({ erro: true, msg: "Token do sistema obrigatório" });
            }
            
            // Decodifica para pegar CNPJ e Código do Usuário
            const decoded = DecodedToken(String(req.headers.token)) as any ;
         
            if (decoded.erro || !decoded.payload) {
                return res.status(401).json({ msg: "Token inválido" });
            }

            const userCnpj = decoded.payload.cnpj; // ex: "12.345.678/0001-00"
            const systemUserCode = decoded.payload.codigo;

            // 2. Descobre qual conta do ML esse usuário tem vinculada
            // (Se você já tiver o ml_user_id vindo do front, pode pular essa etapa)
            const selectUsersMlIntegrations = new SelectUsersMlIntegrations();
            
            // Aqui eu assumo que você tem um método que busca TODAS as integrações desse usuário
            // Se não tiver, pode fazer um select simples na tabela users_ml_integration
            // Vou simular buscando a primeira integração encontrada:
            const integracoes = await selectUsersMlIntegrations.findBySystemUserCodeAndCnpj(systemUserCode, userCnpj); 
            // ^ Crie esse método no seu model se não existir, ou use uma query direta

            if (!integracoes || integracoes.length === 0) {
                return res.status(404).json({ msg: "Nenhuma conta do Mercado Livre vinculada a este usuário." });
            }

            // Pega a primeira conta vinculada (para teste)
            const mlUserId = integracoes[0].ml_user_id;

            // 3. Chama o Service para buscar os itens
            const mlItemsService = new GetMlItemsService();
            const result = await mlItemsService.getItemsFromSeller(userCnpj, systemUserCode, mlUserId);

            return res.status(200).json(result);

        } catch (error: any) {
            console.error(error);
            return res.status(500).json({ msg: "Erro ao buscar produtos", error: error.message });
        }
    }
}