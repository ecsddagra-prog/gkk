import { useState, useRef, useEffect } from 'react'
import { Clock, Truck, Briefcase, Calendar, MapPin, Footprints, CalendarDays, Tag, Plus } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

// Helper to guess icon based on name
const getIconForUnit = (unitName) => {
    const lower = unitName.toLowerCase()
    if (lower.includes('job')) return Briefcase
    if (lower.includes('hour')) return Clock
    if (lower.includes('day')) return CalendarDays
    if (lower.includes('week') || lower.includes('month')) return Calendar
    if (lower.includes('km') || lower.includes('mile')) return Truck
    if (lower.includes('visit')) return Footprints
    return Tag
}

export default function UnitSelector({ value = 'job', onChange, disabled = false, className = '' }) {
    const [isOpen, setIsOpen] = useState(false)
    const [units, setUnits] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const dropdownRef = useRef(null)
    const inputRef = useRef(null)

    // Fetch units on mount
    useEffect(() => {
        fetchUnits()
    }, [])

    const fetchUnits = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const { data } = await axios.get('/api/admin/units', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setUnits(data.units || [])
        } catch (error) {
            console.error('Failed to fetch units', error)
        }
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Simplistic normalization for legacy support:
    const normalizedValue = value.toLowerCase() === 'job' ? 'Per Job' :
        value.toLowerCase() === 'hour' ? 'Per Hour' :
            value

    const selectedUnit = units.find(u => u.name.toLowerCase() === normalizedValue.toLowerCase()) || { name: value }
    const Icon = getIconForUnit(selectedUnit.name || '')

    const filteredUnits = units.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleCreate = async () => {
        if (!searchQuery.trim()) return

        try {
            setLoading(true)
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const { data } = await axios.post('/api/admin/units', { name: searchQuery }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const newUnit = data.unit
            setUnits(prev => [...prev, newUnit])
            onChange(newUnit.name)
            setIsOpen(false)
            setSearchQuery('')
            toast.success(`Unit '${newUnit.name}' created`)
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create unit')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div
                onClick={() => {
                    if (!disabled) {
                        setIsOpen(true)
                        setTimeout(() => inputRef.current?.focus(), 100)
                    }
                }}
                className={`
                    flex items-center gap-2 px-3 py-2 bg-white border rounded-lg 
                    transition-all duration-200 min-w-[140px] justify-between
                    ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-blue-400 hover:shadow-sm cursor-pointer'}
                    ${isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'}
                `}
                title="Select pricing unit"
            >
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <Icon size={16} className="text-gray-500 flex-shrink-0" />
                    {isOpen ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Type to search..."
                            className="w-full text-sm outline-none bg-transparent"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    if (filteredUnits.length > 0) {
                                        onChange(filteredUnits[0].name)
                                        setIsOpen(false)
                                    } else {
                                        handleCreate()
                                    }
                                }
                            }}
                        />
                    ) : (
                        <span className="text-sm font-medium text-gray-700 truncate">
                            {selectedUnit.name || value || 'Select Unit'}
                        </span>
                    )}
                </div>
                {!disabled && (
                    <span className="text-gray-400 text-xs transform transition-transform duration-200"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        ▼
                    </span>
                )}
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full min-w-[180px] bg-white rounded-lg shadow-lg border border-gray-100 py-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 origin-top-left">
                    {loading && <div className="p-2 text-center text-xs text-gray-500">Creating...</div>}

                    {!loading && filteredUnits.map((unit) => {
                        const UnitIcon = getIconForUnit(unit.name)
                        const isSelected = selectedUnit.name === unit.name

                        return (
                            <button
                                key={unit.id}
                                type="button"
                                onClick={() => {
                                    onChange(unit.name)
                                    setIsOpen(false)
                                    setSearchQuery('')
                                }}
                                className={`
                                    w-full px-3 py-2 flex items-center gap-2 text-sm text-left
                                    transition-colors duration-150
                                    ${isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}
                                `}
                            >
                                <UnitIcon size={16} className={isSelected ? 'text-blue-500' : 'text-gray-400'} />
                                {unit.name}
                                {isSelected && <span className="ml-auto text-blue-500">✓</span>}
                            </button>
                        )
                    })}

                    {!loading && filteredUnits.length === 0 && searchQuery && (
                        <button
                            type="button"
                            onClick={handleCreate}
                            className="w-full px-3 py-2 flex items-center gap-2 text-sm text-left text-blue-600 hover:bg-blue-50 font-medium border-t border-gray-50"
                        >
                            <Plus size={16} />
                            Create "{searchQuery}"
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

