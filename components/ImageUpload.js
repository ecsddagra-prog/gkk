import { useState, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Cropper from 'react-easy-crop'
import { supabase } from '../lib/supabase'
import getCroppedImg from '../lib/canvasUtils'

export default function ImageUpload({ value, onChange, label = "Upload Image", className = "", aspectRatio = 4 / 3, isFixedCrop = false }) {
    const [uploading, setUploading] = useState(false)
    const [imageSrc, setImageSrc] = useState(null)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
    const [showCropper, setShowCropper] = useState(false)
    const [originalFile, setOriginalFile] = useState(null)

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleFileSelect = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]

            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file')
                return
            }

            // Validate file size (e.g., 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB')
                return
            }

            setOriginalFile(file)
            const reader = new FileReader()
            reader.addEventListener('load', () => {
                setImageSrc(reader.result)
                setShowCropper(true)
            })
            reader.readAsDataURL(file)
            // Reset input value to allow selecting same file again if needed
            e.target.value = ''
        }
    }

    const handleUpload = async (fileToUpload) => {
        if (!fileToUpload) return

        setUploading(true)
        const toastId = toast.loading('Uploading image...')

        try {
            const session = await supabase.auth.getSession()
            const token = session.data.session?.access_token

            if (!token) {
                toast.error('Authentication required', { id: toastId })
                return
            }

            // 1. Get presigned URL
            // Ensure we have a valid filename and type, especially for blobs
            const filename = fileToUpload.name || 'cropped-image.jpg'
            const filetype = fileToUpload.type || 'image/jpeg'

            const { data: { uploadUrl, publicUrl } } = await axios.post('/api/admin/upload-url', {
                filename: filename.replace(/\s+/g, '-'), // Basic sanitation
                filetype: filetype
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            // 2. Upload to R2
            await axios.put(uploadUrl, fileToUpload, {
                headers: { 'Content-Type': filetype }
            })

            toast.success('Image uploaded successfully', { id: toastId })
            onChange(publicUrl)
            handleCloseCropper()
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Upload failed. Ensure you have admin privileges.', { id: toastId })
        } finally {
            setUploading(false)
        }
    }

    const handleCropSave = async () => {
        try {
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
            // Pass the generated blob to the upload function
            await handleUpload(croppedImageBlob)
        } catch (e) {
            console.error(e)
            toast.error('Failed to crop image')
        }
    }

    const handleCloseCropper = () => {
        setShowCropper(false)
        setImageSrc(null)
        setZoom(1)
        setCrop({ x: 0, y: 0 })
        setOriginalFile(null)
    }

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="block text-sm font-medium text-gray-700">{label}</label>

            <div className="flex items-start gap-4">
                {/* Preview */}
                {value && (
                    <div className="relative w-24 h-24 border rounded-lg overflow-hidden flex-shrink-0 bg-gray-50">
                        <img
                            src={value}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error' }}
                        />
                        <button
                            type="button"
                            onClick={() => onChange('')}
                            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg hover:bg-red-600"
                            title="Remove image"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Upload Input */}
                <div className="flex-1">
                    <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {uploading ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            ) : (
                                <>
                                    <p className="mb-1 text-sm text-gray-500">
                                        <span className="font-semibold">Click to upload</span>
                                    </p>
                                    <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 5MB)</p>
                                </>
                            )}
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileSelect}
                            disabled={uploading}
                        />
                    </label>
                </div>
            </div>

            {/* Cropper Modal */}
            {showCropper && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-75 p-4">
                    <div className="bg-white rounded-lg w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Crop Image</h3>
                            <button onClick={handleCloseCropper} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>

                        <div className="relative h-[60vh] w-full bg-gray-900">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={aspectRatio}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-700">Zoom:</span>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={handleCloseCropper}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCropSave}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    Crop & Upload
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
