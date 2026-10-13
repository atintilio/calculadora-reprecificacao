# 🏛️ Calculadora de Reprecificação — Argos Prime

> **Ferramenta de simulação e ordem de grandeza** para a Reforma Tributária Brasileira (LC 214/2025).  
> Integração planejada com a plataforma **Mila** via Tool Calling.

---

## 📋 Sumário

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Stack Tecnológica](#stack-tecnológica)
- [Módulos Funcionais](#módulos-funcionais)
- [Motor de Cálculo](#motor-de-cálculo)
- [Integração Mila (Tool Calling)](#integração-mila-tool-calling)
- [Disclaimers e Compliance](#disclaimers-e-compliance)
- [Instruções de Uso](#instruções-de-uso)
- [Roadmap](#roadmap)

---

## 🎯 Visão Geral

A **Calculadora de Reprecificação** é uma ferramenta da **Argos Prime** que permite a empresas simular o impacto da Reforma Tributária em:

- **Margem de lucro** (Módulo 2)
- **Precificação** (Módulo 3)
- **Fluxo de caixa / Split Payment** (Módulo 4)
- **Elasticidade de repasse à carteira** (Módulo 5)

O usuário preenche apenas os **Parâmetros** (Módulo 1); todos os demais dashboards são **reativos** e recalculados em tempo real.

### ⚠️ Natureza da Ferramenta

> Esta é uma ferramenta de **simulação e ordem de grandeza**.  
> **NÃO** é um software de apuração fiscal oficial.  
> Não substitui consultoria contábil ou fiscal especializada.

---

## 🏗️ Arquitetura

```
src/
├── core/                        # Motor de cálculo (funções puras)
│   ├── taxEngine.ts             # Módulo 2: Reprecificação + Solver
│   ├── markup.ts                # Módulo 3: Conversor por dentro → por fora
│   ├── cashflow.ts              # Módulo 4: Split Payment / Float
│   └── portfolio.ts             # Módulo 5: Elasticidade da Carteira
│
├── types/
│   └── index.ts                 # Schemas Zod + Interfaces + Defaults
│
├── store/
│   └── index.ts                 # Zustand (state reativo global)
│
├── components/
│   └── ui.tsx                   # Design System (Card, Metric, Tooltip, etc.)
│
├── modules/
│   ├── Modulo1Parametros.tsx    # Inputs com validação
│   ├── Modulo2Reprecificacao.tsx # Comparativo 3 cenários
│   ├── Modulo3Markup.tsx        # Conversor de formato
│   ├── Modulo4Caixa.tsx         # Impacto do Split Payment
│   └── Modulo5Carteira.tsx      # Matriz de elasticidade
│
├── App.tsx                      # Entry point com navegação por tabs
├── main.tsx                     # Bootstrap React
└── index.css                    # Tailwind CSS
```

### Princípios de Design

| Princípio | Implementação |
|-----------|---------------|
| **Separação de responsabilidades** | Motor de cálculo isolado em `src/core/` |
| **Imutabilidade** | Zustand + funções puras |
| **Performance** | `useMemo` para recálculo em tempo real |
| **Validação** | Zod schemas em todos os inputs |
| **Testabilidade** | Funções puras sem side effects |

---

## 💻 Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| **Framework** | React 18 + TypeScript | Ecossistema maduro, type safety |
| **Build** | Vite 6 | Hot reload instantâneo, bundle otimizado |
| **Estilização** | Tailwind CSS 4 | Utility-first, sem CSS externo |
| **State** | Zustand | Leve (<1KB), reativo, sem boilerplate |
| **Validação** | Zod | Schemas tipados, integração TS nativa |
| **Cálculo** | Funções puras TS | Testáveis, isoladas, sem dependências |

---

## 📊 Módulos Funcionais

### Módulo 1: Parâmetros (Inputs)

O usuário preenche a estrutura mensal da empresa e as premissas tributárias.

| Campo | Default | Validação |
|-------|---------|-----------|
| Faturamento Mensal | R$ 200.000 | ≥ 0 |
| Folha + Encargos | R$ 110.000 | ≥ 0 |
| Insumos com Crédito | R$ 30.000 | ≥ 0 |
| Insumos sem Crédito | R$ 10.000 | ≥ 0 |
| Comissões (% nota) | 5% | 0–100% |
| ISS / ICMS | 5% | 0–50% |
| PIS / Cofins | 3,65% | 0–20% |
| CBS Estimada (2027) | 9,00% | 0–30% |
| IVA Dual (2033) | 28% | 0–50% |
| Redutor | 30% | 0%, 30% ou 60% |
| Prazo Médio (dias) | 30 | 0–365 |
| Custo de Capital (% a.a.) | 13,65% | 0–100% |

---

### Módulo 2: Reprecificação (Impacto na Margem)

**Comparativo: Hoje vs 2027 vs Regime Pleno**

#### Parte A — Preço Congelado
O cliente não paga mais nada. O imposto novo sai da margem.

```
Preço Líquido = Nota / (1 + alíquota_por_fora)
Sobra = Preço_Líquido + Créditos - Tributos - Folha - Insumos - Comissões
```

#### Parte B — Preço para Manter Margem
Solver por bisseção encontra a nova nota que mantém a sobra em R$ igual à de Hoje.

```
Variação na Nota = (Nova_Nota - Nota_Atual) / Nota_Atual × 100
Variação no Líquido = (Novo_Líquido - Líquido_Atual) / Líquido_Atual × 100
```

---

### Módulo 3: Markup (Conversor de Formato)

Converte a precificação do formato **"por dentro"** (atual) para **"por fora"** (novo sistema IBS/CBS).

#### Formato Antigo (Por dentro)
```
Preço = Custo / [1 - (tributos + comissões + margem)]
```

#### Formato Novo (Por fora)
```
Custo Líquido = Custo - (Custo × %_crédito × alíquota_efetiva)
Preço Líquido = Custo_Líquido / [1 - (comissões × (1 + alíquota) + margem)]
Preço na Nota = Preço_Líquido × (1 + alíquota_efetiva)
```

#### 🪤 Armadilhas
1. Manter a mesma margem % sobre base líquida menor **reduz a margem em R$**.
2. Comissões incidem sobre o **TOTAL da nota**, não sobre o líquido.

---

### Módulo 4: Caixa (Split Payment)

Quantifica o float que desaparece com a retenção na fonte.

```
Float Atual = (ISS/ICMS + PIS/Cofins) × Prazo_médio_em_meses
Split Retido = Débito_da_nota - Créditos
Capital a Recompor = Split_Retido × Prazo_médio
Custo Anual = Capital_Recompor × Custo_de_Capital_Anual
```

> **Nota:** Em 2027 o split payment é **facultativo** e restrito a B2B. A obrigatoriedade é esperada para 2028+.

---

### Módulo 5: Carteira (Elasticidade e Repasse)

Matriz de composição da carteira de clientes:

| Segmento | Recupera Crédito | Absorve Aumento |
|----------|-----------------|-----------------|
| PJ Regular | 100% | 0% |
| PJ Simples | 30% | 70% |
| PJ com Redutor | 50% | 50% |
| Consumidor Final (B2C) | 0% | 100% |

```
Aumento_Sentido = Σ (peso_segmento × aumento_necessário × %_absorve)
```

A carteira é automaticamente normalizada se não somar 100%.

---

## 🧮 Motor de Cálculo

### Conversão "Por Dentro" → "Por Fora"

```typescript
// Alíquota por dentro → por fora
aliquota_fora = aliquota_dentro / (1 - aliquota_dentro)

// Exemplo: ISS 5% + PIS/Cofins 3,65% = 8,65% por dentro
// Equivalente por fora: 8,65 / (1 - 0,0865) = 9,47%
```

### Alíquota Efetiva (com Redutor)

```typescript
aliquota_efetiva = IVA_Dual × (1 - redutor)
// Exemplo: 28% × (1 - 0,30) = 19,6%
```

### Solver de Nova Nota (Bisseção)

O solver encontra iterativamente o valor da nota que equaliza a sobra do cenário futuro com a sobra atual. Convergência em ~100 iterações com precisão de R$ 0,01.

---

## 🤖 Integração Mila (Tool Calling)

O motor de cálculo é uma biblioteca isolada (`src/core/`) preparada para ser consumida pela **Mila** via Function Calling.

### Tools Disponíveis

| Tool | Descrição | Input |
|------|-----------|-------|
| `argos_simulate_margin_impact` | Retorna perda de margem se preço congelado | `Parametros` |
| `argos_calculate_required_price` | Retorna novo preço para manter margem | `target_margin, Parametros` |
| `argos_convert_markup` | Converte preço antigo para novo | `cost, margin, credit_rate` |
| `argos_analyze_cashflow_split` | Retorna custo anual do split payment | `Parametros` |
| `argos_evaluate_portfolio_elasticity` | Retorna impacto real na carteira | `CarteiraMix, price_increase` |

### Exemplo de Insight Conversacional

> *"Notei que 40% da sua carteira é B2C. Se você tentar repassar os 4.6% de aumento da nota, eles absorverão o impacto integralmente, o que pode reduzir seu volume de vendas."*

---

## ⚖️ Disclaimers e Compliance

### Exibidos na UI

1. **Módulo 1:** *"A alíquota oficial da CBS depende de Resolução do Senado (Dez/2026) e cálculo do TCU (Out/2026). A opção/cancelamento do Simples vence antes da alíquota oficial existir."*

2. **Módulo 2:** *"Simulação de ordem de grandeza. Valores reais dependem da alíquota oficial da CBS e regulamentação do IBS."*

3. **Módulo 4:** *"Em 2027 o split payment é FACULTATIVO e restrito a B2B. A obrigatoriedade é esperada para 2028+."*

4. **Módulo 5:** *"A elasticidade de repasse varia por setor e região. Os percentuais são estimativas."*

5. **Footer:** *"Ferramenta de simulação e ordem de grandeza. Não substitui consultoria fiscal especializada."*

### Regras de Marca

- ✅ Toda referência usa APENAS a marca **Argos Prime**
- ❌ Zero menção a Contclaro, Contabilidade ou terceiros
- ✅ Disclaimer legal em todas as telas de resultado

---

## 🚀 Instruções de Uso

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

### Build de Produção

```bash
npm run build
```

O bundle gerado em `dist/` é estático e pode ser servido por qualquer CDN ou hosting.

### Estrutura do Bundle

| Arquivo | Tamanho | Gzip |
|---------|---------|------|
| `index.html` | 1,16 KB | 0,59 KB |
| `index.css` | 24,12 KB | 5,13 KB |
| `index.js` | 252,33 KB | 76,28 KB |

---

## 🗺️ Roadmap

### Fase 1 — ✅ Concluído
- [x] Scaffold React + Vite + Tailwind
- [x] Motor de cálculo (4 módulos)
- [x] UI reativa com Zustand
- [x] Validação com Zod
- [x] Design system Argos Prime
- [x] Disclaimers legais

### Fase 2 — Em Planejamento
- [ ] Exportar relatórios em PDF
- [ ] Salvar cenários comparativos
- [ ] Modo escuro
- [ ] Testes unitários (Vitest)

### Fase 3 — Integração Mila
- [ ] Adapter `packages/mila-adapter`
- [ ] Contracts de Tool Calling
- [ ] Insights conversacionais automáticos
- [ ] Webhook para notificações

### Fase 4 — Compliance
- [ ] Auditoria de marca (zero terceiros)
- [ ] LGPD (consentimento de dados)
- [ ] Acessibilidade (WCAG 2.1 AA)
- [ ] Performance (Lighthouse 95+)

---

## 📄 Licença

© 2025 **Argos Prime**. Todos os direitos reservados.

---

> *Documento gerado pela Argos Prime — Arquitetura de Software*  
> *Versão: 1.0.0 | Última atualização: 2025*
