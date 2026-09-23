import React, { useState } from 'react';
import { Droplets, MapPin, Calendar, Clock, Edit2, Trash2, Check, AlertCircle, Camera } from 'lucide-react';
import { PlantWithStatus } from '../types';

interface PlantCardProps {
  plant: PlantWithStatus;
  onWater: (plantId: string) => void;
  onWaterWithPhoto?: (plant: PlantWithStatus) => void;
  onEdit: (plant: PlantWithStatus) => void;
  onDelete: (plantId: string) => void;
}

export const PlantCard: React.FC<PlantCardProps> = ({
  plant,
  onWater,
  onWaterWithPhoto,
  onEdit,
  onDelete,
}) => {
  const [justWatered, setJustWatered] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const { status, statusLabel, formattedLastWatered, formattedNextDue, percentElapsed } = plant.computed;

  const handleWaterClick = () => {
    onWater(plant.id);
    setJustWatered(true);
    setTimeout(() => {
      setJustWatered(false);
    }, 1500);
  };

  // Styling configurations based on urgency
  const isOverdue = status === 'overdue';
  const isDueToday = status === 'due_today';
  const isUrgent = isOverdue || isDueToday;

  return (
    <div
      className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
        isOverdue
          ? 'border-rose-300 ring-1 ring-rose-200/70 shadow-sm hover:shadow-md'
          : isDueToday
          ? 'border-amber-300 ring-1 ring-amber-200/70 shadow-sm hover:shadow-md'
          : 'border-stone-200 hover:border-emerald-300 hover:shadow-md'
      }`}
    >
      {/* Top accent strip for urgent status */}
      {isOverdue && (
        <div className="h-1.5 w-full bg-rose-500" />
      )}
      {isDueToday && (
        <div className="h-1.5 w-full bg-amber-500" />
      )}
      {!isUrgent && (
        <div className="h-1.5 w-full bg-emerald-600/30 group-hover:bg-emerald-600 transition-colors" />
      )}

      <div className="p-5">
        {/* Header row: Name, Location, and Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-stone-900 truncate">
              {plant.name}
            </h3>
            
            <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-500">
              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span className="truncate font-medium text-stone-600">
                {plant.location}
              </span>
              <span className="text-stone-300">•</span>
              <span className="text-stone-500">
                Every {plant.waterIntervalDays} {plant.waterIntervalDays === 1 ? 'day' : 'days'}
              </span>
            </div>
          </div>

          {/* Action buttons (Edit & Delete) */}
          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(plant)}
              title="Edit plant details"
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowConfirmDelete(true)}
              title="Delete plant"
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Overlay */}
        {showConfirmDelete && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
            <span className="font-medium text-rose-800">Delete this plant?</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-2 py-1 text-stone-600 hover:text-stone-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(plant.id);
                  setShowConfirmDelete(false);
                }}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-medium cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Status Pill Badge */}
        <div className="mt-4 flex items-center justify-between">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isOverdue
                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                : isDueToday
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {isOverdue ? (
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            ) : isDueToday ? (
              <Droplets className="w-3.5 h-3.5 text-amber-600" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>{statusLabel}</span>
          </div>

          <span className="text-xs text-stone-400 font-mono">
            Due {formattedNextDue}
          </span>
        </div>

        {/* Schedule Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-stone-400 mb-1">
            <span>Cycle</span>
            <span>{percentElapsed}% elapsed</span>
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverdue
                  ? 'bg-rose-500'
                  : isDueToday
                  ? 'bg-amber-500'
                  : percentElapsed > 75
                  ? 'bg-emerald-500'
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.min(percentElapsed, 100)}%` }}
            />
          </div>
        </div>

        {/* Footer Details: Last Watered Date & Water Button */}
        <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
          <div className="text-xs text-stone-500">
            <div className="flex items-center gap-1 text-[11px] text-stone-400">
              <Calendar className="w-3 h-3" />
              <span>Last watered</span>
            </div>
            <div className="font-medium text-stone-700">
              {formattedLastWatered}
            </div>
          </div>

          {/* One-Click Water & Photo Action Buttons */}
          <div className="flex items-center gap-1.5">
            {onWaterWithPhoto && (
              <button
                type="button"
                onClick={() => onWaterWithPhoto(plant)}
                title="Water & attach photo for scatter graph"
                className="inline-flex items-center justify-center p-2 rounded-xl text-stone-600 hover:text-emerald-700 bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-200 transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleWaterClick}
              disabled={justWatered}
              className={`relative flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                justWatered
                  ? 'bg-emerald-600 text-white scale-98'
                  : isOverdue
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 active:scale-95'
                  : isDueToday
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20 active:scale-95'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 active:scale-95'
              }`}
            >
              {justWatered ? (
                <>
                  <Check className="w-3.5 h-3.5 animate-in zoom-in" />
                  <span>Watered! 💧</span>
                </>
              ) : (
                <>
                  <Droplets className="w-3.5 h-3.5" />
                  <span>Water Plant</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
