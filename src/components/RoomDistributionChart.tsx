import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  CartesianGrid,
} from 'recharts';
import { BarChart3, Home, Filter, Droplets, CheckCircle2 } from 'lucide-react';
import { PlantWithStatus } from '../types';

interface RoomDistributionChartProps {
  plants: PlantWithStatus[];
  selectedRoom: string;
  onSelectRoom: (room: string) => void;
}

interface RoomData {
  room: string;
  total: number;
  needsWater: number;
  healthy: number;
}

export const RoomDistributionChart: React.FC<RoomDistributionChartProps> = ({
  plants,
  selectedRoom,
  onSelectRoom,
}) => {
  // Aggregate plants by room
  const data: RoomData[] = React.useMemo(() => {
    const roomMap = new Map<string, { total: number; needsWater: number; healthy: number }>();

    plants.forEach((plant) => {
      const room = plant.location.trim() || 'Unknown Room';
      const existing = roomMap.get(room) || { total: 0, needsWater: 0, healthy: 0 };
      existing.total += 1;
      if (plant.computed.status === 'overdue' || plant.computed.status === 'due_today') {
        existing.needsWater += 1;
      } else {
        existing.healthy += 1;
      }
      roomMap.set(room, existing);
    });

    return Array.from(roomMap.entries())
      .map(([room, counts]) => ({
        room,
        total: counts.total,
        needsWater: counts.needsWater,
        healthy: counts.healthy,
      }))
      .sort((a, b) => b.total - a.total || a.room.localeCompare(b.room));
  }, [plants]);

  if (data.length === 0) {
    return null;
  }

  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  // Integer ticks for Y axis
  const yTicks = Array.from({ length: Math.min(maxTotal + 1, 6) }, (_, i) =>
    Math.round((i * maxTotal) / Math.min(maxTotal, 5))
  ).filter((v, idx, arr) => arr.indexOf(v) === idx);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs mb-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900 tracking-tight flex items-center gap-2">
              Plants by Room
              <span className="text-[11px] font-normal text-stone-400">
                ({data.length} {data.length === 1 ? 'room' : 'rooms'})
              </span>
            </h2>
            <p className="text-xs text-stone-500">
              Overview of plant distribution and watering status per room
            </p>
          </div>
        </div>

        {/* Selected Room indicator / reset */}
        {selectedRoom !== 'all' ? (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-stone-500">Filtered by:</span>
            <button
              onClick={() => onSelectRoom('all')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <span>{selectedRoom}</span>
              <span className="text-emerald-500 hover:text-emerald-800 font-bold ml-1">×</span>
            </button>
          </div>
        ) : (
          <div className="text-[11px] text-stone-400 hidden sm:flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Click any bar to filter dashboard</span>
          </div>
        )}
      </div>

      {/* Recharts Bar Chart */}
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length > 0) {
                const clickedRoom = state.activePayload[0].payload?.room;
                if (clickedRoom) {
                  if (selectedRoom.toLowerCase() === clickedRoom.toLowerCase()) {
                    onSelectRoom('all');
                  } else {
                    onSelectRoom(clickedRoom);
                  }
                }
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f0" />
            <XAxis
              dataKey="room"
              tickLine={false}
              axisLine={{ stroke: '#e7e5e4' }}
              tick={{ fill: '#78716c', fontSize: 11 }}
              interval={0}
              angle={data.length > 4 ? -20 : 0}
              textAnchor={data.length > 4 ? 'end' : 'middle'}
            />
            <YAxis
              allowDecimals={false}
              ticks={yTicks}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#a8a29e', fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: '#f4f6f0', opacity: 0.6 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item: RoomData = payload[0].payload;
                  return (
                    <div className="bg-stone-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-stone-800 pointer-events-none">
                      <div className="flex items-center gap-1.5 font-bold text-stone-100 pb-1 border-b border-stone-800">
                        <Home className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{item.room}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-stone-300">
                        <span>Total Plants:</span>
                        <span className="font-semibold text-white">{item.total}</span>
                      </div>
                      {item.needsWater > 0 && (
                        <div className="flex items-center justify-between gap-4 text-amber-300">
                          <span className="flex items-center gap-1">
                            <Droplets className="w-3 h-3 text-amber-400" />
                            Needs Water:
                          </span>
                          <span className="font-semibold">{item.needsWater}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-4 text-emerald-300">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Healthy:
                        </span>
                        <span className="font-semibold">{item.healthy}</span>
                      </div>
                      <div className="pt-1 text-[10px] text-stone-400 italic">
                        Click to filter list by this room
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
            />
            {/* Stacked Bars: Healthy and Needs Water for clear insight */}
            <Bar
              dataKey="healthy"
              name="Healthy / Hydrated"
              stackId="a"
              fill="#2e7d32"
              radius={[0, 0, 0, 0]}
              className="cursor-pointer"
            >
              {data.map((entry) => {
                const isSelected = selectedRoom.toLowerCase() === entry.room.toLowerCase();
                return (
                  <Cell
                    key={`healthy-${entry.room}`}
                    fill={isSelected ? '#1b5e20' : '#2e7d32'}
                    stroke={isSelected ? '#14532d' : undefined}
                    strokeWidth={isSelected ? 2 : 0}
                  />
                );
              })}
            </Bar>
            <Bar
              dataKey="needsWater"
              name="Needs Water"
              stackId="a"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
              className="cursor-pointer"
            >
              {data.map((entry) => {
                const isSelected = selectedRoom.toLowerCase() === entry.room.toLowerCase();
                return (
                  <Cell
                    key={`urgent-${entry.room}`}
                    fill={isSelected ? '#d97706' : '#f59e0b'}
                    stroke={isSelected ? '#b45309' : undefined}
                    strokeWidth={isSelected ? 2 : 0}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Room Quick-Stat Badges */}
      <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium text-stone-400">Quick room breakdown:</span>
        {data.map((d) => {
          const isSelected = selectedRoom.toLowerCase() === d.room.toLowerCase();
          return (
            <button
              key={d.room}
              onClick={() => {
                onSelectRoom(isSelected ? 'all' : d.room);
              }}
              className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-stone-900 text-white border-stone-900 shadow-2xs font-semibold'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              <span>{d.room}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-200/80 text-stone-700'
                }`}
              >
                {d.total}
              </span>
              {d.needsWater > 0 && (
                <span
                  title={`${d.needsWater} plant(s) need water in ${d.room}`}
                  className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
