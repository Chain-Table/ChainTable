import { useTranslation } from 'react-i18next'

const LANGS = ['es', 'en'] as const

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const current = (i18n.language || 'es').slice(0, 2)

  const change = (lng: string) => {
    i18n.changeLanguage(lng)
    try {
      localStorage.setItem('i18nextLng', lng)
    } catch { /* modo privado: no se recuerda */ }
  }

  return (
    <div
      role="group"
      aria-label={t('change_language')}
      className="fixed top-3.5 right-3 z-50 flex rounded-full bg-black/50 backdrop-blur ring-1 ring-white/15 p-0.5 text-xs font-extrabold shadow-lg"
    >
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => change(l)}
          aria-pressed={current === l}
          className={`px-2.5 py-1 rounded-full transition ${current === l ? 'bg-yellow-400 text-black' : 'text-white/70 hover:text-white'}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
