import React, { useState } from 'react';
import { usePWAInstall, useOnlineStatus } from './usePWAInstall';
import { Download, Smartphone, X, WifiOff } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-md bg-cyan-600 hover:bg-cyan-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition active:scale-95"
        title="Installer Copernicus Explorer sur votre appareil"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Installer l'App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-md border border-cyan-800/60 bg-cyan-950/40 hover:bg-cyan-900/60 px-2.5 py-1.5 text-xs font-medium text-cyan-200 transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span>Installer PWA (iOS)</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-semibold text-white">Installer sur iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ol className="mt-4 space-y-3 text-xs leading-relaxed text-slate-300">
                <li className="flex gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700 flex items-center justify-center font-bold">1</span>
                  <span>Touchez le bouton de <strong>Partage</strong> (icône avec la flèche vers le haut) dans la barre d'outils Safari.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700 flex items-center justify-center font-bold">2</span>
                  <span>Faites défiler le menu et sélectionnez <strong>Sur l'écran d'accueil</strong>.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700 flex items-center justify-center font-bold">3</span>
                  <span>Touchez <strong>Ajouter</strong> en haut à droite.</span>
                </li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-lg bg-slate-800 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg border border-amber-600/50 bg-amber-950/90 backdrop-blur-md px-3 py-2 text-xs font-medium text-amber-200 shadow-xl">
      <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
      <span>Mode hors-ligne : Données en cache local utilisées</span>
    </div>
  );
};
