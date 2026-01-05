// components/AvatarUploadModal.js
import React from "react";
import { X, Camera, Loader2 } from "lucide-react";

export default function AvatarUploadModal({
    isOpen,
    onClose,
    previewImage,
    onUpload,
    isUploading,
    onFileSelect,
    selectedFile
}) {
    if (!isOpen) return null;

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            onFileSelect(file);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800">Preview & Upload</h3>
                    <button
                        onClick={onClose}
                        disabled={isUploading}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Preview Image */}
                <div className="p-6">
                    {previewImage ? (
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center mb-6">
                            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg bg-gray-100 flex items-center justify-center">
                                <Camera className="w-16 h-16 text-gray-400" />
                            </div>
                            <p className="text-gray-500 mt-4">No image selected</p>
                        </div>
                    )}

                    <p className="text-center text-gray-600 mb-6">
                        {previewImage ? 'This will be your new profile picture' : 'Select an image to upload'}
                    </p>

                    {/* File Input */}
                    <div className="mb-6">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept="image/jpeg, image/jpg, image/png"
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            disabled={isUploading}
                        />
                    </div>

                    {/* Upload Requirements */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                        <h4 className="font-medium text-blue-800 mb-2">Upload Requirements:</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Image format: JPG, JPEG, or PNG</li>
                            <li>• Maximum size: 2MB</li>
                            <li>• Recommended: Square image (1:1 ratio)</li>
                        </ul>
                    </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        disabled={isUploading}
                        className="px-5 py-2.5 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onUpload(selectedFile)}
                        disabled={!selectedFile || isUploading}
                        className="px-5 py-2.5 bg-button text-white font-semibold rounded-lg hover:bg-hover-button transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            'Upload Picture'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}