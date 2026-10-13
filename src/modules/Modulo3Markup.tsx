import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { converterMarkup, calcularMarkupAntigo } from '../core/markup';
import { Card, InputField, formatCurrency, formatPercent, Tooltip, Disclaimer } from '../components/ui';

export function Modulo3Markup() {
  const { parametros } = useStore();
  
  const [custoBruto, setCustoBruto] = useState(1000);
  const [margemDesejada, setMargemDesejada] = useState(20);
  const [comissoesMarkup, setComissoesMarkup] = useState(5);
  const [percentualCredito, setPercentualCredito] = useState(60);

  const aliquotaEfetiva = parametros.ivaDual * (1 - parseInt(parametros.redutor) / 100);
  const tributosPorDentro = parametros.issIcms + parametros.pisCofins;

  const resultadoNovo = useMemo(() => converterMarkup({
    custoBruto,
    margemDesejada,
    comissoesPercentual: comissoesMarkup,
    aliquotaCredito: aliquotaEfetiva,
    aliquotaEfetiva,
    percentualCredito,
  }), [custoBruto, margemDesejada, comissoesMarkup, aliquotaEfetiva, percentualCredito]);

  const precoAntigo = useMemo(() => calcularMarkupAntigo(
    custoBruto,
    tributosPorDentro,
    comissoesMarkup,
    margemDesejada
  ), [custoBruto, tributosPorDentro, comissoesMarkup, margemDesejada]);

  const variacaoPreco = precoAntigo > 0 ? ((resultadoNovo.precoNota - precoAntigo) / precoAntigo) * 100 : 0;

  return (
    <div className="space-y-6">
      <Disclaimer
        text="Ferramenta de conversão de formato de precificação. Comissões incidem sobre o TOTAL da nota, não sobre o líquido."
        type="info"
      />

      {/* Armadilhas */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h4 className="font-semibold text-amber-800 mb-2">🪤 Armadilhas Argus Prime</h4>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex items-start gap-2">
            <Tooltip text="Se sua margem é 20% sobre R$100 de base líquida, ao mudar para uma base menor (ex: R$80), a margem em R$ cai de R$20 para R$16.">
              <span className="cursor-help">1️⃣</span>
            </Tooltip>
            <span>Manter a mesma margem % sobre base líquida menor reduz a margem em R$.</span>
          </li>
          <li className="flex items-start gap-2">
            <Tooltip text="No formato por fora, a comissão é calculada sobre o preço COM imposto. Isso aumenta o custo real da comissão.">
              <span className="cursor-help">2️⃣</span>
            </Tooltip>
            <span>Comissões incidem sobre o TOTAL da nota, não sobre o líquido.</span>
          </li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <Card title="🔧 Parâmetros do Produto/Serviço">
          <div className="space-y-4">
            <InputField
              label="Custo Bruto do Produto"
              value={custoBruto}
              onChange={setCustoBruto}
              prefix="R$"
              tooltip="Custo total do produto ou serviço antes de créditos"
              step={10}
            />
            <InputField
              label="Margem Desejada (% sobre líquido)"
              value={margemDesejada}
              onChange={setMargemDesejada}
              suffix="%"
              tooltip="Margem desejada sobre o preço líquido (sem imposto)"
            />
            <InputField
              label="Comissões (% sobre nota total)"
              value={comissoesMarkup}
              onChange={setComissoesMarkup}
              suffix="%"
              tooltip="Comissão calculada sobre o preço total da nota, incluindo imposto"
            />
            <InputField
              label="% do Custo que gera Crédito"
              value={percentualCredito}
              onChange={setPercentualCredito}
              suffix="%"
              tooltip="Quanto do custo bruto gera crédito tributário (ex: 60% se parte é folha)"
              max={100}
            />
          </div>
        </Card>

        {/* Resultado */}
        <Card title="📊 Resultado da Conversão">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 uppercase">Preço Atual (Por Dentro)</p>
                <p className="text-lg font-bold text-gray-800">{formatCurrency(precoAntigo)}</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-3 text-center">
                <p className="text-xs text-indigo-600 uppercase">Preço Novo (Por Fora)</p>
                <p className="text-lg font-bold text-indigo-700">{formatCurrency(resultadoNovo.precoNota)}</p>
              </div>
            </div>

            <div className={`text-center p-3 rounded-lg ${variacaoPreco > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
              <p className="text-sm text-gray-600">Variação no Preço Final</p>
              <p className={`text-2xl font-bold ${variacaoPreco > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {variacaoPreco > 0 ? '+' : ''}{formatPercent(variacaoPreco)}
              </p>
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Custo Bruto:</span>
                <span className="font-mono">{formatCurrency(resultadoNovo.custoBruto)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">(-) Crédito Tributário:</span>
                <span className="font-mono text-green-600">-{formatCurrency(resultadoNovo.creditoTributario)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-gray-600">= Custo Líquido:</span>
                <span className="font-mono">{formatCurrency(resultadoNovo.custoLiquido)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Preço Líquido (s/ imposto):</span>
                <span className="font-mono">{formatCurrency(resultadoNovo.precoLiquido)}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span className="text-gray-800">Preço na Nota:</span>
                <span className="font-mono text-indigo-700">{formatCurrency(resultadoNovo.precoNota)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Margem Real (%):</span>
                <span className="font-mono">{formatPercent(resultadoNovo.margemReal)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
