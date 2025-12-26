
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

export const analyzeFinancials = async (transactions: Transaction[], competencia: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const dataSummary = JSON.stringify(transactions.map(t => ({
      plano: t.plano,
      total: t.total,
      mensalidade: t.mensalidade,
      copart: t.coparticipacao,
      uti: t.uti,
      extra: t.extra,
      status: t.status
    })));

    const prompt = `
      Atue como um auditor financeiro. Analise os dados da competência: ${competencia}.
      Dados Resumidos: ${dataSummary}
      Gere um relatório em Markdown focando na receita total, impacto de coparticipação/UTI/Extra e status de pagamentos.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Não foi possível gerar a análise.";
  } catch (error) {
    return "Erro ao conectar com o serviço de IA.";
  }
};

export const parseImportDataInChunks = async (
  csvText: string, 
  targetCompetencia: string,
  onProgress: (current: number, total: number) => void
): Promise<Omit<Transaction, 'id' | 'dataLancamento'>[]> => {
    const lines = csvText.split('\n').filter(line => line.trim() !== '' && !line.startsWith(';;;'));
    const header = lines[0];
    const dataLines = lines.slice(1);
    const chunkSize = 40; // Tamanho ideal para não estourar o limite de tokens de saída da IA
    const totalChunks = Math.ceil(dataLines.length / chunkSize);
    let allParsedData: Omit<Transaction, 'id' | 'dataLancamento'>[] = [];

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = start + chunkSize;
        const chunk = dataLines.slice(start, end).join('\n');
        
        onProgress(i + 1, totalChunks);

        const prompt = `
          Converta estas linhas de CSV para JSON seguindo estritamente o esquema fornecido.
          A competência alvo é: "${targetCompetencia}".
          
          Regras de Conversão:
          1. Separador do CSV: ";" (ponto e vírgula).
          2. Números: No CSV estão como "1.234,56" ou "85,06". Converta para float (ex: 1234.56).
          3. Símbolo "-": Significa valor 0.
          4. Se o campo TOTAL estiver vazio ou for "-", calcule: MENSALIDADE + COPARTICIPACAO + EXTRA + UTI + AJUSTE.
          5. Coluna "NOME": Mantenha em MAIÚSCULAS.
          6. Ignore linhas que sejam apenas totais de rodapé.

          CSV a processar:
          Cabeçalho: ${header}
          Dados:
          ${chunk}
        `;

        try {
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                competencia: { type: Type.STRING },
                                plano: { type: Type.STRING },
                                modalidade: { type: Type.STRING },
                                matricula: { type: Type.STRING },
                                cpf: { type: Type.STRING },
                                codigo: { type: Type.STRING },
                                nome: { type: Type.STRING },
                                mensalidade: { type: Type.NUMBER },
                                coparticipacao: { type: Type.NUMBER },
                                extra: { type: Type.NUMBER },
                                uti: { type: Type.NUMBER },
                                ajuste: { type: Type.NUMBER },
                                total: { type: Type.NUMBER },
                                status: { type: Type.STRING, enum: ['PAGO', 'PENDENTE', 'CANCELADO'] },
                                observacao: { type: Type.STRING }
                            },
                            required: ['nome', 'total', 'plano', 'matricula']
                        }
                    }
                }
            });

            const parsedBatch = JSON.parse(response.text || "[]");
            allParsedData = [...allParsedData, ...parsedBatch];
        } catch (e) {
            console.error(`Erro no lote ${i + 1}:`, e);
            // Continua para o próximo lote em caso de erro individual
        }
    }

    return allParsedData;
}
