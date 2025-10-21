const Footer = ({ variant = 'default', showBackToHome = false, onBackToHome }) => {
  const footerVariants = {
    default: {
      container: "mt-12",
      text: "text-neutral-500"
    },
    compact: {
      container: "mt-8", 
      text: "text-neutral-400"
    },
    minimal: {
      container: "mt-6",
      text: "text-neutral-400"
    }
  }

  const currentVariant = footerVariants[variant] || footerVariants.default

  return (
    <footer className={`text-center ${currentVariant.container}`}>
      {/* Botão Voltar ao Início (opcional) */}
      {showBackToHome && onBackToHome && (
        <div className="mb-6">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600 transition-colors group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar ao início
          </button>
        </div>
      )}

      {/* Links de Ajuda */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <button className="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors">
          Central de Ajuda
        </button>
        <button className="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors">
          Suporte
        </button>
        <button className="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors">
          Contato
        </button>
      </div>

      {/* Divisor */}
      <div className="border-t border-neutral-200 pt-6">
        {/* Links Legais */}
        <div className={`flex flex-wrap justify-center gap-4 text-xs ${currentVariant.text} mb-4`}>
          <button className="hover:text-neutral-600 transition-colors">
            Termos de Uso
          </button>
          <span>•</span>
          <button className="hover:text-neutral-600 transition-colors">
            Política de Privacidade
          </button>
          <span>•</span>
          <button className="hover:text-neutral-600 transition-colors">
            Cookies
          </button>
          <span>•</span>
          <button className="hover:text-neutral-600 transition-colors">
            LGPD
          </button>
        </div>

        {/* Copyright */}
        <p className={`text-xs ${currentVariant.text}`}>
          © 2025 DrinkFlow. Todos os direitos reservados.
        </p>
        
        {/* Logo pequeno */}
        <div className="flex justify-center mt-4">
          <div className="flex items-center space-x-2 opacity-60">
            <div className="w-6 h-6 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
              </svg>
            </div>
            <span className={`text-xs font-medium ${currentVariant.text}`}>DrinkFlow</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer