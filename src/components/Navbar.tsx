import React from 'react';
import { Sprout, Plus, Droplets } from 'lucide-react';

interface NavbarProps {
  onAddPlant: () => void;
  totalPlants: number;
  urgentCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onAddPlant,
  totalPlants,
  urgentCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-sm shadow-emerald-700/20">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
              Plant Tracker
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 hidden sm:inline-block">
                MVP
              </span>
            </h1>
            <p className="text-xs text-stone-500 hidden sm:block">
              Indoor watering schedules & room management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {totalPlants > 0 && urgentCount > 0 && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
              <Droplets className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
              <span>{urgentCount} {urgentCount === 1 ? 'plant needs' : 'plants need'} water</span>
            </div>
          )}

          <button
            onClick={onAddPlant}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm shadow-sm shadow-emerald-800/20 active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Plant</span>
          </button>
        </div>
      </div>
    </header>
  );
};
