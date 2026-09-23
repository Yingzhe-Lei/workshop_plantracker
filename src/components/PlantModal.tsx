import React, { useState, useEffect } from 'react';
import { X, Sprout, MapPin, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Plant } from '../types';

interface PlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plantData: Omit<Plant, 'id'> & { id?: string }) => void;
  initialPlant?: Plant | null;
  existingRooms: string[];
}

const COMMON_PLANTS = [
  'Monstera Deliciosa',
  'Snake Plant',
  'Peace Lily',
  'Golden Pothos',
  'Fiddle Leaf Fig',
  'ZZ Plant',
  'Calathea',
  'Spider Plant',
];

const COMMON_ROOMS = [
  'Living Room',
  'Bedroom',
  'Kitchen',
  'Bathroom',
  'Office',
  'Balcony',
];

const INTERVAL_PRESETS = [
  { days: 3, label: '3 days (Ferns)' },
  { days: 7, label: '7 days (Weekly)' },
  { days: 10, label: '10 days' },
  { days: 14, label: '14 days (Bi-weekly)' },
  { days: 21, label: '21 days (Succulents)' },
];

export const PlantModal: React.FC<PlantModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPlant,
  existingRooms,
}) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [waterIntervalDays, setWaterIntervalDays] = useState<number | ''>(7);
  const [lastWateredDaysAgo, setLastWateredDaysAgo] = useState<number>(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialPlant) {
      setName(initialPlant.name);
      setLocation(initialPlant.location);
      setWaterIntervalDays(initialPlant.waterIntervalDays);
      const diffMs = Date.now() - new Date(initialPlant.lastWateredDate).getTime();
      const diffDays = Math.max(0, Math.round(diffMs / 86400000));
      setLastWateredDaysAgo(diffDays);
    } else {
      setName('');
      setLocation('');
      setWaterIntervalDays(7);
      setLastWateredDaysAgo(0);
    }
    setErrors({});
  }, [initialPlant, isOpen]);

  if (!isOpen) return null;

  // Combine default rooms with any custom rooms the user has already entered
  const roomSuggestions = Array.from(new Set([...COMMON_ROOMS, ...existingRooms]));

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Plant name is required.';
    }

    if (!location.trim()) {
      newErrors.location = 'Location / room is required.';
    }

    if (
      waterIntervalDays === '' ||
      isNaN(Number(waterIntervalDays)) ||
      Number(waterIntervalDays) < 1
    ) {
      newErrors.waterIntervalDays = 'Interval must be a whole number of at least 1 day.';
    } else if (Number(waterIntervalDays) > 365) {
      newErrors.waterIntervalDays = 'Interval must be 365 days or less.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Calculate last watered timestamp
    const lastWateredDate = new Date(Date.now() - lastWateredDaysAgo * 86400000).toISOString();

    onSave({
      ...(initialPlant ? { id: initialPlant.id } : {}),
      name: name.trim(),
      location: location.trim(),
      waterIntervalDays: Number(waterIntervalDays),
      lastWateredDate,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-stone-900">
              {initialPlant ? 'Edit Plant Details' : 'Add New Plant'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Plant Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Plant Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                placeholder="e.g. Monstera Deliciosa, Snake Plant..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                  errors.name
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                    : 'border-stone-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                }`}
              />
            </div>
            {errors.name && (
              <p className="mt-1 flex items-center gap-1 text-xs text-rose-600">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.name}
              </p>
            )}

            {/* Quick plant suggestions */}
            {!initialPlant && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {COMMON_PLANTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setName(p);
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 hover:bg-emerald-50 hover:text-emerald-800 transition-colors cursor-pointer"
                  >
                    + {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location / Room */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Location / Room <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="w-4 h-4 text-stone-400" />
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (errors.location) setErrors({ ...errors, location: '' });
                }}
                placeholder="e.g. Living Room, Bedroom, Balcony..."
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                  errors.location
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                    : 'border-stone-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                }`}
              />
            </div>
            {errors.location && (
              <p className="mt-1 flex items-center gap-1 text-xs text-rose-600">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.location}
              </p>
            )}

            {/* Quick room suggestion pills */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {roomSuggestions.map((room) => (
                <button
                  key={room}
                  type="button"
                  onClick={() => {
                    setLocation(room);
                    if (errors.location) setErrors({ ...errors, location: '' });
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    location.toLowerCase() === room.toLowerCase()
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {room}
                </button>
              ))}
            </div>
          </div>

          {/* Watering Interval in Days */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Watering Frequency (Every X Days) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="w-4 h-4 text-stone-400" />
              </div>
              <input
                type="number"
                min="1"
                max="365"
                step="1"
                value={waterIntervalDays}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10));
                  setWaterIntervalDays(val);
                  if (errors.waterIntervalDays) setErrors({ ...errors, waterIntervalDays: '' });
                }}
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                  errors.waterIntervalDays
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                    : 'border-stone-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                }`}
              />
            </div>
            {errors.waterIntervalDays && (
              <p className="mt-1 flex items-center gap-1 text-xs text-rose-600">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.waterIntervalDays}
              </p>
            )}

            {/* Interval Presets */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {INTERVAL_PRESETS.map((preset) => (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => {
                    setWaterIntervalDays(preset.days);
                    if (errors.waterIntervalDays) setErrors({ ...errors, waterIntervalDays: '' });
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    waterIntervalDays === preset.days
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Last Watered Date selection */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              When was it last watered?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Today', days: 0 },
                { label: 'Yesterday', days: 1 },
                { label: '3 days ago', days: 3 },
                { label: '7 days ago', days: 7 },
              ].map((opt) => (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => setLastWateredDaysAgo(opt.days)}
                  className={`py-1.5 px-2 text-xs rounded-lg border text-center transition-all cursor-pointer ${
                    lastWateredDaysAgo === opt.days
                      ? 'bg-emerald-600 text-white border-emerald-600 font-medium'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm shadow-emerald-700/20 active:scale-98 transition-all cursor-pointer"
            >
              {initialPlant ? 'Save Changes' : 'Add Plant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
