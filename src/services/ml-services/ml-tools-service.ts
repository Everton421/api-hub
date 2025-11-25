import axios from "axios";

const ML_API_URL = 'https://api.mercadolibre.com';

export class MlToolsService {

    async predictCategory(title: string) {
        try {
            // 1. Descobre a categoria
            const response = await axios.get(`${ML_API_URL}/sites/MLB/domain_discovery/search`, {
                params: { q: title, limit: 1 }
            });

            if (!response.data || response.data.length === 0) {
                return { found: false, msg: "Nenhuma categoria encontrada." };
            }

            const bestMatch = response.data[0];
            const categoryId = bestMatch.category_id;

            // 2. Busca os atributos dessa categoria
            // Endpoint: /categories/{CATEGORY_ID}/attributes
            const attrResponse = await axios.get(`${ML_API_URL}/categories/${categoryId}/attributes`);
            
            // 3. Filtra apenas os OBRIGATÓRIOS
            // Ignoramos BRAND e MODEL porque já tratamos eles manualmente no seu código
            const requiredAttributes = attrResponse.data
                .filter((attr: any) => 
                    attr.tags && 
                    attr.tags.required === true && 
                    attr.id !== 'BRAND' && 
                    attr.id !== 'MODEL'
                )
                .map((attr: any) => ({
                    id: attr.id,
                    name: attr.name,
                    value_type: attr.value_type, // string, number_unit, list, etc.
                    hint: attr.tooltip || ""
                }));

            return {
                found: true,
                category_id: categoryId,
                category_name: bestMatch.category_name,
                // Retorna a lista para o front desenhar os campos
                required_attributes: requiredAttributes 
            };

        } catch (error: any) {
            console.error("Erro no tools service:", error.message);
            throw new Error("Falha ao consultar inteligência do ML");
        }
    }
}