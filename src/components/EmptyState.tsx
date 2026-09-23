import React from 'react';
import { Sprout, Plus, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onAddPlant: () => void;
  onLoadStarters: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onAddPlant,
  onLoadStarters,
}) => {
  return (
    <div className="py-16 px-6 text-center max-w-lg mx-auto bg-white rounded-3xl border border-stone-200/80 shadow-xs my-8">
      {/* Decorative Botanical graphic container */}
      <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 mb-5 shadow-xs">
        <Sprout className="w-10 h-10 stroke-[1.75]" />
      </div>

      <h3 className="text-xl font-bold text-stone-900 tracking-tight">
        No plants added yet
      </h3>

      <p className="mt-2 text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
        Keep your indoor house plants happy and hydrated. Track individual watering
        schedules across rooms and never forget when you last watered.
      </p>

      <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onAddPlant}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm shadow-sm shadow-emerald-800/20 active:scale-98 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Your First Plant</span>
        </button>

        <button
          onClick={onLoadStarters}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-700 font-medium text-sm transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Load 4 Starter Plants</span>
        </button>
      </div>

      {/* Helpful hint cards */}
      <div className="mt-10 pt-6 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
        <div className="p-3 rounded-xl bg-stone-50 text-xs">
          <span className="font-semibold text-stone-800 block mb-0.5">🌱 By Room</span>
          <span className="text-stone-500">Organize plants by Bedroom, Living Room, etc.</span>
        </div>
        <div className="p-3 rounded-xl bg-stone-50 text-xs">
          <span className="font-semibold text-stone-800 block mb-0.5">💧 1-Click Water</span>
          <span className="text-stone-500">Record today with a tap and reset schedules.</span>
        </div>
        <div className="p-3 rounded-xl bg-stone-50 text-xs">
          <span className="font-semibold text-stone-800 block mb-0.5">📦 Local Storage</span>
          <span className="text-stone-500">Your plants stay saved in your browser.</span>
        </div>
      </div>
    </div>
  );
};
