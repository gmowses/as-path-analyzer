import { useState, useEffect } from 'react'
import { Sun, Moon, Languages, Search, AlertTriangle, CheckCircle2, Info } from 'lucide-react'

const translations = {
  en: {
    title: 'AS Path Analyzer',
    subtitle: 'Paste an AS_PATH to decode ASN names, detect prepending, loops, and analyze routing relationships.',
    inputLabel: 'AS_PATH',
    inputPlaceholder: 'e.g. 174 3356 13335 13335 13335',
    analyze: 'Analyze',
    clear: 'Clear',
    pathLength: 'Path Length',
    uniqueAs: 'Unique ASNs',
    prepending: 'Prepending detected',
    noPrepending: 'No prepending',
    loop: 'Loop detected',
    noLoop: 'No loop',
    directPeering: 'Direct peering (1 hop)',
    transit: 'Transit path',
    hops: 'hops',
    asDetails: 'AS Details',
    unknown: 'Unknown ASN',
    relationship: 'Relationship',
    origin: 'Origin AS',
    intermediate: 'Transit',
    destination: 'Upstream',
    count: 'Count',
    findings: 'Findings',
    noPath: 'Enter an AS_PATH to analyze.',
    builtBy: 'Built by',
    references: 'References',
    refList: ['RFC 4271 – BGP-4', 'RFC 7908 – BGP Route Leak Problem Definition', 'PeeringDB – https://www.peeringdb.com'],
  },
  pt: {
    title: 'Analisador de AS Path',
    subtitle: 'Cole um AS_PATH para decodificar nomes de ASN, detectar prepend, loops e analisar relacionamentos de roteamento.',
    inputLabel: 'AS_PATH',
    inputPlaceholder: 'ex: 174 3356 13335 13335 13335',
    analyze: 'Analisar',
    clear: 'Limpar',
    pathLength: 'Tamanho do Caminho',
    uniqueAs: 'ASNs Unicos',
    prepending: 'Prepend detectado',
    noPrepending: 'Sem prepend',
    loop: 'Loop detectado',
    noLoop: 'Sem loop',
    directPeering: 'Peering direto (1 salto)',
    transit: 'Caminho transit',
    hops: 'saltos',
    asDetails: 'Detalhes dos AS',
    unknown: 'ASN desconhecido',
    relationship: 'Relacionamento',
    origin: 'AS de Origem',
    intermediate: 'Transito',
    destination: 'Upstream',
    count: 'Contagem',
    findings: 'Conclusoes',
    noPath: 'Insira um AS_PATH para analisar.',
    builtBy: 'Criado por',
    references: 'Referencias',
    refList: ['RFC 4271 – BGP-4', 'RFC 7908 – BGP Route Leak Problem Definition', 'PeeringDB – https://www.peeringdb.com'],
  },
} as const

type Lang = keyof typeof translations

const ASN_DB: Record<number, { name: string; country: string; type: string }> = {
  174: { name: 'Cogent Communications', country: 'US', type: 'Tier-1' },
  209: { name: 'CenturyLink (Lumen)', country: 'US', type: 'Tier-1' },
  701: { name: 'Verizon Business', country: 'US', type: 'Tier-1' },
  1239: { name: 'Sprint', country: 'US', type: 'Tier-1' },
  1299: { name: 'Telia Company', country: 'SE', type: 'Tier-1' },
  2914: { name: 'NTT Communications', country: 'JP', type: 'Tier-1' },
  3257: { name: 'GTT Communications', country: 'US', type: 'Tier-1' },
  3320: { name: 'Deutsche Telekom', country: 'DE', type: 'ISP' },
  3356: { name: 'Lumen (Level3)', country: 'US', type: 'Tier-1' },
  5511: { name: 'Orange S.A.', country: 'FR', type: 'Tier-1' },
  6453: { name: 'TATA Communications', country: 'IN', type: 'Tier-1' },
  6461: { name: 'Zayo Bandwidth', country: 'US', type: 'Tier-1' },
  6762: { name: 'Telecom Italia Sparkle', country: 'IT', type: 'Tier-1' },
  6830: { name: 'Liberty Global', country: 'NL', type: 'ISP' },
  6939: { name: 'Hurricane Electric', country: 'US', type: 'Tier-2' },
  7018: { name: 'AT&T Services', country: 'US', type: 'Tier-1' },
  9002: { name: 'RETN', country: 'GB', type: 'Tier-2' },
  12956: { name: 'Telefonica', country: 'ES', type: 'ISP' },
  13335: { name: 'Cloudflare', country: 'US', type: 'CDN' },
  15169: { name: 'Google LLC', country: 'US', type: 'Hyperscaler' },
  16509: { name: 'Amazon AWS', country: 'US', type: 'Hyperscaler' },
  19551: { name: 'Fastly', country: 'US', type: 'CDN' },
  20940: { name: 'Akamai Technologies', country: 'US', type: 'CDN' },
  22822: { name: 'Limelight Networks', country: 'US', type: 'CDN' },
  32934: { name: 'Meta (Facebook)', country: 'US', type: 'Hyperscaler' },
  36492: { name: 'Google Fiber', country: 'US', type: 'ISP' },
  54113: { name: 'Fastly', country: 'US', type: 'CDN' },
  8075: { name: 'Microsoft Azure', country: 'US', type: 'Hyperscaler' },
  714: { name: 'Apple', country: 'US', type: 'Enterprise' },
  2516: { name: 'KDDI', country: 'JP', type: 'ISP' },
  4134: { name: 'China Telecom', country: 'CN', type: 'ISP' },
  4837: { name: 'China Unicom', country: 'CN', type: 'ISP' },
  9808: { name: 'China Mobile', country: 'CN', type: 'ISP' },
  18881: { name: 'Telefonica Brasil (Vivo)', country: 'BR', type: 'ISP' },
  26615: { name: 'Tim Brasil', country: 'BR', type: 'ISP' },
  7738: { name: 'Telemar (Oi)', country: 'BR', type: 'ISP' },
  28573: { name: 'Claro Brasil', country: 'BR', type: 'ISP' },
  4230: { name: 'Embratel', country: 'BR', type: 'ISP' },
  52320: { name: 'GVT (Vivo Empresas)', country: 'BR', type: 'ISP' },
}

function typeColor(type: string): string {
  const map: Record<string, string> = {
    'Tier-1': '#8b5cf6',
    'Tier-2': '#3b82f6',
    'ISP': '#10b981',
    'CDN': '#f59e0b',
    'Hyperscaler': '#ef4444',
    'Enterprise': '#6b7280',
  }
  return map[type] ?? '#6b7280'
}

export default function AsPathAnalyzer() {
  const [lang, setLang] = useState<Lang>(() => (navigator.language.startsWith('pt') ? 'pt' : 'en'))
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [input, setInput] = useState('174 3356 13335 13335 13335')
  const [analyzed, setAnalyzed] = useState<number[] | null>(null)

  const t = translations[lang]
  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  const handleAnalyze = () => {
    const parts = input.trim().split(/\s+/).map(Number).filter(n => !isNaN(n) && n > 0)
    setAnalyzed(parts)
  }

  const uniqueAsns = analyzed ? [...new Set(analyzed)] : []
  const hasPrepend = analyzed ? uniqueAsns.some(asn => analyzed.filter(a => a === asn).length > 1) : false
  const hasLoop = analyzed ? (new Set(analyzed).size !== analyzed.length && hasPrepend === false) : false
  const countMap: Record<number, number> = {}
  if (analyzed) analyzed.forEach(a => { countMap[a] = (countMap[a] ?? 0) + 1 })

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
              <Search size={18} className="text-white" />
            </div>
            <span className="font-semibold">AS Path Analyzer</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />{lang.toUpperCase()}
            </button>
            <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/as-path-analyzer" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
            <label className="text-sm font-medium">{t.inputLabel}</label>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
              placeholder={t.inputPlaceholder}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500" />
            <div className="flex gap-3">
              <button onClick={handleAnalyze} className="flex items-center gap-2 rounded-lg bg-violet-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-600 transition-colors">
                <Search size={15} />{t.analyze}
              </button>
              <button onClick={() => { setInput(''); setAnalyzed(null) }} className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                {t.clear}
              </button>
            </div>
          </div>

          {analyzed && analyzed.length > 0 && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: t.pathLength, value: analyzed.length },
                  { label: t.uniqueAs, value: uniqueAsns.length },
                  { label: t.hops, value: uniqueAsns.length },
                ].map(s => (
                  <div key={s.label} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-4">
                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{s.label}</p>
                    <p className="text-2xl font-bold text-violet-500">{s.value}</p>
                  </div>
                ))}
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{t.relationship}</p>
                  <p className="text-sm font-semibold">{uniqueAsns.length === 1 ? t.directPeering : t.transit}</p>
                </div>
              </div>

              {/* Findings */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3">
                <h2 className="font-semibold">{t.findings}</h2>
                <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${hasPrepend ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'}`}>
                  {hasPrepend ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                  {hasPrepend ? t.prepending : t.noPrepending}
                  {hasPrepend && (
                    <span className="ml-2 text-xs">
                      ({uniqueAsns.filter(a => countMap[a] > 1).map(a => `AS${a} x${countMap[a]}`).join(', ')})
                    </span>
                  )}
                </div>
                <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${hasLoop ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'}`}>
                  {hasLoop ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                  {hasLoop ? t.loop : t.noLoop}
                </div>
              </div>

              {/* Visual path */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
                <h2 className="font-semibold">{t.asDetails}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  {analyzed.map((asn, i) => {
                    const info = ASN_DB[asn]
                    const isPrepend = countMap[asn] > 1 && i > analyzed.indexOf(asn)
                    return (
                      <div key={i} className="flex items-center gap-1">
                        <div className="rounded-lg border px-3 py-2 text-xs"
                          style={isPrepend ? { borderColor: '#f59e0b', backgroundColor: '#fef3c720', color: '#d97706' } : { borderColor: info ? typeColor(info.type) : '#71717a', backgroundColor: `${info ? typeColor(info.type) : '#71717a'}15`, color: info ? typeColor(info.type) : '#71717a' }}>
                          <span className="font-bold">{asn}</span>
                          {isPrepend && <span className="ml-1 opacity-60">(prepend)</span>}
                        </div>
                        {i < analyzed.length - 1 && <span className="text-zinc-400 text-xs">→</span>}
                      </div>
                    )
                  })}
                </div>
                <div className="space-y-2">
                  {uniqueAsns.map((asn, i) => {
                    const info = ASN_DB[asn]
                    const role = i === uniqueAsns.length - 1 ? t.origin : i === 0 ? t.destination : t.intermediate
                    return (
                      <div key={asn} className="flex items-center justify-between rounded-lg border border-zinc-100 dark:border-zinc-800 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-sm">AS{asn}</span>
                          <div>
                            <span className="text-sm">{info?.name ?? t.unknown}</span>
                            {info && (
                              <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${typeColor(info.type)}20`, color: typeColor(info.type) }}>
                                {info.type}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                          {info && <span>{info.country}</span>}
                          <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800">{role}</span>
                          {countMap[asn] > 1 && <span className="text-amber-500">x{countMap[asn]}</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Info size={14} className="text-zinc-400" />
                  <h3 className="text-sm font-medium">ASN Type Legend</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Tier-1', 'Tier-2', 'ISP', 'CDN', 'Hyperscaler', 'Enterprise'].map(type => (
                    <span key={type} className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: `${typeColor(type)}20`, color: typeColor(type) }}>
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {!analyzed && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-12 text-center">
              <Search size={32} className="mx-auto mb-3 text-zinc-400" />
              <p className="text-zinc-500">{t.noPath}</p>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-violet-500 transition-colors">Gabriel Mowses</a></span>
            <span>MIT License</span>
          </div>
          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
            <p className="text-xs font-medium text-zinc-500 mb-1">{t.references}</p>
            <ul className="space-y-0.5">
              {t.refList.map(ref => <li key={ref} className="text-xs text-zinc-400">{ref}</li>)}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
