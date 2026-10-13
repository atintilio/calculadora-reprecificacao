import { useMemo } from 'react';
import { useStore } from '../store';
import { calcularImpactoCaixa } from '../core/cashflow';
import { Card, Metric, formatCurrency, Disclaimer } from '../components/ui';

export function Modulo4Caixa() {
  const { parametros } = useStore();

  const resultado = useMemo(() => calcularImpactoCaixa(parametros), [parametros]);

  return (
    <div className="space-y-6">
      <Disclaimer
        text="Em 2027 o split payment é FACULTATIVO e restrito a B2B. A obrigatoriedade é esperada para 2028+. Não superestime o aperto de caixa provisionando 2027 como obrigatório."
        type="warning"
      />

      <Card title="💸 Impacto do Split Payment no Fluxo de Caixa">
        <p className="text-sm text-gray-600 mb-6">
          O split payment retém o imposto no momento da transação, eliminando o "float" que a empresa tinha entre receber do cliente e recolher o tributo.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <Metric
              label="Float Atual (mensal)"
              value={formatCurrency(resultado.floatAtual)}
              variant="positive"
              sublabel="Tributos que você 'segura'"
            />
          </div>
          <div className="bg-red-50 border border-red-100 rounded-lg p-4">
            <Metric
              label="Split Retido (mensal)"
              value={formatCurrency(resultado.splitRetido)}
              variant="negative"
              sublabel="Valor retido na fonte"
            />
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <Metric
              label="Capital a Recompor"
              value={formatCurrency(resultado.capitalRecompor)}
              variant="highlight"
              sublabel="Float que desaparece"
            />
          </div>
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
            <Metric
              label="Custo Anual Reposição"
              value={formatCurrency(resultado.custoAnualReposicao)}
              variant="negative"
              sublabel={`${parametros.custoCapitalAnual}% a.a. sobre capital`}
            />
          </div>
        </div>
      </Card>

      <Card title="📉 Simulação Visual">
        <div className="space-y-4">
          {/* Barra visual */}
          <div className="relative">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-sm font-medium text-gray-700 w-32">Hoje (com float)</span>
              <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-end pr-3"
                  style={{ width: '100%' }}
                >
                  <span className="text-xs font-bold text-white">
                    {formatCurrency(resultado.floatAtual + resultado.splitRetido)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 w-32">Com Split</span>
              <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full flex items-center justify-end pr-3"
                  style={{ width: `${Math.min(100, (resultado.splitRetido / (resultado.floatAtual + resultado.splitRetido)) * 100)}%` }}
                >
                  <span className="text-xs font-bold text-white">
                    {formatCurrency(resultado.splitRetido)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p className="font-medium mb-2">💡 O que isso significa:</p>
            <ul className="space-y-1 text-xs">
              <li>• Hoje você recebe do cliente e tem {parametros.prazoMedioDias} dias para recolher o imposto</li>
              <li>• Com split payment, o governo fica com a parte do imposto imediatamente</li>
              <li>• Você precisa de <strong>{formatCurrency(resultado.capitalRecompor)}</strong> em capital de giro extra</li>
              <li>• Custo anual desse capital: <strong>{formatCurrency(resultado.custoAnualReposicao)}</strong></li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
