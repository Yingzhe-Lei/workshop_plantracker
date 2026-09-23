import React from 'react';
import { Search, Filter, Droplets, CheckCircle, SlidersHorizontal } from 'lucide-react';
import { UrgencyFilter } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedRoom: string;
  onRoomChange: (room: string) => void;
  availableRooms: string[];
  urgencyFilter: UrgencyFilter;
  onUrgencyFilterChange: (u: UrgencyFilter) => void;
  urgentCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedRoom,
  onRoomChange,
  availableRooms,
  urgencyFilter,
  onUrgencyFilterChange,
  urgentCount,
}) => {
  return (
    <div className="space-y-3 mb-6">
      {/* Search and Urgency Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-stone-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search plants by name or room..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors placeholder:text-stone-400 shadow-2xs"
          />
        </div>

        {/* Urgency Filter pills */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100/90 rounded-xl border border-stone-200/80 self-start sm:self-auto shrink-0">
          <button
            onClick={() => onUrgencyFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              urgencyFilter === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All
          </button>

          <button
            onClick={() => onUrgencyFilterChange('needs_water')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              urgencyFilter === 'needs_water'
                ? 'bg-amber-500 text-white shadow-xs font-semibold'
                : 'text-stone-600 hover:text-amber-800'
            }`}
          >
            <Droplets className="w-3 h-3" />
            <span>Needs Water</span>
            {urgentCount > 0 && (
              <span
                className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  urgencyFilter === 'needs_water'
                    ? 'bg-white/20 text-white'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {urgentCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onUrgencyFilterChange('healthy')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              urgencyFilter === 'healthy'
                ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                : 'text-stone-600 hover:text-emerald-900'
            }`}
          >
            <CheckCircle className="w-3 h-3" />
            <span>Healthy</span>
          </button>
        </div>
      </div>

      {/* Room Tabs Row (only if rooms exist) */}
      {availableRooms.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar text-xs">
          <span className="text-stone-400 flex items-center gap-1 mr-1 shrink-0 font-medium">
            <Filter className="w-3 h-3" />
            <span>Room:</span>
          </span>

          <button
            onClick={() => onRoomChange('all')}
            className={`px-3 py-1 rounded-lg shrink-0 border transition-all cursor-pointer ${
              selectedRoom === 'all'
                ? 'bg-stone-900 text-white border-stone-900 font-medium'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            All Rooms
          </button>

          {availableRooms.map((room) => (
            <button
              key={room}
              onClick={() => onRoomChange(room)}
              className={`px-3 py-1 rounded-lg shrink-0 border transition-all cursor-pointer ${
                selectedRoom.toLowerCase() === room.toLowerCase()
                  ? 'bg-stone-900 text-white border-stone-900 font-medium'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {room}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
