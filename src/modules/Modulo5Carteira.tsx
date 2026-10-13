import { useMemo } from 'react';
import { useStore } from '../store';
import { calcularReprecificacao } from '../core/taxEngine';
import { analisarCarteira } from '../core/portfolio';
import { Card, InputField, formatPercent, Disclaimer } from '../components/ui';

export function Modulo5Carteira() {
  const { parametros, carteira, setCarteira } = useStore();

  const resultado = useMemo(() => calcularReprecificacao(parametros), [parametros]);
  
  const variacaoNota2027 = resultado.precoManterMargem.variacaoNota2027;
  const variacaoNotaPleno = resultado.precoManterMargem.variacaoNotaPleno;

  const analise2027 = useMemo(() => analisarCarteira(carteira, variacaoNota2027), [carteira, variacaoNota2027]);
  const analisePleno = useMemo(() => analisarCarteira(carteira, variacaoNotaPleno), [carteira, variacaoNotaPleno]);

  const somaCarteira = carteira.pjRegular + carteira.pjSimples + carteira.pjRedutor + carteira.b2c;
  const carteiraValida = Math.abs(somaCarteira - 100) < 0.1;

  return (
    <div className="space-y-6">
      <Disclaimer
        text="A elasticidade de repasse varia por setor e região. Os percentuais são estimativas da Argos Prime baseadas em estudos setoriais."
        type="info"
      />

      {/* Composição da Carteira */}
      <Card title="👥 Composição da Carteira de Clientes">
        <p className="text-sm text-gray-600 mb-4">
          Defina a composição da sua carteira (deve somar 100%):
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InputField
            label="PJ Regular"
            value={carteira.pjRegular}
            onChange={(v) => setCarteira({ pjRegular: v })}
            suffix="%"
            tooltip="Recupera 100% do crédito. Absorve 0% do aumento."
            max={100}
          />
          <InputField
            label="PJ Simples"
            value={carteira.pjSimples}
            onChange={(v) => setCarteira({ pjSimples: v })}
            suffix="%"
            tooltip="Recupera 30% do crédito. Absorve 70% do aumento."
            max={100}
          />
          <InputField
            label="PJ com Redutor"
            value={carteira.pjRedutor}
            onChange={(v) => setCarteira({ pjRedutor: v })}
            suffix="%"
            tooltip="Recupera 50% do crédito. Absorve 50% do aumento."
            max={100}
          />
          <InputField
            label="Consumidor Final (B2C)"
            value={carteira.b2c}
            onChange={(v) => setCarteira({ b2c: v })}
            suffix="%"
            tooltip="Recupera 0% do crédito. Absorve 100% do aumento."
            max={100}
          />
        </div>

        {!carteiraValida && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2 text-sm text-amber-700">
            ⚠️ A carteira deve somar 100%. Soma atual: {somaCarteira.toFixed(1)}%
            {somaCarteira > 0 && <span className="text-xs ml-2">(valores serão normalizados)</span>}
          </div>
        )}
      </Card>

      {/* Resultados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cenário 2027 */}
        <Card title="📅 Impacto na Carteira — 2027">
          <div className="space-y-4">
            <div className="text-center bg-indigo-50 rounded-lg p-3">
              <p className="text-xs text-indigo-600 uppercase">Aumento Necessário na Nota</p>
              <p className="text-xl font-bold text-indigo-700">{formatPercent(variacaoNota2027)}</p>
            </div>

            <div className="space-y-2">
              {analise2027.detalhamento.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-32 text-xs text-gray-600 truncate">{d.segmento}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden relative">
                    <div
                      className="h-full bg-indigo-400 rounded-full"
                      style={{ width: `${Math.min(100, d.peso)}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                      {d.peso.toFixed(0)}% peso → sente {formatPercent(d.impacto)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
              <p className="text-xs text-red-600 uppercase">Aumento Sentido pela Carteira</p>
              <p className="text-2xl font-bold text-red-700">{formatPercent(analise2027.aumentoSentido)}</p>
              <p className="text-xs text-gray-500 mt-1">Impacto real considerando elasticidade</p>
            </div>
          </div>
        </Card>

        {/* Regime Pleno */}
        <Card title="🔮 Impacto na Carteira — Regime Pleno">
          <div className="space-y-4">
            <div className="text-center bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-purple-600 uppercase">Aumento Necessário na Nota</p>
              <p className="text-xl font-bold text-purple-700">{formatPercent(variacaoNotaPleno)}</p>
            </div>

            <div className="space-y-2">
              {analisePleno.detalhamento.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-32 text-xs text-gray-600 truncate">{d.segmento}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden relative">
                    <div
                      className="h-full bg-purple-400 rounded-full"
                      style={{ width: `${Math.min(100, d.peso)}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                      {d.peso.toFixed(0)}% peso → sente {formatPercent(d.impacto)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
              <p className="text-xs text-red-600 uppercase">Aumento Sentido pela Carteira</p>
              <p className="text-2xl font-bold text-red-700">{formatPercent(analisePleno.aumentoSentido)}</p>
              <p className="text-xs text-gray-500 mt-1">Impacto real considerando elasticidade</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Insight */}
      <Card title="🧠 Insight Argos Prime">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            {analisePleno.aumentoSentido > 3 ? (
              <>
                <strong>Atenção:</strong> Com {carteira.b2c.toFixed(0)}% da carteira em B2C, o aumento sentido de {formatPercent(analisePleno.aumentoSentido)} pode reduzir significativamente seu volume de vendas. 
                Considere estratégias de absorção parcial para clientes sensíveis a preço.
              </>
            ) : (
              <>
                <strong>Boa notícia:</strong> Sua carteira tem boa capacidade de repasse. 
                O aumento sentido de {formatPercent(analisePleno.aumentoSentido)} é moderado, 
                pois a maioria dos seus clientes consegue recuperar créditos.
              </>
            )}
          </p>
        </div>
      </Card>
    </div>
  );
}
