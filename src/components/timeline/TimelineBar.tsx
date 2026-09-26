import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';

interface TimelineBarProps {
  startDate: string;
  endDate: string;
  onChangeRange: (start: string, end: string) => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
}

export const TimelineBar: React.FC<TimelineBarProps> = ({
  startDate,
  endDate,
  onChangeRange,
  isPlaying = false,
  onTogglePlay,
}) => {
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

  const handleSelectYear = (year: number) => {
    onChangeRange(`${year}-01-01`, `${year}-12-31`);
  };

  const handlePreset = (preset: '30d' | '90d' | '1y' | '5y') => {
    const end = new Date();
    let start = new Date();

    if (preset === '30d') {
      start.setDate(end.getDate() - 30);
    } else if (preset === '90d') {
      start.setDate(end.getDate() - 90);
    } else if (preset === '1y') {
      start.setFullYear(end.getFullYear() - 1);
    } else if (preset === '5y') {
      start.setFullYear(end.getFullYear() - 5);
    }

    onChangeRange(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
  };

  const stepDate = (direction: 'back' | 'forward') => {
    const s = new Date(startDate);
    const e = new Date(endDate);
    const days = Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
    const shift = direction === 'back' ? -days : days;

    s.setDate(s.getDate() + shift);
    e.setDate(e.getDate() + shift);

    onChangeRange(s.toISOString().split('T')[0], e.toISOString().split('T')[0]);
  };

  return (
    <div className="w-full bg-slate-900/95 border-t border-slate-800 p-2 sm:p-3 text-slate-200 select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Controls: Play, Step, Presets */}
        <div className="flex items-center gap-2">
          {onTogglePlay && (
            <button
              onClick={onTogglePlay}
              className={`p-1.5 rounded-lg border transition ${
                isPlaying
                  ? 'bg-cyan-600 text-white border-cyan-500 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title={isPlaying ? 'Pause' : 'Lecture temporelle'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          )}

          <div className="flex items-center rounded-lg bg-slate-800/80 border border-slate-700 p-0.5">
            <button
              onClick={() => stepDate('back')}
              className="p-1 hover:text-white text-slate-400 rounded transition"
              title="Période précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => stepDate('forward')}
              className="p-1 hover:text-white text-slate-400 rounded transition"
              title="Période suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick presets */}
          <div className="hidden sm:flex items-center gap-1 text-xs">
            <button
              onClick={() => handlePreset('30d')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60"
            >
              30j
            </button>
            <button
              onClick={() => handlePreset('90d')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60"
            >
              Saison (90j)
            </button>
            <button
              onClick={() => handlePreset('1y')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60"
            >
              1 An
            </button>
            <button
              onClick={() => handlePreset('5y')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60"
            >
              5 Ans
            </button>
          </div>
        </div>

        {/* Visual Year Scrubber Bar */}
        <div className="flex-1 w-full max-w-xl mx-2">
          <div className="relative flex items-center justify-between text-[11px] text-slate-400 py-1">
            {/* Horizontal line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-700 -translate-y-1/2 z-0" />

            {/* Year markers */}
            {years.map((y) => {
              const yearStart = `${y}-01-01`;
              const isSelected = startDate.startsWith(String(y)) || (startDate <= yearStart && endDate >= `${y}-12-31`);

              return (
                <button
                  key={y}
                  onClick={() => handleSelectYear(y)}
                  className={`relative z-10 flex flex-col items-center group transition active:scale-95`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      isSelected
                        ? 'bg-cyan-400 scale-125 ring-4 ring-cyan-500/30'
                        : 'bg-slate-600 group-hover:bg-slate-400'
                    }`}
                  />
                  <span
                    className={`mt-1 font-mono text-[10px] ${
                      isSelected ? 'font-bold text-cyan-300' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  >
                    {y}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Explicit Date Inputs */}
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="w-3.5 h-3.5 text-cyan-400 hidden sm:inline" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => onChangeRange(e.target.value, endDate)}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs outline-none focus:border-cyan-500 font-mono"
          />
          <span className="text-slate-500 font-mono">→</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onChangeRange(startDate, e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>
    </div>
  );
};
