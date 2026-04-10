import { randomUUID } from "node:crypto";
import { InsertClient } from "../models/client/insert.ts";
import { DateService } from "../utils/dateService.ts";
import { faker } from "@faker-js/faker";

export class MakeClient {
    async create(empresa: string, quantity: number): Promise<{ success: boolean; message: string; created: number }> {
        const insertClient = new InsertClient();
        const dateService = new DateService();
        const data_cadastro = dateService.obterDataAtual();
        const data_recadastro = dateService.obterDataHoraAtual();

        let created = 0;

        for (let i = 0; i < quantity; i++) {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const nome = `${firstName} ${lastName}`;
            const cpf = faker.number.bigInt({ min: 10000000000n, max: 99999999999n }).toString();
            const celular = faker.phone.number({ style: "national" }).replace(/\D/g, "");
            const cep = faker.location.zipCode("########");
            const endereco = faker.location.streetAddress();
            const numero = faker.location.buildingNumber();
            const bairro = faker.location.street();
            const cidade = faker.location.city();
            const estado = faker.location.state({ abbreviated: true });

                const id = randomUUID() as string; 
            await insertClient.insert(empresa, {
                id,
                celular,
                nome,
                cep,
                endereco,
                ie: "",
                numero,
                cnpj: cpf,
                cidade,
                data_cadastro,
                data_recadastro,
                vendedor: 1,
                bairro,
                estado,
                ativo: "S"
            });

            created++;
        }

        return { success: true, message: `${created} clientes criados com sucesso.`, created };
    }
}
