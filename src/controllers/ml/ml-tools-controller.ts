import { Request, Response } from "express";
import { MlToolsService } from "../../services/ml-services/ml-tools-service";
export class MlToolsController {

    async predictCategory(req: Request, res: Response) {
        try {
            const { title } = req.body;

            // Validação básica
            if (!title || title.length < 3) {
                return res.status(400).json({
                    erro: true,
                    msg: "O título é obrigatório e deve ter pelo menos 3 caracteres."
                });
            }

            const toolsService = new MlToolsService();
            const result = await toolsService.predictCategory(title);

            return res.status(200).json(result);

        } catch (error: any) {
            return res.status(500).json({
                erro: true,
                msg: error.message
            });
        }
    }
}