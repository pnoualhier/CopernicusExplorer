import React from 'react';
import { AnalysisProject } from '../../types/project';
import { CopernicusLogo } from '../common/CopernicusLogo';
import {
  FileText,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  MapPin,
  Satellite,
  ArrowLeft,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

interface Step6ReportProps {
  project: AnalysisProject;
  onPrevStep: () => void;
  onGoToStep: (step: any) => void;
  onExportGeoJson: () => void;
}

export const Step6Report: React.FC<Step6ReportProps> = ({
  project,
  onPrevStep,
  onGoToStep,
  onExportGeoJson,
}) => {
  const { report, zone, dataConfig, analyses, results } = project;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    const mdContent = `# ${report.title}

**Programme Spatial Européen Copernicus • Union Européenne / ESA**  
*Date de génération : ${new Date().toLocaleDateString('fr-FR')}*  
*Auteur : ${project.author}*

---

## 1. Fiche d'Identité de la Zone d'Étude
- **Nom du secteur** : ${zone.name} (${zone.region})
- **Emprise Bounding Box (WGS84)** : [${zone.bbox.west}, ${zone.bbox.south}, ${zone.bbox.east}, ${zone.bbox.north}]
- **Superficie estimée** : ~${zone.areaKm2} km²
- **Altitude moyenne** : ~${zone.elevationAvgMeters} m
- **Écorégion** : ${zone.ecoregion}

---

## 2. Données & Méthodologie
- **Période temporelle** : ${dataConfig.startDate} → ${dataConfig.endDate}
- **Capteurs satellitaires** : ${dataConfig.missions.join(', ')}
- **Niveau de traitement** : ${dataConfig.processingLevel}
- **Fournisseur** : ${dataConfig.provider}
- **Scènes analysées** : ${dataConfig.acquiredScenesCount} passages

${report.methodology}

---

## 3. Résumé Exécutif
${report.executiveSummary}

---

## 4. Résultats & Trajectoire Décennale
- **NDVI Référence (${results.baselineYear})** : ${results.baselineNdvi}
- **NDVI Crise (${results.targetYear})** : ${results.targetNdvi} (Chute de ${Math.round(((results.targetNdvi - results.baselineNdvi) / results.baselineNdvi) * 100)}%)
- **NDVI Récent (${results.recentYear})** : ${results.recentNdvi} (Régénération à ${Math.round((results.recentNdvi / results.baselineNdvi) * 100)}%)

### Bilan Annuel Synthétique :
| Année | NDVI | NDWI | Température ERA5 | Précipitations | NO2 CAMS | Statut |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${results.yearlyStats
  .map(
    (s) =>
      `| ${s.year} | ${s.meanNdvi} | ${s.meanNdwi} | ${s.meanTempC}°C | ${s.totalPrecipMm} mm | ${s.no2Avg} | ${s.vegetationStatus} |`
  )
  .join('\n')}

---

## 5. Événements Extrêmes Identifiés
${analyses.detectedEvents
  .map(
    (e) => `### ${e.title} (${e.period})
- **Sévérité** : ${e.severity}
- **Impact NDVI** : ${e.impactNdviPercent}%
- **Anomalie Température** : +${e.deltaTempC}°C
- **Déficit Pluviométrique** : ${e.deficitPrecipPercent}%
${e.description}
`
  )
  .join('\n')}

---

## 6. Conclusions & Recommandations
${report.conclusions}

### Recommandations Opérationnelles :
${report.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

---

*Citation officielle : ${report.citation}*
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rapport_Copernicus_${project.id}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Projet_Copernicus_${project.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Action Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            <span>Étape 6 : Rapport Final d'Analyse Scientifique</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">
            Dossier d'Expertise Environnementale Prêt
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Document officiel intégrant cartographie, séries temporelles et recommandations d'action.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer / PDF</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Markdown (.md)</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Projet (.json)</span>
          </button>

          <button
            onClick={onExportGeoJson}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Données SIG</span>
          </button>
        </div>
      </div>

      {/* Official Report Document Paper Sheet */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-lg space-y-8 text-slate-800 dark:text-slate-100 max-w-4xl mx-auto">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <CopernicusLogo className="w-12 h-12 flex-shrink-0" />
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-400 font-bold">
                Programme Européen d'Observation de la Terre
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
                {report.title}
              </h1>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                Réf. Projet : {project.id.toUpperCase()} • Version 1.2.0 • Date : {new Date().toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-right self-start">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Statut Document</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-end">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Certifié Scientifique</span>
            </span>
          </div>
        </div>

        {/* Section 1: Cadre Géographique & Périmètre */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase font-mono tracking-wider text-cyan-600 dark:text-cyan-400 border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>1. Cadre Géographique & Zone d'Étude</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Localisation</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{zone.name}</span>
              <span className="text-[11px] text-slate-500 block">{zone.region}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Emprise / Superficie</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">~{zone.areaKm2} km²</span>
              <span className="text-[11px] text-slate-500 font-mono block">[{zone.bbox.west}, {zone.bbox.south}, {zone.bbox.east}, {zone.bbox.north}]</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Écosystème & Altitude</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">~{zone.elevationAvgMeters} m alt.</span>
              <span className="text-[11px] text-slate-500 block">{zone.ecoregion}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Résumé Exécutif */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase font-mono tracking-wider text-cyan-600 dark:text-cyan-400 border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>2. Résumé Exécutif & Synthèse d'Observation</span>
          </h3>

          <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-200 bg-cyan-50/40 dark:bg-cyan-950/20 p-4 rounded-xl border border-cyan-200 dark:border-cyan-800/40">
            {report.executiveSummary}
          </p>
        </div>

        {/* Section 3: Données & Méthodologie */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase font-mono tracking-wider text-cyan-600 dark:text-cyan-400 border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center gap-2">
            <Satellite className="w-4 h-4" />
            <span>3. Traçabilité des Données & Méthodes de Calcul</span>
          </h3>

          <div className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 space-y-2">
            <p>{report.methodology}</p>
            <div className="flex items-center gap-2 flex-wrap pt-1 font-mono text-[11px] text-slate-500">
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                Période : {dataConfig.startDate} → {dataConfig.endDate}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {dataConfig.acquiredScenesCount} passages orbitaux
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                Résolution : {dataConfig.resolutionMeters}m
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Tableau de bord des résultats décennaux */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase font-mono tracking-wider text-cyan-600 dark:text-cyan-400 border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>4. Données Temporelles & Comparatif Annuel</span>
          </h3>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-950 font-mono text-[10px] uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-2.5">Année</th>
                  <th className="p-2.5">NDVI (Végétation)</th>
                  <th className="p-2.5">NDWI (Eau)</th>
                  <th className="p-2.5">Température ERA5</th>
                  <th className="p-2.5">Pluie Cumulée</th>
                  <th className="p-2.5">Diagnostic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                {results.yearlyStats.map((st) => (
                  <tr key={st.year} className={st.year === 2022 ? 'bg-rose-50/50 dark:bg-rose-950/20 font-bold' : ''}>
                    <td className="p-2.5 font-bold">{st.year}</td>
                    <td className="p-2.5 text-emerald-600 dark:text-emerald-400">{st.meanNdvi}</td>
                    <td className="p-2.5 text-blue-600 dark:text-blue-400">{st.meanNdwi}</td>
                    <td className="p-2.5 text-amber-600 dark:text-amber-400">{st.meanTempC}°C</td>
                    <td className="p-2.5">{st.totalPrecipMm} mm</td>
                    <td className="p-2.5 font-sans text-[11px] text-slate-600 dark:text-slate-300">{st.vegetationStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: Recommandations Opérationnelles */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase font-mono tracking-wider text-cyan-600 dark:text-cyan-400 border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>5. Recommandations d'Action & Gestion Territoriale</span>
          </h3>

          <div className="space-y-2">
            {report.recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
              >
                <span className="w-5 h-5 rounded-full bg-cyan-600 text-white font-mono text-[10px] flex items-center justify-center flex-shrink-0 font-bold">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Document Footer Signature */}
        <div className="pt-6 border-t-2 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <div>
            <div>{report.citation}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Données ouvertes sous licence CC-BY 4.0 Copernicus</div>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Rapport Scientifique Finalisé</span>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <button
          onClick={onPrevStep}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Précédent : Résultats</span>
        </button>

        <button
          onClick={() => onGoToStep('project')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 transition"
        >
          <span>Retour au sélecteur de projets</span>
        </button>
      </div>
    </div>
  );
};
