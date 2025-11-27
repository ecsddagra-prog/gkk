import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function ImageUpload({ value, onChange, label = "Upload Image", className = "" }) {
    const [uploading, setUploading] = useState(false)

    const handleUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

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
            const { data: { uploadUrl, publicUrl } } = await axios.post('/api/admin/upload-url', {
                filename: file.name,
                filetype: file.type
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            // 2. Upload to R2
            await axios.put(uploadUrl, file, {
                headers: { 'Content-Type': file.type }
            })

            toast.success('Image uploaded successfully', { id: toastId })
            onChange(publicUrl)
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Upload failed. Ensure you have admin privileges.', { id: toastId })
        } finally {
            setUploading(false)
            e.target.value = '' // Reset input
        }
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
                            onChange={handleUpload}
                            disabled={uploading}
                        />
                    </label>
                </div>
            </div>
        </div>
    )
}
