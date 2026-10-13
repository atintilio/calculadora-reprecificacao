import { useMemo } from 'react';
import { useStore } from '../store';
import { calcularReprecificacao } from '../core/taxEngine';
import { Card, Metric, formatCurrency, formatPercent, Disclaimer } from '../components/ui';

export function Modulo2Reprecificacao() {
  const { parametros } = useStore();

  const resultado = useMemo(() => calcularReprecificacao(parametros), [parametros]);

  return (
    <div className="space-y-6">
      <Disclaimer
        text="Simulação de ordem de grandeza. Valores reais dependem da alíquota oficial da CBS (Resolução do Senado) e regulamentação do IBS."
        type="info"
      />

      {/* Parte A: Preço Congelado */}
      <Card title="🔒 Parte A: Preço Congelado (Cliente não paga mais)">
        <p className="text-sm text-gray-600 mb-4">
          Se o preço da nota NÃO mudar, o novo imposto sai da sua margem. Veja o impacto:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 uppercase font-medium">Hoje</p>
            <p className="text-xl font-bold text-gray-800 mt-1">{formatCurrency(resultado.hoje.sobra)}</p>
            <p className="text-xs text-gray-400">{formatPercent(resultado.hoje.margemLiquida)} margem líquida</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 text-center border border-amber-100">
            <p className="text-xs text-amber-600 uppercase font-medium">2027 (Transição)</p>
            <p className="text-xl font-bold text-amber-700 mt-1">{formatCurrency(resultado.cenario2027.sobra)}</p>
            <p className="text-xs text-amber-500">{formatPercent(resultado.cenario2027.margemLiquida)} margem líquida</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center border border-red-100">
            <p className="text-xs text-red-600 uppercase font-medium">Regime Pleno</p>
            <p className="text-xl font-bold text-red-700 mt-1">{formatCurrency(resultado.cenarioPleno.sobra)}</p>
            <p className="text-xs text-red-500">{formatPercent(resultado.cenarioPleno.margemLiquida)} margem líquida</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 border border-red-100 rounded-lg p-4">
            <Metric
              label="Perda Mensal (2027)"
              value={formatCurrency(resultado.precoCongelado.perdaMargem2027)}
              variant="negative"
              sublabel="Se manter preço atual"
            />
          </div>
          <div className="bg-red-50 border border-red-100 rounded-lg p-4">
            <Metric
              label="Perda Mensal (Regime Pleno)"
              value={formatCurrency(resultado.precoCongelado.perdaMargemPleno)}
              variant="negative"
              sublabel="Se manter preço atual"
            />
          </div>
        </div>
      </Card>

      {/* Parte B: Preço para Manter Margem */}
      <Card title="📈 Parte B: Novo Preço para Manter Margem">
        <p className="text-sm text-gray-600 mb-4">
          Qual deve ser o novo preço da nota para que a Sobra em R$ seja igual à de Hoje?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 2027 */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-5">
            <h4 className="font-semibold text-indigo-800 mb-3">Cenário 2027</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Nova Nota:</span>
                <span className="font-bold text-indigo-700">{formatCurrency(resultado.precoManterMargem.novaNota2027)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Variação na Nota:</span>
                <span className={`font-bold ${resultado.precoManterMargem.variacaoNota2027 > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {resultado.precoManterMargem.variacaoNota2027 > 0 ? '+' : ''}{formatPercent(resultado.precoManterMargem.variacaoNota2027)}
                </span>
              </div>
              <div className="border-t border-indigo-200 pt-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Variação no Líquido:</span>
                  <span className={`font-bold ${resultado.precoManterMargem.variacaoLiquido2027 > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {resultado.precoManterMargem.variacaoLiquido2027 > 0 ? '+' : ''}{formatPercent(resultado.precoManterMargem.variacaoLiquido2027)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Base de negociação B2B</p>
              </div>
            </div>
          </div>

          {/* Regime Pleno */}
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-5">
            <h4 className="font-semibold text-purple-800 mb-3">Regime Pleno (2033)</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Nova Nota:</span>
                <span className="font-bold text-purple-700">{formatCurrency(resultado.precoManterMargem.novaNotaPleno)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Variação na Nota:</span>
                <span className={`font-bold ${resultado.precoManterMargem.variacaoNotaPleno > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {resultado.precoManterMargem.variacaoNotaPleno > 0 ? '+' : ''}{formatPercent(resultado.precoManterMargem.variacaoNotaPleno)}
                </span>
              </div>
              <div className="border-t border-purple-200 pt-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Variação no Líquido:</span>
                  <span className={`font-bold ${resultado.precoManterMargem.variacaoLiquidoPleno > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {resultado.precoManterMargem.variacaoLiquidoPleno > 0 ? '+' : ''}{formatPercent(resultado.precoManterMargem.variacaoLiquidoPleno)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Base de negociação B2B</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Detalhamento */}
      <Card title="📋 Detalhamento por Cenário">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Item</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">Hoje</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">2027</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">Regime Pleno</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-2 px-3">Preço Líquido</td>
                <td className="text-right py-2 px-3 font-mono">{formatCurrency(resultado.hoje.precoLiquido)}</td>
                <td className="text-right py-2 px-3 font-mono">{formatCurrency(resultado.cenario2027.precoLiquido)}</td>
                <td className="text-right py-2 px-3 font-mono">{formatCurrency(resultado.cenarioPleno.precoLiquido)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3">Tributos</td>
                <td className="text-right py-2 px-3 font-mono">{formatCurrency(resultado.hoje.tributos)}</td>
                <td className="text-right py-2 px-3 font-mono">{formatCurrency(resultado.cenario2027.tributos)}</td>
                <td className="text-right py-2 px-3 font-mono">{formatCurrency(resultado.cenarioPleno.tributos)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3">Créditos</td>
                <td className="text-right py-2 px-3 font-mono text-green-600">{formatCurrency(resultado.hoje.creditos)}</td>
                <td className="text-right py-2 px-3 font-mono text-green-600">{formatCurrency(resultado.cenario2027.creditos)}</td>
                <td className="text-right py-2 px-3 font-mono text-green-600">{formatCurrency(resultado.cenarioPleno.creditos)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3">Folha + Encargos</td>
                <td className="text-right py-2 px-3 font-mono">{formatCurrency(resultado.hoje.folha)}</td>
                <td className="text-right py-2 px-3 font-mono">{formatCurrency(resultado.cenario2027.folha)}</td>
                <td className="text-right py-2 px-3 font-mono">{formatCurrency(resultado.cenarioPleno.folha)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3">Insumos</td>
                <td className="text-right py-2 px-3 font-mono">{formatCurrency(resultado.hoje.insumos)}</td>
                <td className="text-right py-2 px-3 font-mono">{formatCurrency(resultado.cenario2027.insumos)}</td>
                <td className="text-right py-2 px-3 font-mono">{formatCurrency(resultado.cenarioPleno.insumos)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3">Comissões</td>
                <td className="text-right py-2 px-3 font-mono">{formatCurrency(resultado.hoje.comissoes)}</td>
                <td className="text-right py-2 px-3 font-mono">{formatCurrency(resultado.cenario2027.comissoes)}</td>
                <td className="text-right py-2 px-3 font-mono">{formatCurrency(resultado.cenarioPleno.comissoes)}</td>
              </tr>
              <tr className="font-bold bg-gray-50">
                <td className="py-2 px-3">SOBRA</td>
                <td className="text-right py-2 px-3 font-mono">{formatCurrency(resultado.hoje.sobra)}</td>
                <td className="text-right py-2 px-3 font-mono">{formatCurrency(resultado.cenario2027.sobra)}</td>
                <td className="text-right py-2 px-3 font-mono">{formatCurrency(resultado.cenarioPleno.sobra)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
