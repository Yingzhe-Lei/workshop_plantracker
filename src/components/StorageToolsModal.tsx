import React, { useState } from 'react';
import { X, Download, Upload, RefreshCw, Database } from 'lucide-react';
import { Plant } from '../types';
import { STORAGE_KEY } from '../utils/storage';

interface StorageToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plants: Plant[];
  onImportPlants: (plants: Plant[]) => void;
  onResetToDemo: () => void;
}

export const StorageToolsModal: React.FC<StorageToolsModalProps> = ({
  isOpen,
  onClose,
  plants,
  onImportPlants,
  onResetToDemo,
}) => {
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState('');

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(plants, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `plant_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError('');
    try {
      const parsed = JSON.parse(importJson);
      if (!Array.isArray(parsed)) {
        throw new Error('Import data must be a JSON array of plants.');
      }
      onImportPlants(parsed);
      onClose();
    } catch (err: unknown) {
      setImportError(err instanceof Error ? err.message : 'Invalid JSON format.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Storage & Backup
              </h2>
              <p className="text-xs text-stone-500">
                Saved under localStorage key <code className="text-emerald-700 font-mono">"{STORAGE_KEY}"</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto text-sm">
          {/* Export */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-stone-900">Export Plants JSON</h4>
              <p className="text-xs text-stone-500">
                Save a local copy of all {plants.length} plant records.
              </p>
            </div>
            <button
              onClick={handleDownloadBackup}
              disabled={plants.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 font-medium text-xs text-stone-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>

          {/* Import JSON */}
          <form onSubmit={handleImportSubmit} className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
              Restore / Import JSON
            </label>
            <textarea
              rows={4}
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder='[{"id":"plant_1","name":"Monstera","location":"Living Room","waterIntervalDays":7,"lastWateredDate":"..."}]'
              className="w-full p-3 font-mono text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
            {importError && (
              <p className="text-xs text-rose-600">{importError}</p>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!importJson.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-medium text-xs transition-colors cursor-pointer disabled:opacity-40"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import & Overwrite</span>
              </button>
            </div>
          </form>

          {/* Reset / Demo data */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-stone-900 text-xs">Load Starter Preset Plants</h4>
              <p className="text-[11px] text-stone-500">
                Populates 4 indoor plants across different rooms.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onResetToDemo();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-stone-700 hover:bg-stone-100 border border-stone-200 text-xs font-medium cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-stone-500" />
              <span>Load Preset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
