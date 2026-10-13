/**
 * MÓDULO 4: CAIXA — SPLIT PAYMENT
 * Argus Prime — Reforma Tributária
 * 
 * Quantifica o float que desaparece com o split payment.
 */

import type { Parametros, ResultadoCaixa } from '../types';
import { converterPorDentroParaFora } from './taxEngine';

/**
 * Calcula o impacto do split payment no fluxo de caixa
 */
export function calcularImpactoCaixa(params: Parametros): ResultadoCaixa {
  const { faturamento, issIcms, pisCofins, cbsEstimada, ivaDual, redutor, prazoMedioDias, custoCapitalAnual } = params;
  
  // === FLOAT ATUAL ===
  // Tributos que a empresa "segura" antes de recolher
  const issIcmsDecimal = issIcms / 100;
  const pisCofinsDecimal = pisCofins / 100;
  const aliquotaCombinadaDentro = issIcmsDecimal + pisCofinsDecimal;
  const aliquotaPorFora = converterPorDentroParaFora(aliquotaCombinadaDentro);
  const precoLiquido = faturamento / (1 + aliquotaPorFora);
  const tributosAtuais = precoLiquido * aliquotaPorFora;
  
  // Float = tributos * prazo médio (em meses)
  const prazoMeses = prazoMedioDias / 30;
  const floatAtual = tributosAtuais * prazoMeses;
  
  // === SPLIT PAYMENT (CBS/IBS retido na fonte) ===
  // No novo sistema, o imposto é retido no momento da transação
  // O valor retido é o débito líquido do crédito
  
  // Cenário 2027: CBS retida
  const cbsDecimal = cbsEstimada / 100;
  const debitoCBS = faturamento * cbsDecimal / (1 + cbsDecimal); // por fora
  const creditoCBS = params.insumosComCredito * cbsDecimal;
  const splitRetido2027 = Math.max(0, debitoCBS - creditoCBS);
  
  // Cenário Pleno: IBS+CBS retido
  const aliquotaEfetiva = (ivaDual * (1 - parseInt(redutor) / 100)) / 100;
  const debitoPleno = faturamento * aliquotaEfetiva / (1 + aliquotaEfetiva);
  const creditoPleno = params.insumosComCredito * aliquotaEfetiva;
  const splitRetidoPleno = Math.max(0, debitoPleno - creditoPleno);
  
  // Usar o maior impacto (regime pleno)
  const splitRetido = Math.max(splitRetido2027, splitRetidoPleno);
  
  // === CUSTO DE REPOSIÇÃO ===
  // Capital que a empresa precisa recompor (pois perdeu o float)
  const capitalRecompor = splitRetido * prazoMeses;
  
  // Custo anual de reposição
  const custoAnualReposicao = capitalRecompor * (custoCapitalAnual / 100);
  
  return {
    floatAtual,
    splitRetido,
    capitalRecompor,
    custoAnualReposicao,
  };
}
