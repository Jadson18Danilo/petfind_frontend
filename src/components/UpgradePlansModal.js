import { Check, Sparkles, X } from 'lucide-react';

function FeatureItem({ text, highlighted = false, isLight = false }) {
  return (
    <li className="flex items-start gap-2">
      <Check className={`size-4 shrink-0 mt-0.5 ${isLight ? 'text-white' : 'text-[#FFA98F]'}`} />
      <span className={`text-xs ${isLight ? 'text-white' : 'text-[#4a5565]'} ${highlighted ? 'font-semibold' : ''}`}>{text}</span>
    </li>
  );
}

export default function UpgradePlansModal({
  isOpen,
  onClose,
  onSelectPlan,
  currentTier = 'free',
  reason = 'likes-limit',
}) {
  if (!isOpen) return null;

  const isPremium = currentTier === 'premium';
  const isAdmin = currentTier === 'admin';

  const subtitle =
    reason === 'chat-locked'
      ? 'O chat direto é um recurso premium. Faça upgrade para conversar na hora com seus matches.'
      : 'Você atingiu o limite do plano gratuito. Faça upgrade para continuar curtindo e desbloquear recursos premium.';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-120 p-4 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[94vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 size-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          aria-label="Fechar modal"
        >
          <X className="size-5 text-[#4A5565]" />
        </button>

        <div className="px-6 sm:px-12 py-8 sm:py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-2 mb-3">
              <div className="size-10 rounded-full bg-linear-to-r from-[#FFA98F] to-[#FF8566] flex items-center justify-center">
                <Sparkles className="size-6 text-white" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0a0a0a] mb-2">Desbloqueie recursos premium</h2>
            <p className="text-sm text-[#4a5565] max-w-2xl mx-auto">{subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-6">
            <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-4 flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-[#0a0a0a] mb-1">Gratuito</h3>
                <p className="text-xs text-[#4a5565]">Recursos básicos</p>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-[#4a5565]">R$</span>
                  <span className="text-3xl font-bold text-[#0a0a0a]">0</span>
                </div>
                <p className="text-xs text-[#4a5565] mt-1">para sempre</p>
              </div>

              <ul className="space-y-2 mb-6 grow">
                <FeatureItem text="Perfil do seu pet" />
                <FeatureItem text="Buscar outros pets" />
                <FeatureItem text="Curtidas limitadas" />
              </ul>

              <button
                type="button"
                disabled
                className="w-full h-10 rounded-[10px] bg-gray-100 text-[#4a5565] font-semibold cursor-not-allowed text-sm"
              >
                {isPremium || isAdmin ? 'Plano Anterior' : 'Plano Atual'}
              </button>
            </div>

            <div className="relative rounded-2xl transform md:scale-105 shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-linear-to-r from-[#FFA98F] to-[#FF8566] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10 flex items-center gap-1">
                <Sparkles className="size-3" />
                Mais Popular
              </div>

              <div className="bg-linear-to-br from-[#FFA98F] via-[#FF9D8B] to-[#FF8566] p-4 flex flex-col h-full rounded-2xl">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white mb-1">Mensal</h3>
                  <p className="text-xs text-white/90">Acesso completo</p>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-white/90">R$</span>
                    <span className="text-3xl font-bold text-white">29,99</span>
                  </div>
                  <p className="text-xs text-white/90 mt-1">por mês</p>
                </div>

                <ul className="space-y-2 mb-6 grow">
                  <FeatureItem text="Tudo do plano Gratuito" isLight />
                  <FeatureItem text="Curtidas ilimitadas" isLight />
                  <FeatureItem text="Veja quem curtiu seu pet" highlighted isLight />
                  <FeatureItem text="Curtir pets rejeitados" isLight />
                  <FeatureItem text="Acesso direto ao chat" isLight />
                  <FeatureItem text="Acesso direto ao perfil do tutor" isLight />
                </ul>

                <button
                  type="button"
                  onClick={() => onSelectPlan?.('monthly')}
                  className="w-full h-10 rounded-[10px] bg-white text-[#FF8566] font-semibold hover:bg-gray-50 transition-colors shadow-lg text-sm"
                >
                  {isPremium ? 'Gerenciar Assinatura' : 'Começar Agora'}
                </button>
              </div>
            </div>

            <div className="relative bg-white border-2 border-[#FFA98F] rounded-2xl p-4 flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FFE5DC] text-[#FF8566] px-3 py-1 rounded-full text-xs font-bold z-10">
                Economize 33%
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-[#0a0a0a] mb-1">Anual</h3>
                <p className="text-xs text-[#4a5565]">Melhor valor</p>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-[#4a5565]">R$</span>
                  <span className="text-3xl font-bold text-[#0a0a0a]">239,99</span>
                </div>
                <p className="text-xs text-[#4a5565] mt-1">por ano</p>
                <p className="text-xs text-[#FFA98F] font-semibold mt-1">R$ 19,90 por mês</p>
              </div>

              <ul className="space-y-2 mb-6 grow">
                <FeatureItem text="Tudo do plano Gratuito" />
                <FeatureItem text="Curtidas ilimitadas" />
                <FeatureItem text="Veja quem curtiu seu pet" highlighted />
                <FeatureItem text="Curtir pets rejeitados" />
                <FeatureItem text="Acesso direto ao chat" />
                <FeatureItem text="Acesso direto ao perfil do tutor" />
              </ul>

              <button
                type="button"
                onClick={() => onSelectPlan?.('annual')}
                className="w-full h-10 rounded-[10px] bg-linear-to-r from-[#FFA98F] to-[#FF8566] text-white font-semibold hover:shadow-lg transition-all text-sm"
              >
                {isPremium ? 'Trocar para Anual' : 'Começar Agora'}
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-[#4a5565]">
              Cancele quando quiser • Pagamento seguro • Dados protegidos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}