/**
 * MÓDULO 3: MARKUP — CONVERSOR DE FORMATO
 * Argus Prime — Reforma Tributária
 * 
 * Converte o formato de precificação "por dentro" (atual)
 * para o formato "por fora" (novo sistema IBS/CBS).
 */

import type { ResultadoMarkup } from '../types';

interface MarkupInput {
  custoBruto: number;
  margemDesejada: number; // % sobre preço líquido
  comissoesPercentual: number; // % sobre TOTAL da nota
  aliquotaCredito: number; // % de crédito sobre insumos
  aliquotaEfetiva: number; // alíquota efetiva do IVA (por fora)
  percentualCredito: number; // quanto do custo gera crédito (0-100%)
}

/**
 * Converte markup do formato "por dentro" para "por fora"
 * 
 * Formato Antigo (Por dentro):
 *   Preco = Custo / [1 - (tributos + comissões + margem)]
 * 
 * Formato Novo (Por fora):
 *   Custo Líquido = Custo - (Custo * %_crédito * alíquota_efetiva)
 *   Preço Líquido = Custo Líquido / [1 - (comissões + margem)]
 *   Preço na Nota = Preço Líquido * (1 + alíquota_efetiva)
 */
export function converterMarkup(input: MarkupInput): ResultadoMarkup {
  const {
    custoBruto,
    margemDesejada,
    comissoesPercentual,
    aliquotaCredito,
    aliquotaEfetiva,
    percentualCredito,
  } = input;

  // Passo 1: Calcular crédito tributário sobre o custo
  const creditoTributario = custoBruto * (percentualCredito / 100) * (aliquotaCredito / 100);
  
  // Passo 2: Custo líquido (já abatido o crédito)
  const custoLiquido = custoBruto - creditoTributario;
  
  // Passo 3: Preço líquido (antes do imposto por fora)
  // Preço Líquido = Custo Líquido / [1 - (comissões + margem)]
  // ATENÇÃO: comissões incidem sobre o TOTAL da nota, não sobre o líquido
  // Para resolver: Preço na Nota = Preço Líquido * (1 + alíquota)
  // Comissões = Preço na Nota * (comissões/100) = Preço Líquido * (1 + alíquota) * (comissões/100)
  // 
  // Equação: Preço Líquido = Custo Líquido + Comissões + Margem
  // Preço Líquido = Custo Líquido + Preço Líquido * (1 + aliquota) * (comissoes/100) + Preço Líquido * (margem/100)
  // Preço Líquido * [1 - (1 + aliquota) * (comissoes/100) - (margem/100)] = Custo Líquido
  
  const fatorComissao = (1 + aliquotaEfetiva / 100) * (comissoesPercentual / 100);
  const fatorMargem = margemDesejada / 100;
  const denominador = 1 - fatorComissao - fatorMargem;
  
  if (denominador <= 0) {
    return {
      custoBruto,
      custoLiquido,
      creditoTributario,
      precoLiquido: 0,
      precoNota: 0,
      margemReal: 0,
    };
  }
  
  const precoLiquido = custoLiquido / denominador;
  
  // Passo 4: Preço na nota (com imposto por fora)
  const precoNota = precoLiquido * (1 + aliquotaEfetiva / 100);
  
  // Passo 5: Margem real em R$
  const comissoesValor = precoNota * (comissoesPercentual / 100);
  const margemRealValor = precoLiquido - custoLiquido - comissoesValor;
  const margemReal = precoLiquido > 0 ? (margemRealValor / precoLiquido) * 100 : 0;
  
  return {
    custoBruto,
    custoLiquido,
    creditoTributario,
    precoLiquido,
    precoNota,
    margemReal,
  };
}

/**
 * Calcula o markup antigo (por dentro) para comparação
 */
export function calcularMarkupAntigo(
  custoBruto: number,
  tributosPorDentro: number, // %
  comissoesPercentual: number, // %
  margemDesejada: number // %
): number {
  const denominador = 1 - (tributosPorDentro / 100) - (comissoesPercentual / 100) - (margemDesejada / 100);
  if (denominador <= 0) return 0;
  return custoBruto / denominador;
}
