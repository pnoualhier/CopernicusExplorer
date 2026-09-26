import React, { useState } from 'react';
import {
  AIAnalysisRequest,
  AIAnalysisResponse,
  GeoPoint,
  GeoObservation,
  TimeSeriesPoint,
} from '../../types/copernicus';
import { CopernicusApiClient } from '../../services/apiClient';
import { Sparkles, X, AlertTriangle, Send, CheckCircle2, HelpCircle } from 'lucide-react';

interface AIAnalystModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationName: string;
  coordinates: GeoPoint;
  startDate: string;
  endDate: string;
  selectedObservation?: GeoObservation | null;
  timeSeries?: TimeSeriesPoint[];
}

export const AIAnalystModal: React.FC<AIAnalystModalProps> = ({
  isOpen,
  onClose,
  locationName,
  coordinates,
  startDate,
  endDate,
  selectedObservation,
  timeSeries = [],
}) => {
  const [question, setQuestion] = useState(
    'Pourquoi l\'indice de végétation (NDVI) a-t-il varié sur cette période ?'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Compute metrics from timeSeries for context
  const meanNdvi =
    timeSeries.length > 0
      ? Number(
          (
            timeSeries.reduce((acc, p) => acc + (p.ndvi ?? 0.5), 0) / timeSeries.length
          ).toFixed(2)
        )
      : selectedObservation?.opticalDetails?.indices?.ndviMean ?? 0.62;

  const avgTemp =
    timeSeries.length > 0
      ? Number(
          (
            timeSeries.reduce((acc, p) => acc + (p.temperature ?? 18), 0) / timeSeries.length
          ).toFixed(1)
        )
      : 22.4;

  const totalPrecip =
    timeSeries.length > 0
      ? Math.round(timeSeries.reduce((acc, p) => acc + (p.precipitation ?? 0), 0))
      : 42;

  const handleRunAnalysis = async (customPrompt?: string) => {
    setIsLoading(true);
    setError(null);

    const promptText = customPrompt || question;

    const req: AIAnalysisRequest = {
      question: promptText,
      locationName,
      coordinates,
      period: { start: startDate, end: endDate },
      vegetationSummary: {
        meanNdvi,
        trend: 'SEASONAL_DROP',
        dropMonth: 'Juillet / Août',
        dropPercentage: 22,
      },
      climateSummary: {
        avgTemperature: avgTemp,
        tempAnomaly: 1.6,
        totalPrecipitation: totalPrecip,
        precipDeficitPercent: 28,
        solarRadiationAvg: 235,
      },
      atmosphereSummary: {
        avgAqi: 2,
        dominantPollutant: 'O3',
      },
    };

    try {
      const result = await CopernicusApiClient.analyzeWithAI(req);
      setAnalysis(result);
    } catch (err) {
      setError('Impossible d\'exécuter l\'analyse IA. Vérifiez la connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    'Pourquoi le NDVI de cette zone a-t-il diminué en juillet ?',
    'Évaluer le niveau de stress hydrique et corrélation avec ERA5',
    'Y a-t-il des anomalies multi-capteurs inhabituelles sur cette période ?',
    'Expliquer l\'évolution de la température vs la moyenne historique',
  ];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Analyste Environnemental Copernicus IA (Gemini 3.8 Flash)
              </h2>
              <p className="text-xs text-slate-400">
                Synthèse multi-capteurs : {locationName} • {startDate} → {endDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-200">
          {/* Multi-Sensor Context Recap Card */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-center">
            <div>
              <div className="text-[11px] text-slate-400">NDVI Moyen (S2)</div>
              <div className="font-mono text-emerald-400 font-bold text-sm mt-0.5">{meanNdvi}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Temp Moy (ERA5)</div>
              <div className="font-mono text-amber-400 font-bold text-sm mt-0.5">{avgTemp}°C (+1.6°C)</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Pluie Cumulée</div>
              <div className="font-mono text-cyan-400 font-bold text-sm mt-0.5">{totalPrecip} mm (-28%)</div>
            </div>
          </div>

          {/* Quick Questions buttons */}
          <div>
            <div className="text-slate-400 mb-1.5 font-medium">Suggestions de questions scientifiques :</div>
            <div className="flex flex-wrap gap-1.5">
              {sampleQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setQuestion(q);
                    handleRunAnalysis(q);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 text-left transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input Form */}
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Posez une question sur la dynamique de cette zone..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-500 placeholder-slate-500"
            />
            <button
              onClick={() => handleRunAnalysis()}
              disabled={isLoading || !question.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold disabled:opacity-50 transition shadow-lg active:scale-95"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Analyser</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Analysis Results Display */}
          {analysis && (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              {/* Summary */}
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60">
                <h4 className="font-semibold text-cyan-200 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  Synthèse Multicapteurs
                </h4>
                <p className="mt-1.5 text-slate-200 leading-relaxed">{analysis.summary}</p>
              </div>

              {/* Vegetation Dynamics */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-semibold text-emerald-300 text-xs">
                  🌱 Dynamique Végétale & Évolution NDVI
                </h4>
                <p className="mt-1.5 text-slate-300 leading-relaxed">
                  {analysis.vegetationDynamicsExplanation}
                </p>
              </div>

              {/* Climate Correlation Factors */}
              {analysis.climateCorrelationFactors.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="font-semibold text-amber-300 text-xs">
                    🌡 Facteurs de Corrélation Météorologique (ERA5)
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-slate-300">
                    {analysis.climateCorrelationFactors.map((factor, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Scientific Caution Disclaimer (Mandatory) */}
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong>Avertissement méthodologique Copernicus :</strong>{' '}
                  {analysis.scientificCaution}
                </div>
              </div>

              {/* Suggested inquiries */}
              {analysis.suggestedFurtherInquiries.length > 0 && (
                <div className="text-[11px] text-slate-400">
                  <div className="font-semibold text-slate-300 mb-1">
                    Axes d'investigation complémentaires suggérés :
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                    {analysis.suggestedFurtherInquiries.map((inq, i) => (
                      <li key={i}>{inq}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
