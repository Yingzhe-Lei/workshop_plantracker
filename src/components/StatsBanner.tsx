import React from 'react';
import { Droplet, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { PlantWithStatus } from '../types';

interface StatsBannerProps {
  plants: PlantWithStatus[];
  onWaterAllDue?: () => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ plants, onWaterAllDue }) => {
  const overdueCount = plants.filter((p) => p.computed.status === 'overdue').length;
  const dueTodayCount = plants.filter((p) => p.computed.status === 'due_today').length;
  const healthyCount = plants.filter((p) => p.computed.status === 'healthy').length;
  const totalDue = overdueCount + dueTodayCount;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
      {/* Due / Overdue Card */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          totalDue > 0
            ? 'bg-amber-50/70 border-amber-200/80 shadow-xs'
            : 'bg-white border-stone-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Needs Water
          </span>
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              totalDue > 0 ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-400'
            }`}
          >
            {overdueCount > 0 ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <Droplet className="w-4 h-4" />
            )}
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold ${
                totalDue > 0 ? 'text-amber-900' : 'text-stone-800'
              }`}
            >
              {totalDue}
            </span>
            <span className="text-xs text-stone-500">
              {overdueCount > 0
                ? `(${overdueCount} overdue, ${dueTodayCount} today)`
                : dueTodayCount > 0
                ? 'due today'
                : 'all quenched'}
            </span>
          </div>

          {totalDue > 0 && onWaterAllDue && (
            <button
              onClick={onWaterAllDue}
              className="text-xs font-semibold text-amber-800 hover:text-amber-900 bg-amber-100 hover:bg-amber-200/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              title="Mark all due plants as watered right now"
            >
              Water All
            </button>
          )}
        </div>
      </div>

      {/* Up to Date Card */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Healthy & Hydrated
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-stone-800">{healthyCount}</span>
          <span className="text-xs text-stone-500">
            {healthyCount === 1 ? 'plant happy' : 'plants happy'}
          </span>
        </div>
      </div>

      {/* Total Tracked Card */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Total Plants
          </span>
          <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-stone-800">{plants.length}</span>
          <span className="text-xs text-stone-500">indoor specimens</span>
        </div>
      </div>
    </div>
  );
};
