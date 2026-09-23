import React, { useState, useRef } from 'react';
import { X, Camera, Upload, Droplets, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
import { PlantWithStatus } from '../types';
import { compressImage } from '../utils/imageUtils';

interface WateringModalProps {
  isOpen: boolean;
  onClose: () => void;
  plant: PlantWithStatus | null;
  onConfirmWatering: (plantId: string, imageUrl?: string, note?: string) => void;
}

export const WateringModal: React.FC<WateringModalProps> = ({
  isOpen,
  onClose,
  plant,
  onConfirmWatering,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !plant) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    try {
      setIsCompressing(true);
      setError('');
      const compressedDataUrl = await compressImage(file, 720, 720, 0.75);
      setImagePreview(compressedDataUrl);
    } catch (err) {
      console.error('Error compressing image:', err);
      setError('Could not process this image. Please try another one.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmWatering(plant.id, imagePreview || undefined, note.trim() || undefined);
    // Reset state
    setImagePreview(null);
    setNote('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Water & Attach Photo
              </h2>
              <p className="text-xs text-stone-500 truncate max-w-[240px]">
                {plant.name} • {plant.location}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Action description banner */}
          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 text-xs text-emerald-900 flex items-center gap-2.5">
            <Droplets className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              This will record a watering event for <strong>Today</strong> and attach your photo to the scatter plot!
            </span>
          </div>

          {/* Photo Attachment Section */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              Plant Photo (Shows on Hover)
            </label>

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 group shadow-xs">
                <img
                  src={imagePreview}
                  alt="Watering preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-stone-900/80 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 text-white text-[11px] backdrop-blur-xs flex items-center gap-1.5 font-medium">
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Photo ready to attach</span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer bg-stone-50/50 hover:bg-emerald-50/30 transition-all group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-500 group-hover:bg-emerald-100 group-hover:text-emerald-700 mx-auto flex items-center justify-center transition-colors mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-stone-800 group-hover:text-emerald-800">
                  {isCompressing ? 'Processing image...' : 'Click to take or upload a plant photo'}
                </p>
                <p className="text-[11px] text-stone-400 mt-1">
                  Supports camera capture, PNG, JPG, or WebP
                </p>
              </div>
            )}

            {error && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>

          {/* Optional Observation Note */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Observation Note <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Unfurled a new leaf, soil top-dressed..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                maxLength={80}
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Brief note displayed alongside the photo on the timeline tooltip.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCompressing}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm shadow-emerald-700/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
            >
              <Droplets className="w-4 h-4" />
              <span>Record Watering & Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
