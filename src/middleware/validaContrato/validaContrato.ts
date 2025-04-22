import { NextFunction, Request, Response } from "express";
import { SelectEmpresa } from "../../models/empresa/select";
import { DateService } from "../../services/dateService";


 export  async function validaContratoMiddleware(  req:Request, res:Response,  next:NextFunction){
    
 
        if(!req.headers.cnpj ){
            return res.status(400).json(
               {
                erro: true,
                msg:"É necessario informar a empresa "
              } 
              );   
         } 
 
         let cnpj:any =   req.headers.cnpj ;

            const select = new SelectEmpresa();
         
            try {
                const resultEmpresaValid = await select.selectPorCnpj(cnpj);


                if (resultEmpresaValid.length > 0) {
                    const emrpr = resultEmpresaValid[0];
    
                    // --- Validação dos dados de entrada ---
                    if (!emrpr.data_contrato || isNaN(new Date(emrpr.data_contrato).getTime())) {
                        console.error(`Data de contrato inválida ou ausente para CNPJ ${cnpj}:`, emrpr.data_contrato);
                        return { valido: false, motivo: "Data de contrato inválida ou ausente" };
                    }
                    const dias_contrato_permitidos =  emrpr.dias_contrato 

                    if (isNaN(dias_contrato_permitidos) || dias_contrato_permitidos < 0) {
                         console.error(`Número de dias de contrato inválido ou ausente para CNPJ ${cnpj}:`, emrpr.dias_contrato);
                        return { valido: false, motivo: "Número de dias de contrato inválido ou ausente" };
                    }
                    // --- Fim da Validação ---
    
                    // --- Cálculo da Diferença de Datas ---
                    const dataAtual = new Date();
                    const data_contrato = new Date(emrpr.data_contrato);
                    const tipo_contrato = emrpr.tipo_contrato;

                    // **Normalização para meia-noite (recomendado para comparar dias inteiros)**
                    dataAtual.setHours(0, 0, 0, 0);
                    data_contrato.setHours(0, 0, 0, 0);
    
                    // Diferença em milissegundos
                    const diffEmMilissegundos = dataAtual.getTime() - data_contrato.getTime();
    
                    // Milissegundos em um dia
                    const MILISSEGUNDOS_POR_DIA = 1000 * 60 * 60 * 24;
    
                    const diasPassados = Math.floor(diffEmMilissegundos / MILISSEGUNDOS_POR_DIA);
    
    
                   // console.log(`CNPJ: ${cnpj}`);
                   // console.log(`Data Contrato (Normalizada): ${data_contrato.toISOString().split('T')[0]}`);
                   // console.log(`Data Atual (Normalizada): ${dataAtual.toISOString().split('T')[0]}`);
                   // console.log(`Dias Permitidos: ${dias_contrato_permitidos}`);
                   // console.log(`Dias Passados: ${diasPassados}`);
    
                    // --- Comparação ---
                    // Verifica se o número de dias passados EXCEDEU o permitido
                    if (diasPassados > dias_contrato_permitidos) {
                        console.log("Status: Contrato Expirado.");
                        /*return {
                            valido: false,
                            diasPassados: diasPassados,
                            diasPermitidos: dias_contrato_permitidos,
                            motivo: "Contrato expirado",
                            tipo_contrato:tipo_contrato
                        };
                        */
                        return res.status(400).json(   {
                                erro:true,
                                tipo_contrato:   tipo_contrato,
                                msg: tipo_contrato === 'T' ? 'Período de teste Expirado!' : "Contrato expirado"  
                                });

                    } else{
                        next();
                    }
                    
                   /* else {
                        console.log("Status: Contrato Válido.");
                        return {
                            valido: true,
                            diasPassados: diasPassados,
                            diasPermitidos: dias_contrato_permitidos
                        };
                    }*/
    
                } else {
                     console.log(`Empresa com CNPJ ${cnpj} não encontrada.`);
                    return { valido: false, motivo: "Empresa não encontrada" };
                }
            } catch (error) {
                console.error(`Erro ao validar contrato para CNPJ ${cnpj}:`, error);
                return { valido: false, motivo: "Erro interno durante a validação" };
            }
        }
     