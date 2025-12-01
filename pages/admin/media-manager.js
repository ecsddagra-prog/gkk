import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'

export default function MediaManager({ user }) {
    const router = useRouter()
    const [files, setFiles] = useState([])
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) {
            router.push('/login')
            return
        }
        checkAccess()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    const checkAccess = async () => {
        try {
            const { data: profile } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile?.role !== 'superadmin') {
                toast.error('Access denied')
                router.push('/dashboard')
                return
            }
            fetchFiles()
        } catch (error) {
            console.error('Error checking access:', error)
            router.push('/dashboard')
        }
    }

    const fetchFiles = async () => {
        try {
            const session = await supabase.auth.getSession()
            const token = session.data.session?.access_token

            const response = await axios.get('/api/admin/media', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setFiles(response.data.files)
        } catch (error) {
            console.error('Error fetching files:', error)
            toast.error('Failed to load files')
        } finally {
            setLoading(false)
        }
    }

    const handleUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setUploading(true)
        const toastId = toast.loading('Uploading...')

        try {
            const session = await supabase.auth.getSession()
            const token = session.data.session?.access_token

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

            toast.success('File uploaded successfully', { id: toastId })
            fetchFiles() // Refresh list
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Upload failed', { id: toastId })
        } finally {
            setUploading(false)
            e.target.value = '' // Reset input
        }
    }

    const copyToClipboard = (url) => {
        navigator.clipboard.writeText(url)
        toast.success('URL copied to clipboard')
    }

    if (loading) return <div className="p-8 text-center">Loading...</div>

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/super-dashboard" className="text-gray-500 hover:text-gray-700">
                                ← Back
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">Media Manager</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Upload Section */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4">Upload New File</h2>
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">Images, Documents, Media</p>
                            </div>
                            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
                        </label>
                    </div>
                </div>

                {/* Files Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {files.map((file) => (
                        <div key={file.key} className="bg-white rounded-lg shadow overflow-hidden group relative">
                            <div className="aspect-square bg-gray-100 relative">
                                {file.key.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                    <Image
                                        src={file.url}
                                        alt={file.key}
                                        className="object-cover"
                                        fill
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl">
                                        📄
                                    </div>
                                )}

                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => copyToClipboard(file.url)}
                                        className="p-2 bg-white rounded-full hover:bg-gray-100 text-gray-900"
                                        title="Copy URL"
                                    >
                                        📋
                                    </button>
                                    <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-white rounded-full hover:bg-gray-100 text-gray-900"
                                        title="Open"
                                    >
                                        🔗
                                    </a>
                                </div>
                            </div>
                            <div className="p-2 text-xs text-gray-600 truncate" title={file.key}>
                                {file.key.split('/').pop()}
                            </div>
                        </div>
                    ))}
                </div>

                {files.length === 0 && (
                    <div className="text-center text-gray-500 py-12">
                        No files uploaded yet
                    </div>
                )}
            </main>
        </div>
    )
}
