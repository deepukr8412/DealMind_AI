import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { HiXMark, HiCheck } from 'react-icons/hi2';
import { getCroppedImg } from '../utils/cropImage';

export default function ImageCropper({ imageSrc, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleCropComplete = useCallback((croppedArea, croppedAreaPx) => {
    setCroppedAreaPixels(croppedAreaPx);
  }, []);

  const handleSave = async () => {
    try {
      setProcessing(true);
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImageBlob);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-dark-800 rounded-2xl w-full max-w-lg overflow-hidden border border-dark-600 shadow-2xl flex flex-col h-[80vh] max-h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-600">
          <h3 className="font-bold text-white text-lg">Adjust Avater</h3>
          <button
            onClick={onCancel}
            className="p-2 text-dark-200 hover:text-white hover:bg-dark-700 rounded-lg transition"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative flex-1 bg-black overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1} // Square aspect ratio for avatars
            cropShape="round" // Show a circle overlay to help users center the avatar
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        {/* Footer Controls */}
        <div className="p-5 border-t border-dark-600 bg-dark-800">
          <div className="mb-4">
            <label className="text-xs text-dark-300 font-medium block mb-2">Zoom</label>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              className="w-full accent-primary-500"
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl font-medium text-sm text-dark-200 hover:bg-dark-700 transition"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={processing}
              className="px-5 py-2.5 rounded-xl font-medium text-sm bg-primary-500 hover:bg-primary-600 text-white flex items-center gap-2 transition"
            >
              {processing ? (
                <span className="animate-pulse">Saving...</span>
              ) : (
                <>
                  <HiCheck className="w-4 h-4" /> Save Avatar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
