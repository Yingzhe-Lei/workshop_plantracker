import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Droplets, Calendar, Sparkles, Filter, Clock, Camera, Image as ImageIcon, Info } from 'lucide-react';
import { PlantWithStatus, WateringRecord } from '../types';
import { normalizeWateringHistory } from '../utils/imageUtils';

interface WateringScatterChartProps {
  plants: PlantWithStatus[];
}

const PALETTE = [
  '#059669', // Emerald
  '#0284c7', // Sky Blue
  '#d97706', // Amber
  '#7c3aed', // Violet
  '#0d9488', // Teal
  '#e11d48', // Rose
  '#4f46e5', // Indigo
  '#15803d', // Forest Green
  '#ea580c', // Terracotta
  '#ca8a04', // Golden Olive
];

interface ScatterPoint {
  x: number; // unix timestamp in ms
  y: number; // plant index
  plantId: string;
  plantName: string;
  location: string;
  interval: number;
  dateStr: string;
  relativeLabel: string;
  isProjected: boolean;
  color: string;
  imageUrl?: string;
  note?: string;
  hasPhoto: boolean;
}

export const WateringScatterChart: React.FC<WateringScatterChartProps> = ({ plants }) => {
  const [showProjectedNext, setShowProjectedNext] = useState(true);
  const [selectedPlantId, setSelectedPlantId] = useState<string>('all');

  // Filter plants if user singled out one plant
  const activePlants = useMemo(() => {
    if (selectedPlantId === 'all') return plants;
    return plants.filter((p) => p.id === selectedPlantId);
  }, [plants, selectedPlantId]);

  // Construct scatter points
  const { points, xDomain, yTicks, plantNamesMap, totalPhotos } = useMemo(() => {
    const pts: ScatterPoint[] = [];
    const now = new Date();
    const nowMs = now.getTime();
    const nameMap: { [index: number]: string } = {};
    let photoCount = 0;

    activePlants.forEach((plant, index) => {
      nameMap[index] = plant.name;
      const color = PALETTE[index % PALETTE.length];

      // Retrieve normalized watering records
      const records: WateringRecord[] = normalizeWateringHistory(plant);

      // If only 1 record exists, synthesize 2 previous cycles for a rich timeline
      if (records.length === 1) {
        const firstT = new Date(records[0].date).getTime();
        if (!isNaN(firstT)) {
          const intervalMs = plant.waterIntervalDays * 86400000;
          records.unshift({ date: new Date(firstT - intervalMs * 2).toISOString() });
          records.unshift({ date: new Date(firstT - intervalMs).toISOString() });
        }
      }

      // Sort chronologically
      records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Add past watering points
      records.forEach((record) => {
        const timestamp = new Date(record.date).getTime();
        if (isNaN(timestamp)) return;

        const d = new Date(timestamp);
        const dayDiff = Math.round((nowMs - timestamp) / 86400000);
        let rel = `${dayDiff} days ago`;
        if (dayDiff === 0) rel = 'Today';
        else if (dayDiff === 1) rel = 'Yesterday';
        else if (dayDiff < 0) rel = `In ${Math.abs(dayDiff)} days`;

        const hasPhoto = Boolean(record.imageUrl);
        if (hasPhoto) photoCount++;

        pts.push({
          x: timestamp,
          y: index,
          plantId: plant.id,
          plantName: plant.name,
          location: plant.location,
          interval: plant.waterIntervalDays,
          dateStr: d.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
          }),
          relativeLabel: rel,
          isProjected: false,
          color,
          imageUrl: record.imageUrl,
          note: record.note,
          hasPhoto,
        });
      });

      // Add projected next due date point if enabled
      if (showProjectedNext) {
        const nextDueMs = plant.computed.nextDueDate.getTime();
        const daysDiff = plant.computed.daysDiff;
        let dueRel = `Due in ${daysDiff} days`;
        if (daysDiff < 0) dueRel = `Overdue by ${Math.abs(daysDiff)} days`;
        else if (daysDiff === 0) dueRel = 'Needs water today';
        else if (daysDiff === 1) dueRel = 'Due tomorrow';

        pts.push({
          x: nextDueMs,
          y: index,
          plantId: plant.id,
          plantName: plant.name,
          location: plant.location,
          interval: plant.waterIntervalDays,
          dateStr: plant.computed.nextDueDate.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          }),
          relativeLabel: dueRel,
          isProjected: true,
          color,
          hasPhoto: false,
        });
      }
    });

    // Compute domain boundaries for X-axis with padding
    const timestamps = pts.map((p) => p.x);
    const minT = timestamps.length ? Math.min(...timestamps) : nowMs - 30 * 86400000;
    const maxT = timestamps.length ? Math.max(...timestamps) : nowMs + 10 * 86400000;
    const padding = 2 * 86400000; // 2 days padding on each side

    return {
      points: pts,
      xDomain: [minT - padding, maxT + padding],
      yTicks: activePlants.map((_, i) => i),
      plantNamesMap: nameMap,
      totalPhotos: photoCount,
    };
  }, [activePlants, showProjectedNext]);

  if (plants.length === 0) {
    return null;
  }

  // Count past watering events
  const totalWaterings = points.filter((p) => !p.isProjected).length;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs mb-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900 tracking-tight flex items-center gap-2">
              Watering Over Time
              <span className="text-[11px] font-normal text-stone-400">
                ({totalWaterings} {totalWaterings === 1 ? 'event' : 'events'} • {totalPhotos} {totalPhotos === 1 ? 'photo' : 'photos'})
              </span>
            </h2>
            <p className="text-xs text-stone-500">
              Scattered point timeline showing watering events. <strong>Hover over points to view attached photos!</strong>
            </p>
          </div>
        </div>

        {/* Controls: Projected toggle and Plant Selector */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Plant single filter */}
          {plants.length > 1 && (
            <select
              value={selectedPlantId}
              onChange={(e) => setSelectedPlantId(e.target.value)}
              className="text-xs bg-stone-50 border border-stone-200 text-stone-700 rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">All Plants ({plants.length})</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          {/* Toggle Projected Next Due */}
          <button
            onClick={() => setShowProjectedNext(!showProjectedNext)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              showProjectedNext
                ? 'bg-sky-50 text-sky-800 border-sky-200'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Clock className="w-3 h-3 text-sky-600" />
            <span>{showProjectedNext ? 'Projected Due: ON' : 'Projected Due: OFF'}</span>
          </button>
        </div>
      </div>

      {/* Legend & Key explanation */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-500 mb-3 px-1 gap-2">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block shadow-2xs" />
            <span className="font-medium text-stone-700">Watered Event</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-white border-2 border-emerald-500 ring-2 ring-emerald-300/60 inline-flex items-center justify-center text-[7px]">
              📸
            </span>
            <span className="font-medium text-emerald-800 font-semibold">
              Photo Attached (Hover to View!)
            </span>
          </div>

          {showProjectedNext && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-amber-500 inline-block" />
              <span className="font-medium text-amber-800">Next Scheduled Due Date</span>
            </div>
          )}
        </div>

        <div className="text-stone-400 italic">
          Hover any point to see photo snapshot & notes
        </div>
      </div>

      {/* Scatter Chart Container */}
      <div
        className="w-full"
        style={{ height: `${Math.max(activePlants.length * 52 + 70, 220)}px` }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 25, bottom: 20, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f0" />
            <XAxis
              dataKey="x"
              type="number"
              domain={xDomain}
              scale="time"
              tickLine={false}
              axisLine={{ stroke: '#e7e5e4' }}
              tick={{ fill: '#78716c', fontSize: 11 }}
              tickFormatter={(unix) =>
                new Date(unix).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })
              }
            />
            <YAxis
              dataKey="y"
              type="number"
              domain={[-0.5, activePlants.length - 0.5]}
              ticks={yTicks}
              tickLine={false}
              axisLine={{ stroke: '#e7e5e4' }}
              tick={{ fill: '#44403c', fontSize: 11, fontWeight: 500 }}
              tickFormatter={(idx) => plantNamesMap[idx] || ''}
              width={125}
            />
            <ZAxis range={[110, 110]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt: ScatterPoint = payload[0].payload;
                  return (
                    <div className="bg-stone-900 text-white p-3.5 rounded-2xl shadow-2xl text-xs space-y-2 border border-stone-800 pointer-events-none w-64 max-w-[280px] animate-in fade-in zoom-in-95 duration-100">
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
                        <span className="font-bold text-stone-100 truncate max-w-[170px]">
                          {pt.plantName}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-stone-800 text-stone-300 shrink-0">
                          {pt.location}
                        </span>
                      </div>

                      {/* Photo Display if attached */}
                      {pt.imageUrl ? (
                        <div className="relative rounded-xl overflow-hidden border border-stone-700 bg-stone-950 shadow-inner">
                          <img
                            src={pt.imageUrl}
                            alt={`${pt.plantName} watering snapshot`}
                            className="w-full h-36 object-cover"
                          />
                          <div className="absolute top-1.5 right-1.5 bg-black/75 backdrop-blur-xs text-[10px] text-white px-2 py-0.5 rounded-full flex items-center gap-1 font-medium shadow-xs border border-white/20">
                            <Camera className="w-3 h-3 text-emerald-400" />
                            <span>Watering Photo</span>
                          </div>
                        </div>
                      ) : null}

                      {/* Observation Note if present */}
                      {pt.note && (
                        <div className="p-2 rounded-xl bg-stone-800/90 border border-stone-700 text-[11px] text-stone-200 italic flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>"{pt.note}"</span>
                        </div>
                      )}

                      {/* Date details */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        {pt.isProjected ? (
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        ) : (
                          <Droplets className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        )}
                        <span className="font-semibold text-stone-200">
                          {pt.isProjected ? 'Next Due Date:' : 'Watered on:'}
                        </span>
                        <span className="text-stone-300">{pt.dateStr}</span>
                      </div>

                      <div className="text-[11px] text-stone-400 flex items-center justify-between">
                        <span>Relative:</span>
                        <span
                          className={
                            pt.isProjected
                              ? 'text-amber-300 font-medium'
                              : 'text-emerald-300 font-medium'
                          }
                        >
                          {pt.relativeLabel}
                        </span>
                      </div>

                      <div className="text-[10px] text-stone-500 pt-1 border-t border-stone-800 flex justify-between">
                        <span>Frequency:</span>
                        <span>Every {pt.interval} days</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Scatter Point Data */}
            <Scatter
              data={points}
              className="transition-all"
            >
              {points.map((pt, idx) => {
                if (pt.isProjected) {
                  return (
                    <Cell
                      key={`pt-proj-${idx}`}
                      fill="#ffffff"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      strokeDasharray="2 2"
                    />
                  );
                }

                if (pt.hasPhoto) {
                  return (
                    <Cell
                      key={`pt-photo-${idx}`}
                      fill={pt.color}
                      stroke="#10b981"
                      strokeWidth={3}
                      className="cursor-pointer hover:opacity-90"
                    />
                  );
                }

                return (
                  <Cell
                    key={`pt-past-${idx}`}
                    fill={pt.color}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    className="cursor-pointer"
                  />
                );
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Footer insight stats */}
      <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Camera className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] text-stone-400 uppercase font-semibold">Photos Logged</div>
            <div className="font-semibold text-stone-800">
              {totalPhotos} {totalPhotos === 1 ? 'photo' : 'photos'} saved on timeline
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <Droplets className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] text-stone-400 uppercase font-semibold">Total Waterings</div>
            <div className="font-semibold text-stone-800">
              {totalWaterings} events across {activePlants.length} plants
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] text-stone-400 uppercase font-semibold">Schedule Status</div>
            <div className="font-semibold text-stone-800">
              {showProjectedNext ? 'Projected next due dates active' : 'Showing past logs only'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

