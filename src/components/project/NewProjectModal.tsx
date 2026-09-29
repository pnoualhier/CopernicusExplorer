import React, { useState } from 'react';
import { AnalysisProject } from '../../types/project';
import { PlusCircle, X, FolderKanban, MapPin, Tag } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (params: {
    title: string;
    description: string;
    theme: AnalysisProject['theme'];
    locationName?: string;
  }) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState<AnalysisProject['theme']>('VEGETATION');
  const [locationName, setLocationName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreate({
      title: title.trim(),
      description: description.trim() || 'Étude d\'observation de la Terre Copernicus.',
      theme,
      locationName: locationName.trim() || 'Zone d\'Étude Personnalisée',
    });

    setTitle('');
    setDescription('');
    setLocationName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
              <PlusCircle className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Nouveau Projet d'Analyse
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Initialiser une étude d'observation de la Terre Copernicus
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Titre du projet d'étude *
            </label>
            <input
              type="text"
              required
              placeholder="ex: Dynamique de la végétation autour de Nantes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nom du secteur ou ville de référence
            </label>
            <input
              type="text"
              placeholder="ex: Nantes Métropole / Estuaire de la Loire"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Thématique scientifique
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as AnalysisProject['theme'])}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-cyan-500"
            >
              <option value="VEGETATION">Végétation & Agriculture (Sentinel-2 NDVI)</option>
              <option value="CLIMATE_RISK">Risques Climatiques & Sécheresse (ERA5)</option>
              <option value="HYDROLOGY">Hydrologie & Lagunes (NDWI)</option>
              <option value="FORESTRY">Forêt & Résilience Incendies (NBR)</option>
              <option value="URBAN_HEAT">Îlots de Chaleur & Qualité de l'Air (CAMS)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Objectifs & Problématique
            </label>
            <textarea
              rows={3}
              placeholder="Décrivez les questions scientifiques posées par cette étude..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-cyan-500"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-md shadow-cyan-600/20 transition"
            >
              Créer le Projet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
