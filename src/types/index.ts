import { z } from 'zod';

// ============================================
// SCHEMAS DE VALIDAÇÃO (Zod)
// ============================================

export const ParametrosSchema = z.object({
  // Estrutura Mensal
  faturamento: z.number().min(0, 'Faturamento deve ser positivo'),
  folhaEncargos: z.number().min(0, 'Folha deve ser positiva'),
  insumosComCredito: z.number().min(0),
  insumosSemCredito: z.number().min(0),
  comissoesPercentual: z.number().min(0).max(100, 'Comissão máx 100%'),

  // Tributos Atuais (por dentro, em %)
  issIcms: z.number().min(0).max(100),
  pisCofins: z.number().min(0).max(100),

  // Cenário 2027
  cbsEstimada: z.number().min(0).max(100),

  // Cenário 2033 (Regime Pleno)
  ivaDual: z.number().min(0).max(100),
  redutor: z.enum(['0', '30', '60']),

  // Caixa
  prazoMedioDias: z.number().min(0).max(365),
  custoCapitalAnual: z.number().min(0).max(100),
});

export const CarteiraSchema = z.object({
  pjRegular: z.number().min(0).max(100),
  pjSimples: z.number().min(0).max(100),
  pjRedutor: z.number().min(0).max(100),
  b2c: z.number().min(0).max(100),
});

export type Parametros = z.infer<typeof ParametrosSchema>;
export type CarteiraMix = z.infer<typeof CarteiraSchema>;

// ============================================
// INTERFACES DE RESULTADO
// ============================================

export interface ResultadoReprecificacao {
  cenario: 'hoje' | '2027' | 'pleno';
  nota: number;
  precoLiquido: number;
  tributos: number;
  creditos: number;
  folha: number;
  insumos: number;
  comissoes: number;
  sobra: number;
  margemLiquida: number; // %
}

export interface ComparativoReprecificacao {
  hoje: ResultadoReprecificacao;
  cenario2027: ResultadoReprecificacao;
  cenarioPleno: ResultadoReprecificacao;
  precoCongelado: {
    perdaMargem2027: number;
    perdaMargemPleno: number;
  };
  precoManterMargem: {
    novaNota2027: number;
    novaNotaPleno: number;
    variacaoNota2027: number; // %
    variacaoNotaPleno: number; // %
    variacaoLiquido2027: number; // %
    variacaoLiquidoPleno: number; // %
  };
}

export interface ResultadoMarkup {
  custoBruto: number;
  custoLiquido: number;
  creditoTributario: number;
  precoLiquido: number;
  precoNota: number;
  margemReal: number;
}

export interface ResultadoCaixa {
  floatAtual: number;
  splitRetido: number;
  capitalRecompor: number;
  custoAnualReposicao: number;
}

export interface ResultadoCarteira {
  aumentoNecessarioNota: number;
  aumentoSentido: number;
  detalhamento: {
    segmento: string;
    peso: number;
    absorve: number;
    impacto: number;
  }[];
}

// ============================================
// CONSTANTES
// ============================================

export const DEFAULT_PARAMETROS: Parametros = {
  faturamento: 200000,
  folhaEncargos: 110000,
  insumosComCredito: 30000,
  insumosSemCredito: 10000,
  comissoesPercentual: 5,
  issIcms: 5,
  pisCofins: 3.65,
  cbsEstimada: 9.0,
  ivaDual: 28,
  redutor: '30',
  prazoMedioDias: 30,
  custoCapitalAnual: 13.65,
};

export const DEFAULT_CARTEIRA: CarteiraMix = {
  pjRegular: 40,
  pjSimples: 20,
  pjRedutor: 10,
  b2c: 30,
};
