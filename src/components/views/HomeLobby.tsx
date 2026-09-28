import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Flame,
  Search,
  Trophy,
  Shield,
  Zap,
  Play,
  RotateCcw,
  Star,
  Users,
  Eye,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { CasinoGame, GameCategory } from '../../types';

export const HomeLobby: React.FC = () => {
  const { games, setActiveGame, setCurrentView, wallet } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [providerFilter, setProviderFilter] = useState<string>('all');

  const categories: { id: GameCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'Todos los Juegos', icon: '🎰' },
    { id: 'slots', label: 'Tragamonedas / Slots', icon: '💎' },
    { id: 'roulette', label: 'Ruleta', icon: '🎡' },
    { id: 'blackjack', label: 'Blackjack 21', icon: '🃏' },
    { id: 'crash', label: 'Crash Games / Aviator', icon: '🚀' },
    { id: 'live', label: 'Mesas en Vivo', icon: '🎙️' },
  ];

  const filteredGames = games.filter(g => {
    if (!g.active) return false;
    if (selectedCategory !== 'all' && g.category !== selectedCategory) return false;
    if (providerFilter !== 'all' && g.provider !== providerFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return g.title.toLowerCase().includes(q) || g.provider.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-10">
      {/* HERO BANNER SECTION */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-[#0c1626] via-[#09101c] to-[#120e24] shadow-2xl p-6 sm:p-10">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Casino Tecnológico Regulado Argentina</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-serif-luxury tracking-wide text-white leading-tight">
            BIENVENIDO A <span className="gold-gradient-text">ROYALPLAY</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Experimenta el casino online más seguro de Argentina. Juegos demostrativos y reales,
            billetera en <strong>Pesos (ARS)</strong>, mensajería cifrada <strong>AES-256-GCM</strong> y
            estricto cumplimiento de <strong>Juego Responsable (+18)</strong>.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                const slotGame = games.find(g => g.slug === 'royal-slots-777');
                if (slotGame) setActiveGame(slotGame);
              }}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black font-serif-luxury font-black text-sm tracking-wider shadow-xl gold-glow hover:brightness-110 active:scale-95 transition flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>JUGAR ROYAL 777 AHORA</span>
            </button>

            <button
              onClick={() => setCurrentView('promotions')}
              className="px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition"
            >
              Ver Bonos y Torneos
            </button>
          </div>
        </div>

        {/* Floating Right Stats Card */}
        <div className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2 w-80 bg-slate-900/90 border border-amber-500/40 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
          <div className="text-xs uppercase font-mono-tech text-amber-400 font-bold tracking-widest flex items-center justify-between pb-2 border-b border-slate-800">
            <span>Pozo Acumulado</span>
            <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>

          <div className="my-3">
            <div className="text-3xl font-serif-luxury font-black text-amber-300">
              $38.450.000 <span className="text-xs font-mono-tech text-amber-400/80">ARS</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Participa en cualquier tragamonedas o ruleta para clasificar automáticamente.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800/60 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Jugadores Conectados:</span>
              <span className="font-mono-tech font-bold text-emerald-400">1.482 online</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Verificación KYC:</span>
              <span className="text-cyan-300 font-semibold">100% Digital DNI</span>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE WINNERS TICKER */}
      <div className="py-2.5 px-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 overflow-hidden text-xs">
        <div className="flex items-center gap-1.5 text-amber-400 font-bold shrink-0 uppercase tracking-wider text-[11px]">
          <Trophy className="w-3.5 h-3.5" />
          <span>Últimos Ganadores:</span>
        </div>
        <div className="flex items-center gap-6 overflow-x-auto text-slate-300 font-mono-tech text-xs whitespace-nowrap">
          <span>
            <strong className="text-white">Martín R. (CABA):</strong>{' '}
            <span className="text-emerald-400">+$120.000 ARS</span> en Royal 777
          </span>
          <span className="text-slate-600">•</span>
          <span>
            <strong className="text-white">Lucía P. (Córdoba):</strong>{' '}
            <span className="text-emerald-400">+$485.000 ARS</span> en Ruleta Argentina
          </span>
          <span className="text-slate-600">•</span>
          <span>
            <strong className="text-white">Emiliano G. (Rosario):</strong>{' '}
            <span className="text-emerald-400">+$75.000 ARS</span> en AstroCrash (12.4x)
          </span>
          <span className="text-slate-600">•</span>
          <span>
            <strong className="text-white">Carla M. (Mendoza):</strong>{' '}
            <span className="text-emerald-400">+$250.000 ARS</span> en Blackjack VIP
          </span>
        </div>
      </div>

      {/* CATEGORY SELECTOR & SEARCH */}
      <div className="space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-bold'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search & Provider Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar juego por título o proveedor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-medium">Proveedor:</span>
            <select
              value={providerFilter}
              onChange={e => setProviderFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">Todos los Proveedores</option>
              <option value="RoyalPlay Originals">RoyalPlay Originals (Demo interactiva)</option>
              <option value="Pragmatic Play">Pragmatic Play</option>
              <option value="Evolution Gaming">Evolution Gaming</option>
            </select>
          </div>
        </div>
      </div>

      {/* GAMES GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold font-serif-luxury text-amber-200 flex items-center gap-2">
            <span>Catálogo de Juegos</span>
            <span className="text-xs font-mono-tech px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {filteredGames.length} juegos disponibles
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredGames.map(game => {
            const isOriginal = game.provider === 'RoyalPlay Originals';
            return (
              <div
                key={game.id}
                className="group relative bg-[#0c1220] rounded-2xl border border-slate-800/80 hover:border-amber-500/50 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl hover:scale-[1.01] flex flex-col justify-between"
              >
                {/* Visual Thumbnail Card */}
                <div className="relative h-44 bg-gradient-to-br from-slate-900 via-slate-800 to-[#121c2d] flex items-center justify-center p-4 overflow-hidden">
                  {/* Subtle Background Pattern */}
                  <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(#f59e0b_1px,transparent_1px)] bg-[size:16px_16px]"></div>

                  {/* Badges on Top */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {game.tag && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                        {game.tag}
                      </span>
                    )}
                    {game.featured && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                        DESTACADO
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-900/80 text-emerald-400 text-[10px] font-mono-tech font-bold border border-slate-700">
                      RTP {game.rtp}%
                    </span>
                  </div>

                  {/* Center Visual Art / Icon */}
                  <div className="text-center z-10 group-hover:scale-110 transition-transform duration-300">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-4xl mx-auto shadow-inner">
                      {game.category === 'slots' ? '🎰' : game.category === 'roulette' ? '🎡' : game.category === 'blackjack' ? '🃏' : game.category === 'crash' ? '🚀' : '🎙️'}
                    </div>
                  </div>

                  {/* Hover Overlay with Action Button */}
                  <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center p-4 gap-2 z-20">
                    <button
                      onClick={() => setActiveGame(game)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold font-serif-luxury text-xs tracking-wider shadow-lg hover:brightness-110 transition flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>{isOriginal ? 'JUGAR AHORA' : 'DEMO PROVEEDOR'}</span>
                    </button>
                    <span className="text-[10px] text-slate-400">
                      Apuesta: ${game.minBet.toLocaleString('es-AR')} - ${game.maxBet.toLocaleString('es-AR')} ARS
                    </span>
                  </div>
                </div>

                {/* Card Info Footer */}
                <div className="p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-100 group-hover:text-amber-300 transition truncate">
                      {game.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate">{game.provider}</span>
                    <span className="text-slate-500 font-mono-tech">Volatilidad: {game.volatility}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ROYALPLAY ADVANCED SECURITY & TECHNOLOGY PILLARS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
        <div
          onClick={() => setCurrentView('secure_messages')}
          className="p-5 rounded-2xl bg-[#0c1424] border border-cyan-500/30 hover:border-cyan-400/60 cursor-pointer transition shadow-lg group"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-105 transition-transform">
            <Lock className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-cyan-300 font-serif-luxury">Mensajería Cifrada AES-256-GCM</h4>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Módulo criptográfico integrado para intercambiar información confidencial sin intermediarios. Cifrado
            con derivación PBKDF2 y etiqueta de autenticación GCM.
          </p>
          <span className="text-[11px] text-cyan-400 font-semibold mt-3 inline-block">Abrir Cipher Studio →</span>
        </div>

        <div
          onClick={() => setCurrentView('wallet')}
          className="p-5 rounded-2xl bg-[#0c1424] border border-emerald-500/30 hover:border-emerald-400/60 cursor-pointer transition shadow-lg group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-emerald-300 font-serif-luxury">Billetera en Pesos (ARS) & Pagos</h4>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Depósitos instantáneos vía Mercado Pago y transferencias bancarias 3.0 (CBU/CVU).
            Gestión segura de saldo real, bonos y retiros con acreditación verificada.
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold mt-3 inline-block">Gestionar Billetera ARS →</span>
        </div>

        <div
          onClick={() => setCurrentView('responsible_gaming')}
          className="p-5 rounded-2xl bg-[#0c1424] border border-rose-500/30 hover:border-rose-400/60 cursor-pointer transition shadow-lg group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-rose-300 font-serif-luxury">Juego Responsable & Regulación</h4>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Protección de jugadores con límites diarios de depósito, recordatorios de tiempo de sesión (reality check),
            periodo de pausa y registro formal de autoexclusión.
          </p>
          <span className="text-[11px] text-rose-400 font-semibold mt-3 inline-block">Ver Centro de Control +18 →</span>
        </div>
      </div>
    </div>
  );
};
