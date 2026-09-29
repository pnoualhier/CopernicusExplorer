import React, { useState } from 'react';
import { AnalysisProject, ProjectStep } from '../../types/project';
import { Step1ProjectInfo } from './Step1ProjectInfo';
import { Step2StudyArea } from './Step2StudyArea';
import { Step3DataSources } from './Step3DataSources';
import { Step4Analyses } from './Step4Analyses';
import { Step5Results } from './Step5Results';
import { Step6Report } from './Step6Report';
import {
  FolderKanban,
  MapPin,
  Database,
  Activity,
  BarChart3,
  FileText,
  ChevronRight,
  ChevronDown,
  PlusCircle,
  CheckCircle2,
} from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

interface ProjectWorkspaceProps {
  project: AnalysisProject;
  projects: AnalysisProject[];
  onSelectProject: (id: string) => void;
  onUpdateProject: (updated: AnalysisProject) => void;
  onCreateProject: () => void;
  onResetDefaults: () => void;
  onOpenAI: () => void;
  onExportGeoJson: () => void;
}

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({
  project,
  projects,
  onSelectProject,
  onUpdateProject,
  onCreateProject,
  onResetDefaults,
  onOpenAI,
  onExportGeoJson,
}) => {
  const [activeStep, setActiveStep] = useState<ProjectStep>('project');
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  const stepsList: {
    id: ProjectStep;
    number: number;
    title: string;
    subtitle: string;
    icon: any;
  }[] = [
    { id: 'project', number: 1, title: 'Projet', subtitle: 'Métadonnées', icon: FolderKanban },
    { id: 'zone', number: 2, title: 'Zone d\'étude', subtitle: 'Périmètre GPS', icon: MapPin },
    { id: 'data', number: 3, title: 'Données', subtitle: 'Sentinel & ERA5', icon: Database },
    { id: 'analyses', number: 4, title: 'Analyses', subtitle: 'NDVI & Anomalies', icon: Activity },
    { id: 'results', number: 5, title: 'Résultats', subtitle: 'Courbes & Bilans', icon: BarChart3 },
    { id: 'report', number: 6, title: 'Rapport', subtitle: 'Synthèse finale', icon: FileText },
  ];

  const currentStepIndex = stepsList.findIndex((s) => s.id === activeStep);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Project Ribbon & Stepper Navigation */}
      <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2.5 shadow-sm z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Active Project Selector dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500 bg-slate-50 dark:bg-slate-950 text-left transition"
            >
              <FolderKanban className="w-4 h-4 text-cyan-500 flex-shrink-0" />
              <div className="max-w-xs truncate">
                <div className="text-[10px] font-mono uppercase text-slate-400">
                  Projet Actif
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {project.title}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
            </button>

            {/* Dropdown Menu */}
            {isProjectDropdownOpen && (
              <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-2 space-y-1">
                <div className="text-[10px] font-mono uppercase text-slate-400 px-2 py-1">
                  Changer de projet d'étude :
                </div>
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectProject(p.id);
                      setIsProjectDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                      p.id === project.id
                        ? 'bg-cyan-600 text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{p.title}</span>
                    {p.id === project.id && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />}
                  </button>
                ))}
                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setIsProjectDropdownOpen(false);
                      onCreateProject();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 transition flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Créer un nouveau projet...</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Stepper Steps (Projet → Zone → Données → Analyses → Résultats → Rapport) */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {stepsList.map((step, idx) => {
              const isActive = step.id === activeStep;
              const isPast = idx < currentStepIndex;
              const StepIcon = step.icon;

              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => setActiveStep(step.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                      isActive
                        ? 'bg-cyan-600 text-white shadow-sm ring-1 ring-cyan-500'
                        : isPast
                        ? 'text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/30'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full text-[10px] font-mono flex items-center justify-center font-bold ${
                        isActive
                          ? 'bg-white text-cyan-700'
                          : isPast
                          ? 'bg-cyan-500/20 text-cyan-500'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {step.number}
                    </span>
                    <span className="hidden sm:inline font-semibold">{step.title}</span>
                  </button>
                  {idx < stepsList.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-700 flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Step Workspace Content Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 max-w-7xl mx-auto w-full">
        {activeStep === 'project' && (
          <Step1ProjectInfo
            project={project}
            projects={projects}
            onSelectProject={onSelectProject}
            onUpdateProject={onUpdateProject}
            onCreateProject={onCreateProject}
            onResetDefaults={onResetDefaults}
            onNextStep={() => setActiveStep('zone')}
          />
        )}

        {activeStep === 'zone' && (
          <Step2StudyArea
            project={project}
            onUpdateProject={onUpdateProject}
            onNextStep={() => setActiveStep('data')}
            onPrevStep={() => setActiveStep('project')}
          />
        )}

        {activeStep === 'data' && (
          <Step3DataSources
            project={project}
            onUpdateProject={onUpdateProject}
            onNextStep={() => setActiveStep('analyses')}
            onPrevStep={() => setActiveStep('zone')}
          />
        )}

        {activeStep === 'analyses' && (
          <Step4Analyses
            project={project}
            onUpdateProject={onUpdateProject}
            onNextStep={() => setActiveStep('results')}
            onPrevStep={() => setActiveStep('data')}
            onOpenAI={onOpenAI}
          />
        )}

        {activeStep === 'results' && (
          <Step5Results
            project={project}
            onUpdateProject={onUpdateProject}
            onNextStep={() => setActiveStep('report')}
            onPrevStep={() => setActiveStep('analyses')}
          />
        )}

        {activeStep === 'report' && (
          <Step6Report
            project={project}
            onPrevStep={() => setActiveStep('results')}
            onGoToStep={(s) => setActiveStep(s)}
            onExportGeoJson={onExportGeoJson}
          />
        )}
      </div>
    </div>
  );
};
