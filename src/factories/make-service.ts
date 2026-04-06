import { randomUUID } from "node:crypto";
import { InsertService } from "../models/service/insert.ts";
import { DateService } from "../utils/dateService.ts";
import { faker } from "@faker-js/faker";

const SERVICE_DESCRIPTIONS = [
    "Troca de óleo completo",
    "Revisão geral",
    "Alinhamento e balanceamento",
    "Freios - manutenção preventiva",
    "Troca de filtros",
    "Inspeção técnica veicular",
    "Lavagem completa",
    "Polimento automotivo",
    "Troca de velas de ignição",
    "Carregamento de bateria",
    "Instalação de acessórios",
    "Diagnóstico eletrônico",
    "Troca de correia dentada",
    "Manutenção do ar-condicionado",
    "Reparo em pintura"
];

export class MakeService {
    async createService(empresa: string, quantity: number): Promise<{ success: boolean; message: string }> {
        const insertService = new InsertService();
        const dateService = new DateService();
        const data_cadastro = dateService.obterDataAtual();
        const data_recadastro = dateService.obterDataHoraAtual();

        for (let i = 0; i <= quantity; i++) {
            const aplicacao = faker.helpers.arrayElement(SERVICE_DESCRIPTIONS);
            const valor = faker.number.float({ min: 50, max: 500, fractionDigits: 2 });

            await insertService.insert(empresa, {
                aplicacao,
                ativo: "S",
                data_cadastro,
                data_recadastro,
                id: randomUUID(),
                tipo_serv: 0,
                valor
            });
        }

        return { success: true, message: `${quantity + 1} serviços criados com sucesso.` };
    }
}