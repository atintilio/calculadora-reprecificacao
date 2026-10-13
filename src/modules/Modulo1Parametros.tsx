import { useStore } from '../store';
import { InputField, Disclaimer, Card } from '../components/ui';

export function Modulo1Parametros() {
  const { parametros, setParametros } = useStore();

  return (
    <div className="space-y-6">
      <Disclaimer
        text="A alíquota oficial da CBS depende de Resolução do Senado (Dez/2026) e cálculo do TCU (Out/2026). A opção/cancelamento do Simples vence antes da alíquota oficial existir. Esta é uma ferramenta de simulação e ordem de grandeza da Argos Prime."
        type="warning"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estrutura Mensal */}
        <Card title="📊 Estrutura Mensal">
          <div className="space-y-4">
            <InputField
              label="Faturamento Mensal"
              value={parametros.faturamento}
              onChange={(v) => setParametros({ faturamento: v })}
              prefix="R$"
              tooltip="Faturamento bruto mensal da empresa"
              step={1000}
            />
            <InputField
              label="Folha + Encargos"
              value={parametros.folhaEncargos}
              onChange={(v) => setParametros({ folhaEncargos: v })}
              prefix="R$"
              tooltip="NÃO gera crédito de tributo. Inclui salários, INSS, FGTS, etc."
              step={1000}
            />
            <InputField
              label="Insumos com Crédito"
              value={parametros.insumosComCredito}
              onChange={(v) => setParametros({ insumosComCredito: v })}
              prefix="R$"
              tooltip="Insumos que geram crédito tributário (matéria-prima, energia, aluguel, etc.)"
              step={1000}
            />
            <InputField
              label="Insumos sem Crédito"
              value={parametros.insumosSemCredito}
              onChange={(v) => setParametros({ insumosSemCredito: v })}
              prefix="R$"
              tooltip="Insumos que NÃO geram crédito (folha, despesas pessoais, etc.)"
              step={1000}
            />
            <InputField
              label="Comissões (% sobre nota)"
              value={parametros.comissoesPercentual}
              onChange={(v) => setParametros({ comissoesPercentual: v })}
              suffix="%"
              tooltip="Comissões incidem sobre o TOTAL da nota, imposto incluído"
              max={100}
            />
          </div>
        </Card>

        {/* Tributos Atuais */}
        <Card title="🏛️ Tributos Atuais (Por Dentro)">
          <div className="space-y-4">
            <InputField
              label="ISS / ICMS"
              value={parametros.issIcms}
              onChange={(v) => setParametros({ issIcms: v })}
              suffix="%"
              tooltip="Alíquota por dentro. Ex: 5% para serviços (ISS), ou ICMS do seu estado."
              max={50}
            />
            <InputField
              label="PIS / Cofins"
              value={parametros.pisCofins}
              onChange={(v) => setParametros({ pisCofins: v })}
              suffix="%"
              tooltip="Regime cumulativo: 3,65%. Não-cumulativo: 9,25%."
              max={20}
            />
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
              <p className="font-medium">Equivalente "Por Fora":</p>
              <p>
                Alíquota combinada: {((parametros.issIcms + parametros.pisCofins) / (100 - parametros.issIcms - parametros.pisCofins) * 100).toFixed(2)}%
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Fórmula: t_fora = t_dentro / (1 - t_dentro)
              </p>
            </div>
          </div>
        </Card>

        {/* Cenário 2027 */}
        <Card title="📅 Cenário 2027 (Transição)">
          <div className="space-y-4">
            <InputField
              label="CBS Estimada"
              value={parametros.cbsEstimada}
              onChange={(v) => setParametros({ cbsEstimada: v })}
              suffix="%"
              tooltip="CBS (Contribuição sobre Bens e Serviços) — substitui PIS/Cofins. Estimada em ~9%."
              max={30}
            />
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-700">
              <p className="font-medium">⚡ ISS/ICMS Mantido em 2027</p>
              <p className="text-xs mt-1">O ISS/ICMS só será extinto em 2029+ com a entrada do IBS.</p>
            </div>
          </div>
        </Card>

        {/* Cenário 2033 */}
        <Card title="🔮 Cenário 2033 (Regime Pleno)">
          <div className="space-y-4">
            <InputField
              label="IVA Dual (IBS + CBS)"
              value={parametros.ivaDual}
              onChange={(v) => setParametros({ ivaDual: v })}
              suffix="%"
              tooltip="Alíquota padrão estimada do IVA Dual. Estimativas variam entre 25-30%."
              max={50}
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Redutor</label>
              <div className="flex gap-2">
                {['0', '30', '60'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setParametros({ redutor: r as '0' | '30' | '60' })}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                      parametros.redutor === r
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {r}%
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Alíquota Efetiva: {(parametros.ivaDual * (1 - parseInt(parametros.redutor) / 100)).toFixed(2)}%
              </p>
            </div>
          </div>
        </Card>

        {/* Caixa */}
        <Card title="💰 Caixa">
          <div className="space-y-4">
            <InputField
              label="Prazo Médio de Recebimento"
              value={parametros.prazoMedioDias}
              onChange={(v) => setParametros({ prazoMedioDias: v })}
              suffix="dias"
              tooltip="Prazo médio para receber dos clientes"
              max={365}
              step={1}
            />
            <InputField
              label="Custo de Capital Anual"
              value={parametros.custoCapitalAnual}
              onChange={(v) => setParametros({ custoCapitalAnual: v })}
              suffix="%"
              tooltip="Taxa de juros anual do capital de giro (Selic + spread, ou custo oportunidade)"
              max={100}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
