import { useStore } from './store';
import { Modulo1Parametros } from './modules/Modulo1Parametros';
import { Modulo2Reprecificacao } from './modules/Modulo2Reprecificacao';
import { Modulo3Markup } from './modules/Modulo3Markup';
import { Modulo4Caixa } from './modules/Modulo4Caixa';
import { Modulo5Carteira } from './modules/Modulo5Carteira';

const TABS = [
  { label: 'Parâmetros', icon: '⚙️', description: 'Inputs e premissas' },
  { label: 'Reprecificação', icon: '📊', description: 'Impacto na margem' },
  { label: 'Markup', icon: '🔄', description: 'Conversor de formato' },
  { label: 'Caixa', icon: '💰', description: 'Split Payment' },
  { label: 'Carteira', icon: '👥', description: 'Elasticidade e repasse' },
];

function App() {
  const { activeTab, setActiveTab, resetAll } = useStore();

  const renderModule = () => {
    switch (activeTab) {
      case 0: return <Modulo1Parametros />;
      case 1: return <Modulo2Reprecificacao />;
      case 2: return <Modulo3Markup />;
      case 3: return <Modulo4Caixa />;
      case 4: return <Modulo5Carteira />;
      default: return <Modulo1Parametros />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AP</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Argos Prime</h1>
                <p className="text-xs text-gray-500 -mt-0.5">Calculadora de Reprecificação</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
                Reforma Tributária 2027+
              </span>
              <button
                onClick={resetAll}
                className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                Resetar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide">
            {TABS.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === index
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {TABS[activeTab].icon} {TABS[activeTab].label}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{TABS[activeTab].description}</p>
        </div>

        {/* Module Content */}
        {renderModule()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">AP</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Argos Prime</span>
            </div>
            <p className="text-xs text-gray-400 text-center">
              Ferramenta de simulação e ordem de grandeza. Não substitui consultoria fiscal especializada.
            </p>
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} Argos Prime. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
