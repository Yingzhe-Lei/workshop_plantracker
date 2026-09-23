import React, { useState, useEffect, useMemo } from 'react';
import { Plant, PlantWithStatus, UrgencyFilter, WateringRecord } from './types';
import { getPlants, savePlants, generatePlantId, getStarterPlants } from './utils/storage';
import { sortPlantsByUrgency } from './utils/dateUtils';
import { Navbar } from './components/Navbar';
import { StatsBanner } from './components/StatsBanner';
import { FilterBar } from './components/FilterBar';
import { PlantCard } from './components/PlantCard';
import { PlantModal } from './components/PlantModal';
import { EmptyState } from './components/EmptyState';
import { StorageToolsModal } from './components/StorageToolsModal';
import { RoomDistributionChart } from './components/RoomDistributionChart';
import { WateringScatterChart } from './components/WateringScatterChart';
import { WateringModal } from './components/WateringModal';
import { Toast, ToastMessage } from './components/Toast';
import { Database, Plus, BarChart2, ScatterChart as ScatterIcon, ChevronDown, ChevronUp } from 'lucide-react';

export default function App() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [photoWateringPlant, setPhotoWateringPlant] = useState<PlantWithStatus | null>(null);
  
  // Analytics charts
  const [showCharts, setShowCharts] = useState(true);
  const [activeChartTab, setActiveChartTab] = useState<'scatter' | 'room'>('scatter');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>('all');

  // Feedback Toast
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Initialize and load from localStorage
  useEffect(() => {
    const loaded = getPlants();
    setPlants(loaded);
    setIsLoaded(true);
  }, []);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: String(Date.now()),
      type,
      text,
    });
  };

  // Save changes to localStorage whenever plants state updates (after initial load)
  const updatePlantsAndPersist = (newPlants: Plant[]) => {
    setPlants(newPlants);
    savePlants(newPlants);
  };

  // Water single plant action (one-click)
  const handleWaterPlant = (plantId: string) => {
    const nowIso = new Date().toISOString();
    const updated = plants.map((plant) => {
      if (plant.id === plantId) {
        const existingHistory = plant.wateringHistory || (plant.lastWateredDate ? [plant.lastWateredDate] : []);
        return {
          ...plant,
          lastWateredDate: nowIso,
          wateringHistory: [...existingHistory, nowIso],
        };
      }
      return plant;
    });

    updatePlantsAndPersist(updated);
    const target = plants.find((p) => p.id === plantId);
    showToast(`Watered ${target ? target.name : 'plant'}! Schedule reset 💧`, 'success');
  };

  // Water single plant with photo & note attachment
  const handleConfirmWateringWithPhoto = (plantId: string, imageUrl?: string, note?: string) => {
    const nowIso = new Date().toISOString();
    const updated = plants.map((plant) => {
      if (plant.id === plantId) {
        const existingHistory = plant.wateringHistory || (plant.lastWateredDate ? [plant.lastWateredDate] : []);
        const newRecord: WateringRecord = {
          date: nowIso,
          imageUrl,
          note,
        };
        return {
          ...plant,
          lastWateredDate: nowIso,
          wateringHistory: [...existingHistory, newRecord],
        };
      }
      return plant;
    });

    updatePlantsAndPersist(updated);
    const target = plants.find((p) => p.id === plantId);
    if (imageUrl) {
      showToast(`Watered ${target ? target.name : 'plant'} with photo attached! 📸💧`, 'success');
    } else {
      showToast(`Watered ${target ? target.name : 'plant'}! Schedule reset 💧`, 'success');
    }
  };

  // Bulk water all overdue / due today plants
  const handleWaterAllDue = () => {
    const now = new Date();
    const nowIso = now.toISOString();
    const sorted = sortPlantsByUrgency(plants, now);
    const dueIds = new Set(
      sorted
        .filter((p) => p.computed.status === 'overdue' || p.computed.status === 'due_today')
        .map((p) => p.id)
    );

    if (dueIds.size === 0) return;

    const updated = plants.map((p) => {
      if (dueIds.has(p.id)) {
        const existingHistory = p.wateringHistory || (p.lastWateredDate ? [p.lastWateredDate] : []);
        return {
          ...p,
          lastWateredDate: nowIso,
          wateringHistory: [...existingHistory, nowIso],
        };
      }
      return p;
    });

    updatePlantsAndPersist(updated);
    showToast(`Watered all ${dueIds.size} thirsty plants! 🌿💧`, 'success');
  };

  // Add or Edit Plant
  const handleSavePlant = (plantData: Omit<Plant, 'id'> & { id?: string }) => {
    if (plantData.id) {
      // Edit existing
      const updated = plants.map((p) =>
        p.id === plantData.id ? { ...(plantData as Plant) } : p
      );
      updatePlantsAndPersist(updated);
      showToast(`Updated ${plantData.name} details 🌱`, 'success');
    } else {
      // Create new
      const newPlant: Plant = {
        ...plantData,
        id: generatePlantId(),
      };
      updatePlantsAndPersist([...plants, newPlant]);
      showToast(`Added ${newPlant.name} to ${newPlant.location}! 🌱`, 'success');
    }
  };

  // Delete plant
  const handleDeletePlant = (plantId: string) => {
    const target = plants.find((p) => p.id === plantId);
    const filtered = plants.filter((p) => p.id !== plantId);
    updatePlantsAndPersist(filtered);
    showToast(`Removed ${target ? target.name : 'plant'}`, 'info');
  };

  // Load starter preset plants
  const handleLoadStarters = () => {
    const starters = getStarterPlants();
    updatePlantsAndPersist(starters);
    showToast('Loaded 4 starter plants across your home! 🪴', 'success');
  };

  // Compute status and sort plants by urgency
  const sortedPlants: PlantWithStatus[] = useMemo(() => {
    return sortPlantsByUrgency(plants);
  }, [plants]);

  // Extract unique available rooms for filtering
  const availableRooms = useMemo(() => {
    const rooms = new Set<string>();
    plants.forEach((p) => {
      if (p.location.trim()) {
        rooms.add(p.location.trim());
      }
    });
    return Array.from(rooms).sort();
  }, [plants]);

  // Filtered list based on Search, Room, and Urgency
  const filteredPlants = useMemo(() => {
    return sortedPlants.filter((plant) => {
      // Room match
      if (
        selectedRoom !== 'all' &&
        plant.location.toLowerCase() !== selectedRoom.toLowerCase()
      ) {
        return false;
      }

      // Urgency filter match
      if (urgencyFilter === 'needs_water') {
        if (plant.computed.status !== 'overdue' && plant.computed.status !== 'due_today') {
          return false;
        }
      } else if (urgencyFilter === 'healthy') {
        if (plant.computed.status !== 'healthy') {
          return false;
        }
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = plant.name.toLowerCase().includes(q);
        const matchesRoom = plant.location.toLowerCase().includes(q);
        if (!matchesName && !matchesRoom) {
          return false;
        }
      }

      return true;
    });
  }, [sortedPlants, selectedRoom, urgencyFilter, searchQuery]);

  const urgentCount = useMemo(() => {
    return sortedPlants.filter(
      (p) => p.computed.status === 'overdue' || p.computed.status === 'due_today'
    ).length;
  }, [sortedPlants]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9f6]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-stone-600">Loading your garden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9f6] flex flex-col selection:bg-emerald-200">
      {/* Top Navbar */}
      <Navbar
        onAddPlant={() => {
          setEditingPlant(null);
          setIsAddModalOpen(true);
        }}
        totalPlants={plants.length}
        urgentCount={urgentCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {plants.length === 0 ? (
          /* Empty State */
          <EmptyState
            onAddPlant={() => {
              setEditingPlant(null);
              setIsAddModalOpen(true);
            }}
            onLoadStarters={handleLoadStarters}
          />
        ) : (
          /* Dashboard List View */
          <div>
            {/* Quick Metrics */}
            <StatsBanner
              plants={sortedPlants}
              onWaterAllDue={urgentCount > 0 ? handleWaterAllDue : undefined}
            />

            {/* Charts & Analytics Section */}
            <div className="mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Insights & Visualizations
                  </span>
                  
                  {showCharts && (
                    <div className="inline-flex p-0.5 bg-stone-200/70 rounded-lg text-xs">
                      <button
                        onClick={() => setActiveChartTab('scatter')}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                          activeChartTab === 'scatter'
                            ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        <ScatterIcon className="w-3.5 h-3.5 text-sky-600" />
                        <span>Watering Over Time (Scatter)</span>
                      </button>

                      <button
                        onClick={() => setActiveChartTab('room')}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                          activeChartTab === 'room'
                            ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        <BarChart2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Plants by Room (Bar)</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowCharts(!showCharts)}
                  className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-emerald-800 font-medium px-2.5 py-1 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  {showCharts ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Hide Charts</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>Show Charts</span>
                    </>
                  )}
                </button>
              </div>

              {/* Render Selected Chart */}
              {showCharts && (
                <div className="animate-in fade-in duration-150">
                  {activeChartTab === 'scatter' ? (
                    <WateringScatterChart plants={sortedPlants} />
                  ) : (
                    <RoomDistributionChart
                      plants={sortedPlants}
                      selectedRoom={selectedRoom}
                      onSelectRoom={(room) => {
                        setSelectedRoom(room);
                        if (room !== 'all') {
                          showToast(`Filtered by ${room}`, 'info');
                        }
                      }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Filter and Search Bar */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedRoom={selectedRoom}
              onRoomChange={setSelectedRoom}
              availableRooms={availableRooms}
              urgencyFilter={urgencyFilter}
              onUrgencyFilterChange={setUrgencyFilter}
              urgentCount={urgentCount}
            />

            {/* Plant Cards Grid */}
            {filteredPlants.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-2xl border border-stone-200 p-6">
                <p className="text-sm font-medium text-stone-600">
                  No plants match your active filter or search criteria.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedRoom('all');
                    setUrgencyFilter('all');
                  }}
                  className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                {filteredPlants.map((plant) => (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    onWater={handleWaterPlant}
                    onWaterWithPhoto={(target) => setPhotoWateringPlant(target)}
                    onEdit={(target) => {
                      setEditingPlant(target);
                      setIsAddModalOpen(true);
                    }}
                    onDelete={handleDeletePlant}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Household Plant Tracker MVP • Saved to browser LocalStorage</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsStorageModalOpen(true)}
              className="inline-flex items-center gap-1.5 hover:text-stone-800 text-stone-600 transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Storage & Backup</span>
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setEditingPlant(null);
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1 hover:text-emerald-700 text-emerald-800 font-medium cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Plant</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Water with Photo Modal */}
      <WateringModal
        isOpen={Boolean(photoWateringPlant)}
        onClose={() => setPhotoWateringPlant(null)}
        plant={photoWateringPlant}
        onConfirmWatering={handleConfirmWateringWithPhoto}
      />

      {/* Add / Edit Plant Modal */}
      <PlantModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPlant(null);
        }}
        onSave={handleSavePlant}
        initialPlant={editingPlant}
        existingRooms={availableRooms}
      />

      {/* Storage & Backup Modal */}
      <StorageToolsModal
        isOpen={isStorageModalOpen}
        onClose={() => setIsStorageModalOpen(false)}
        plants={plants}
        onImportPlants={(imported) => {
          updatePlantsAndPersist(imported);
          showToast(`Imported ${imported.length} plants successfully!`, 'success');
        }}
        onResetToDemo={handleLoadStarters}
      />

      {/* Notification Toast */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
