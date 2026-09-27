import React from 'react';
import {
  X,
  RefreshCw,
  Zap,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Laptop,
  Layers,
  History,
  Info,
} from 'lucide-react';
import { useAutoUpdater } from '../../hooks/useAutoUpdater';
import { useTheme } from '../../context/ThemeContext';
import { CopernicusLogo } from '../common/CopernicusLogo';

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  updater: ReturnType<typeof useAutoUpdater>;
}

export const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({
  isOpen,
  onClose,
  updater,
}) => {
  const { theme, setTheme } = useTheme();

  const {
    currentVersion,
    releaseDate,
    latestVersion,
    lastChecked,
    isChecking,
    isForcing,
    updateAvailable,
    backgroundInstalled,
    updateMessage,
    autoUpdateEnabled,
    intervalMinutes,
    changelog,
    checkForUpdates,
    forceUpdate,
    setAutoUpdateEnabled,
    setIntervalMinutes,
  } = updater;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <CopernicusLogo className="w-8 h-8" />
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Paramètres Système & Mises à Jour
              </h2>
              <p className="text-xs text-slate-400">
                Gestion des versions, actualisations en arrière-plan et préférences d'affichage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Versioning & Status Box */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-100">
                    Copernicus Explorer
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                    v{currentVersion}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                    Production LTS
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Architecture PWA unifiée • Connecteurs CDSE STAC, ECMWF ERA5, CAMS & CARTO
                </p>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 self-start sm:self-auto">
                {backgroundInstalled ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-xs font-semibold text-cyan-300">
                      Mise à jour prête
                    </span>
                  </>
                ) : updateAvailable ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-xs font-semibold text-amber-300">
                      Nouvelle version v{latestVersion}
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-300">
                      Système à jour
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Release Date & Last Checked Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                <Calendar className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">
                    Date de sortie
                  </div>
                  <div className="text-xs font-semibold text-slate-200 mt-0.5">
                    {releaseDate}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">
                    Dernière vérification
                  </div>
                  <div className="text-xs font-semibold text-slate-200 mt-0.5 font-mono">
                    {lastChecked || 'À l\'instant'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons: Check Updates & Force Update */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 mt-2">
              <button
                onClick={() => checkForUpdates(false)}
                disabled={isChecking || isForcing}
                className={`flex-1 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition active:scale-98 ${
                  isChecking
                    ? 'bg-cyan-900/50 text-cyan-300 cursor-wait'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                <span>{isChecking ? 'Vérification en cours...' : 'Vérifier les mises à jour'}</span>
              </button>

              <button
                onClick={forceUpdate}
                disabled={isForcing || isChecking}
                className={`flex-1 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition active:scale-98 ${
                  isForcing
                    ? 'bg-rose-950/40 text-rose-300 border-rose-800/60 cursor-wait'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700 hover:border-slate-600'
                }`}
                title="Vide les caches locaux et force le rechargement immédiat de l'application"
              >
                <Zap className={`w-4 h-4 text-amber-400 ${isForcing ? 'animate-bounce' : ''}`} />
                <span>{isForcing ? 'Réinitialisation des caches...' : 'Forcer la mise à jour'}</span>
              </button>
            </div>

            {/* Status Message Feedback */}
            {updateMessage && (
              <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>{updateMessage}</span>
              </div>
            )}
          </div>

          {/* Section 2: Automatic Background Updates */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Mises à jour automatiques en arrière-plan
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Vérifie silencieusement les nouvelles versions et les installe en tâche de fond.
                </p>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoUpdateEnabled}
                  onChange={(e) => setAutoUpdateEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>

            {autoUpdateEnabled && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Fréquence de vérification :</span>
                <select
                  value={intervalMinutes}
                  onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-cyan-500"
                >
                  <option value={5}>Toutes les 5 minutes</option>
                  <option value={15}>Toutes les 15 minutes (Recommandé)</option>
                  <option value={30}>Toutes les 30 minutes</option>
                  <option value={60}>Toutes les heures</option>
                </select>
              </div>
            )}
          </div>

          {/* Section 3: Theme Management (Dark / Light / System) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-1">
              <Sun className="w-4 h-4 text-amber-400" />
              Thème Visuel de l'Interface
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Basculez entre le thème sombre spatial et le thème clair haute lisibilité.
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition gap-2 ${
                  theme === 'dark'
                    ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Moon className="w-5 h-5 text-cyan-400" />
                <span>Thème Sombre</span>
              </button>

              <button
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition gap-2 ${
                  theme === 'light'
                    ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sun className="w-5 h-5 text-amber-400" />
                <span>Thème Clair</span>
              </button>

              <button
                onClick={() => setTheme('system')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition gap-2 ${
                  theme === 'system'
                    ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Laptop className="w-5 h-5 text-purple-400" />
                <span>Système (Auto)</span>
              </button>
            </div>
          </div>

          {/* Section 4: Changelog */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-cyan-400" />
              Journal des Modifications (Changelog)
            </h3>

            <div className="space-y-4">
              {changelog.map((log) => (
                <div key={log.version} className="border-l-2 border-cyan-500/60 pl-3 py-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">
                      Version {log.version}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {log.date}
                    </span>
                  </div>
                  <ul className="mt-1 space-y-1">
                    {log.highlights.map((h, i) => (
                      <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                        <span className="text-cyan-400 leading-none">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900 flex items-center justify-between text-xs text-slate-400">
          <span>Copernicus Earth Observation System • Licence Ouverte</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
