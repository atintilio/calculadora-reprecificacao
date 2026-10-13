/**
 * MÓDULO 5: CARTEIRA — ELASTICIDADE E REPASSE
 * Argus Prime — Reforma Tributária
 * 
 * Analisa o impacto real do aumento de preço considerando
 * a composição da carteira de clientes.
 */

import type { CarteiraMix, ResultadoCarteira } from '../types';

interface SegmentoConfig {
  nome: string;
  recupera: number; // % do aumento que consegue repassar
  absorve: number;  // % do aumento que absorve (100 - recupera)
}

const SEGMENTOS: Record<keyof CarteiraMix, SegmentoConfig> = {
  pjRegular: { nome: 'PJ Regular', recupera: 100, absorve: 0 },
  pjSimples: { nome: 'PJ Simples', recupera: 30, absorve: 70 },
  pjRedutor: { nome: 'PJ com Redutor', recupera: 50, absorve: 50 },
  b2c: { nome: 'Consumidor Final (B2C)', recupera: 0, absorve: 100 },
};

/**
 * Analisa o impacto do repasse de preço na carteira de clientes
 * 
 * @param carteira Mix percentual da carteira (deve somar 100%)
 * @param aumentoNecessarioNota % de aumento necessário na nota (do Módulo 2)
 */
export function analisarCarteira(
  carteira: CarteiraMix,
  aumentoNecessarioNota: number
): ResultadoCarteira {
  // Validar se a carteira soma 100%
  const somaCarteira = carteira.pjRegular + carteira.pjSimples + carteira.pjRedutor + carteira.b2c;
  const fatorNormalizacao = somaCarteira > 0 ? 100 / somaCarteira : 1;
  
  const carteiraNormalizada: CarteiraMix = {
    pjRegular: carteira.pjRegular * fatorNormalizacao,
    pjSimples: carteira.pjSimples * fatorNormalizacao,
    pjRedutor: carteira.pjRedutor * fatorNormalizacao,
    b2c: carteira.b2c * fatorNormalizacao,
  };
  
  const detalhamento = (Object.keys(SEGMENTOS) as (keyof CarteiraMix)[]).map(key => {
    const config = SEGMENTOS[key];
    const peso = carteiraNormalizada[key];
    const impacto = aumentoNecessarioNota * (config.absorve / 100);
    
    return {
      segmento: config.nome,
      peso,
      absorve: config.absorve,
      impacto,
    };
  });
  
  // Aumento sentido = média ponderada do que o cliente absorve
  // Quanto maior o "absorve", mais o cliente sente o aumento no bolso
  // (pois não consegue recuperar como crédito)
  const aumentoSentido = detalhamento.reduce((acc, d) => {
    return acc + (d.peso / 100) * d.impacto;
  }, 0);
  
  return {
    aumentoNecessarioNota,
    aumentoSentido,
    detalhamento,
  };
}
