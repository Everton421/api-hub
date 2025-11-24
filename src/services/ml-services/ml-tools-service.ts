import axios from "axios";

const ML_API_URL = 'https://api.mercadolibre.com';

export class MlToolsService {

    /**
     * Prediz a categoria com base no título do produto
     * @param title Ex: "Iphone 14 Pro Max 128gb"
     */
    async predictCategory(title: string) {
        try {
            // Endpoint público do ML para o Brasil (MLB)
            const response = await axios.get(`${ML_API_URL}/sites/MLB/domain_discovery/search`, {
                params: {
                    q: title,
                    limit: 1 // Queremos apenas a melhor opção
                }
            });

            // O ML retorna um array. Se estiver vazio, não achou nada.
            if (response.data && response.data.length > 0) {
                const bestMatch = response.data[0];
                
                return {
                    found: true,
                    category_id: bestMatch.category_id,     // Ex: MLB1055
                    category_name: bestMatch.category_name, // Ex: Celulares e Smartphones
                    domain_id: bestMatch.domain_id,         // Ex: MLB-CELLPHONES
                    probability: bestMatch.prediction_probability
                };
            }

            return {
                found: false,
                msg: "Nenhuma categoria encontrada para este título."
            };

        } catch (error: any) {
            console.error("Erro no domain_discovery:", error.message);
            throw new Error("Falha ao consultar API de categorias do ML");
        }
    }
}