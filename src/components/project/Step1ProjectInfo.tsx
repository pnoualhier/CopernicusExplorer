import React, { useState } from 'react';
import { AnalysisProject } from '../../types/project';
import {
  FolderKanban,
  Calendar,
  User,
  Tag,
  ArrowRight,
  PlusCircle,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Edit3,
  Layers,
} from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

interface Step1ProjectInfoProps {
  project: AnalysisProject;
  projects: AnalysisProject[];
  onSelectProject: (id: string) => void;
  onUpdateProject: (updated: AnalysisProject) => void;
  onCreateProject: () => void;
  onNextStep: () => void;
  onResetDefaults: () => void;
}

export const Step1ProjectInfo: React.FC<Step1ProjectInfoProps> = ({
  project,
  projects,
  onSelectProject,
  onUpdateProject,
  onCreateProject,
  onNextStep,
  onResetDefaults,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [theme, setTheme] = useState(project.theme);

  const handleSave = () => {
    onUpdateProject({
      ...project,
      title,
      description,
      theme,
      updatedAt: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  const themeLabels: Record<AnalysisProject['theme'], { label: string; color: string }> = {
    VEGETATION: { label: 'Végétation & Agriculture', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' },
    CLIMATE_RISK: { label: 'Risques Climatiques & Sécheresse', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
    HYDROLOGY: { label: 'Hydrologie & Lagunes', color: 'text-blue-500 bg-blue-500/10 border-blue-500/30' },
    FORESTRY: { label: 'Forêt & Incendies', color: 'text-orange-500 bg-orange-500/10 border-orange-500/30' },
    URBAN_HEAT: { label: 'Îlots de Chaleur Urbains', color: 'text-purple-500 bg-purple-500/10 border-purple-500/30' },
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Project Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
              <FolderKanban className="w-4 h-4" />
              <span>Étape 1 : Conception & Métadonnées du Projet</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">
              Bibliothèque des Projets d'Analyse
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sélectionnez un projet d'observation de la Terre ou créez votre propre étude personnalisée.
            </p>
          </div>

          {/* Action buttons: New Project / Reset */}
          <div className="flex items-center gap-2">
            <button
              onClick={onCreateProject}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nouveau Projet</span>
            </button>
            <Tooltip content="Réinitialiser les projets types (Toulouse, Gironde, Camargue)">
              <button
                onClick={onResetDefaults}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Projects Cards Carousel/Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
          {projects.map((p) => {
            const isSelected = p.id === project.id;
            const themeInfo = themeLabels[p.theme] || themeLabels.VEGETATION;

            return (
              <div
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                className={`p-4 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-50/60 dark:bg-cyan-950/30 border-cyan-500 shadow-sm ring-1 ring-cyan-500/50'
                    : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${themeInfo.color}`}>
                      {themeInfo.label}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-mono font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Actif</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{p.zone.name.split('&')[0]}</span>
                  <span>{p.dataConfig.startDate.slice(0, 4)} → {p.dataConfig.endDate.slice(0, 4)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Project Details Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
              <FolderKanban className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Fiche d'Identité du Projet Actif
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paramètres d'encadrement scientifique et périmètre d'analyse
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (isEditing) handleSave();
              else {
                setTitle(project.title);
                setDescription(project.description);
                setTheme(project.theme);
                setIsEditing(true);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Enregistrer les modifications' : 'Modifier les métadonnées'}</span>
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-4 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Titre de l'étude
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description & Problématique scientifique
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Thématique principale
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as AnalysisProject['theme'])}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-cyan-500"
              >
                <option value="VEGETATION">Végétation & Agriculture</option>
                <option value="CLIMATE_RISK">Risques Climatiques & Sécheresse</option>
                <option value="HYDROLOGY">Hydrologie & Lagunes</option>
                <option value="FORESTRY">Forêt & Incendies</option>
                <option value="URBAN_HEAT">Îlots de Chaleur Urbains</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {project.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {project.description}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-mono uppercase text-slate-400">Thématique</div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {themeLabels[project.theme]?.label || project.theme}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-mono uppercase text-slate-400">Zone d'étude</div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                  {project.zone.name}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-mono uppercase text-slate-400">Période d'étude</div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 font-mono">
                  {project.dataConfig.startDate.slice(0, 4)} → {project.dataConfig.endDate.slice(0, 4)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-mono uppercase text-slate-400">Responsable</div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                  {project.author}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Next Button */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Étape 1 sur 6 validée • Prêt à explorer la zone d'étude
          </span>

          <button
            onClick={onNextStep}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 transition active:scale-95"
          >
            <span>Passer à la Zone d'étude</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
