/**
 * MOTOR DE CÁLCULO FISCAL — ARGUS PRIME
 * Funções puras para simulação da Reforma Tributária
 * 
 * AVISO: Ferramenta de simulação e ordem de grandeza.
 * NÃO é software de apuração fiscal oficial.
 */

import type { Parametros, ComparativoReprecificacao, ResultadoReprecificacao } from '../types';

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Converte alíquota "por dentro" para "por fora"
 * Fórmula: t_fora = t_dentro / (1 - t_dentro)
 */
export function converterPorDentroParaFora(aliquotaPorDentro: number): number {
  if (aliquotaPorDentro >= 1) return Infinity;
  return aliquotaPorDentro / (1 - aliquotaPorDentro);
}

/**
 * Converte alíquota "por fora" para "por dentro"
 * Fórmula: t_dentro = t_fora / (1 + t_fora)
 */
export function converterPorForaParaDentro(aliquotaPorFora: number): number {
  return aliquotaPorFora / (1 + aliquotaPorFora);
}

/**
 * Calcula a alíquota efetiva do IVA Dual considerando o redutor
 * Fórmula: Alíquota Efetiva = IVA * (1 - redutor)
 */
export function calcularAliquotaEfetiva(ivaDual: number, redutor: string): number {
  const redutorNum = parseInt(redutor) / 100;
  return ivaDual * (1 - redutorNum);
}

// ============================================
// CÁLCULO DE TRIBUTOS POR CENÁRIO
// ============================================

interface TributosCenario {
  aliquotaPorFora: number;
  tributoTotal: number;
  creditos: number;
}

/**
 * Cenário HOJE: ISS/ICMS + PIS/Cofins (por dentro)
 */
function calcularTributosHoje(params: Parametros): TributosCenario {
  const issIcmsDecimal = params.issIcms / 100;
  const pisCofinsDecimal = params.pisCofins / 100;
  
  // Alíquota combinada por dentro
  const aliquotaCombinadaDentro = issIcmsDecimal + pisCofinsDecimal;
  // Converter para por fora
  const aliquotaPorFora = converterPorDentroParaFora(aliquotaCombinadaDentro);
  
  const precoLiquido = params.faturamento / (1 + aliquotaPorFora);
  const tributoTotal = precoLiquido * aliquotaPorFora;
  
  // Créditos sobre insumos com crédito (mesma alíquota por dentro)
  const creditos = params.insumosComCredito * aliquotaCombinadaDentro;
  
  return { aliquotaPorFora, tributoTotal, creditos };
}

/**
 * Cenário 2027: CBS + ISS/ICMS mantido
 */
function calcularTributos2027(params: Parametros): TributosCenario {
  const issIcmsDecimal = params.issIcms / 100;
  const cbsDecimal = params.cbsEstimada / 100;
  
  // CBS já é por fora (formato IBS/CBS)
  // ISS/ICMS ainda por dentro
  const issIcmsFora = converterPorDentroParaFora(issIcmsDecimal);
  
  // Alíquota total por fora (aproximação: soma das por fora)
  const aliquotaPorFora = cbsDecimal + issIcmsFora;
  
  const precoLiquido = params.faturamento / (1 + aliquotaPorFora);
  const tributoTotal = precoLiquido * aliquotaPorFora;
  
  // Créditos CBS sobre insumos
  const creditosCBS = params.insumosComCredito * cbsDecimal;
  // Créditos ISS/ICMS sobre insumos (mantido)
  const creditosISS = params.insumosComCredito * issIcmsDecimal;
  const creditos = creditosCBS + creditosISS;
  
  return { aliquotaPorFora, tributoTotal, creditos };
}

/**
 * Cenário REGIME PLENO (2033): IBS + CBS (IVA Dual)
 */
function calcularTributosPleno(params: Parametros): TributosCenario {
  const aliquotaEfetiva = calcularAliquotaEfetiva(params.ivaDual, params.redutor) / 100;
  
  // IVA Dual é por fora
  const aliquotaPorFora = aliquotaEfetiva;
  
  const precoLiquido = params.faturamento / (1 + aliquotaPorFora);
  const tributoTotal = precoLiquido * aliquotaPorFora;
  
  // Créditos sobre insumos com crédito
  const creditos = params.insumosComCredito * aliquotaEfetiva;
  
  return { aliquotaPorFora, tributoTotal, creditos };
}

// ============================================
// CÁLCULO COMPLETO DE REPRECIFICAÇÃO
// ============================================

function calcularSobra(
  params: Parametros,
  precoLiquido: number,
  tributos: number,
  creditos: number
): number {
  const comissoesValor = params.faturamento * (params.comissoesPercentual / 100);
  const sobra = precoLiquido + creditos - tributos - params.folhaEncargos - params.insumosComCredito - params.insumosSemCredito - comissoesValor;
  return sobra;
}

function calcularResultadoCenario(
  params: Parametros,
  nota: number,
  tributos: TributosCenario,
  cenario: 'hoje' | '2027' | 'pleno'
): ResultadoReprecificacao {
  const precoLiquido = nota / (1 + tributos.aliquotaPorFora);
  const comissoesValor = nota * (params.comissoesPercentual / 100);
  const sobra = precoLiquido + tributos.creditos - tributos.tributoTotal - params.folhaEncargos - params.insumosComCredito - params.insumosSemCredito - comissoesValor;
  const margemLiquida = precoLiquido > 0 ? (sobra / precoLiquido) * 100 : 0;
  
  return {
    cenario,
    nota,
    precoLiquido,
    tributos: tributos.tributoTotal,
    creditos: tributos.creditos,
    folha: params.folhaEncargos,
    insumos: params.insumosComCredito + params.insumosSemCredito,
    comissoes: comissoesValor,
    sobra,
    margemLiquida,
  };
}

/**
 * Solver: Encontra a nova nota para manter a mesma sobra em R$
 * Usa método de bisseção para convergência
 */
function solverNovaNota(
  params: Parametros,
  sobraAlvo: number,
  tributos: TributosCenario
): number {
  let low = 0;
  let high = params.faturamento * 3; // Limite superior generoso
  
  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const precoLiquido = mid / (1 + tributos.aliquotaPorFora);
    const comissoesValor = mid * (params.comissoesPercentual / 100);
    const sobra = precoLiquido + tributos.creditos - tributos.tributoTotal - params.folhaEncargos - params.insumosComCredito - params.insumosSemCredito - comissoesValor;
    
    // Ajustar créditos proporcionalmente ao novo faturamento
    // (insumos podem variar proporcionalmente)
    
    if (Math.abs(sobra - sobraAlvo) < 0.01) {
      return mid;
    }
    
    if (sobra < sobraAlvo) {
      low = mid;
    } else {
      high = mid;
    }
  }
  
  return (low + high) / 2;
}

/**
 * FUNÇÃO PRINCIPAL: Calcula o comparativo completo de reprecificação
 */
export function calcularReprecificacao(params: Parametros): ComparativoReprecificacao {
  const tributosHoje = calcularTributosHoje(params);
  const tributos2027 = calcularTributos2027(params);
  const tributosPleno = calcularTributosPleno(params);
  
  // Resultados com nota atual
  const hoje = calcularResultadoCenario(params, params.faturamento, tributosHoje, 'hoje');
  const cenario2027 = calcularResultadoCenario(params, params.faturamento, tributos2027, '2027');
  const cenarioPleno = calcularResultadoCenario(params, params.faturamento, tributosPleno, 'pleno');
  
  // Preço congelado: perda de margem
  const perdaMargem2027 = cenario2027.sobra - hoje.sobra;
  const perdaMargemPleno = cenarioPleno.sobra - hoje.sobra;
  
  // Preço para manter margem (solver)
  const novaNota2027 = solverNovaNota(params, hoje.sobra, tributos2027);
  const novaNotaPleno = solverNovaNota(params, hoje.sobra, tributosPleno);
  
  const variacaoNota2027 = ((novaNota2027 - params.faturamento) / params.faturamento) * 100;
  const variacaoNotaPleno = ((novaNotaPleno - params.faturamento) / params.faturamento) * 100;
  
  const precoLiquidoHoje = hoje.precoLiquido;
  const precoLiquido2027 = novaNota2027 / (1 + tributos2027.aliquotaPorFora);
  const precoLiquidoPleno = novaNotaPleno / (1 + tributosPleno.aliquotaPorFora);
  
  const variacaoLiquido2027 = ((precoLiquido2027 - precoLiquidoHoje) / precoLiquidoHoje) * 100;
  const variacaoLiquidoPleno = ((precoLiquidoPleno - precoLiquidoHoje) / precoLiquidoHoje) * 100;
  
  return {
    hoje: { ...hoje, cenario: 'hoje' },
    cenario2027: { ...cenario2027, cenario: '2027' },
    cenarioPleno: { ...cenarioPleno, cenario: 'pleno' },
    precoCongelado: {
      perdaMargem2027,
      perdaMargemPleno,
    },
    precoManterMargem: {
      novaNota2027,
      novaNotaPleno,
      variacaoNota2027,
      variacaoNotaPleno,
      variacaoLiquido2027,
      variacaoLiquidoPleno,
    },
  };
}
