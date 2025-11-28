import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'
import ImageUpload from '../../components/ImageUpload'

export default function AdminServices({ user }) {
  const router = useRouter()
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedServices, setExpandedServices] = useState({})
  const [expandedCategories, setExpandedCategories] = useState({})
  const [formData, setFormData] = useState({
    id: null,
    category_id: '',
    name: '',
    description: '',
    base_price: '',
    min_price: '',
    max_price: '',
    is_fixed_location: false,
    min_radius_km: 5,
    max_radius_km: 50,
    is_active: true,
    image_url: '',
    new_category_name: '',
    new_category_image: '',
    sub_services: []
  })

  const checkAdminAccess = React.useCallback(async () => {
    if (!user) return
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
        router.push('/dashboard')
        return
      }
      loadData()
    } catch (error) {
      router.push('/dashboard')
    }
  }, [user, router])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    checkAdminAccess()
  }, [user, router, checkAdminAccess])

  const loadData = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const { data: categoriesData } = await supabase
        .from('service_categories')
        .select('*')
        .order('name')
      setCategories(categoriesData || [])

      const { data } = await axios.get('/api/admin/services', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setServices(data.services || [])
    } catch (error) {
      toast.error('Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token

      if (editingService) {
        await axios.put(`/api/admin/services/${editingService.id}`, {
          ...formData,
          id: editingService.id,
          sub_services: formData.sub_services
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toast.success('Service updated successfully')
      } else {
        await axios.post('/api/admin/services', {
          ...formData,
          new_category: formData.new_category_name ? {
            name: formData.new_category_name,
            image_url: formData.new_category_image
          } : null
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toast.success('Service added successfully')
      }

      setShowModal(false)
      setEditingService(null)
      setFormData({
        id: null,
        category_id: '',
        name: '',
        description: '',
        base_price: '',
        min_price: '',
        max_price: '',
        is_fixed_location: false,
        min_radius_km: 5,
        max_radius_km: 50,
        is_active: true,
        image_url: '',
        new_category_name: '',
        new_category_image: '',
        sub_services: []
      })
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed')
    }
  }

  const handleEdit = async (service) => {
    setEditingService(service)

    let subservices = service.subservices || []
    if (!subservices.length) {
      const { data } = await supabase
        .from('service_subservices')
        .select('*, sub_subservices:service_sub_subservices(*)')
        .eq('service_id', service.id)
        .order('id')
      subservices = data || []
    } else {
      const { data } = await supabase
        .from('service_subservices')
        .select('*, sub_subservices:service_sub_subservices(*)')
        .eq('service_id', service.id)
        .order('id')
      subservices = data || []
    }

    const formattedSubServices = subservices.map(sub => ({
      ...sub,
      sub_subservices: sub.sub_subservices || []
    }))

    setFormData({
      id: service.id,
      category_id: service.category_id,
      name: service.name,
      description: service.description || '',
      base_price: service.base_price || '',
      min_price: service.min_price || '',
      max_price: service.max_price || '',
      is_fixed_location: service.is_fixed_location || false,
      min_radius_km: service.min_radius_km || 5,
      max_radius_km: service.max_radius_km || 50,
      is_active: service.is_active !== undefined ? service.is_active : true,
      image_url: service.image_url || '',
      new_category_name: '',
      new_category_image: '',
      sub_services: formattedSubServices
    })
    setShowModal(true)
  }

  const deleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) return
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const response = await axios.delete(`/api/admin/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.soft_deleted) {
        toast.success(response.data.message, { icon: '⚠️' })
      } else {
        toast.success('Service deleted successfully')
      }
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete service')
    }
  }

  const toggleServiceStatus = async (service) => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      await axios.put(`/api/admin/services/${service.id}`, {
        is_active: !service.is_active
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success(`Service ${!service.is_active ? 'activated' : 'deactivated'}`)
      loadData()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const deleteSubService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this variant?')) return
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const response = await axios.delete(`/api/admin/sub-services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.soft_deleted) {
        toast.success(response.data.message, { icon: '⚠️' })
      } else {
        toast.success('Variant deleted successfully')
      }
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete variant')
    }
  }

  const toggleSubServiceStatus = async (sub) => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      await axios.patch(`/api/admin/sub-services/${sub.id}`, {
        is_active: !sub.is_active
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success(`Variant ${!sub.is_active ? 'activated' : 'deactivated'}`)
      loadData()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const ActionMenu = ({ onEdit, onToggle, onDelete, isActive, type = 'Service' }) => {
    const [isOpen, setIsOpen] = useState(false)
    const buttonRef = React.useRef(null)
    const [menuStyle, setMenuStyle] = useState({})

    const toggleMenu = (e) => {
      e.stopPropagation()
      if (isOpen) {
        setIsOpen(false)
        return
      }

      const rect = buttonRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const spaceBelow = windowHeight - rect.bottom
      const menuHeight = 150 // Approx height

      // Decide whether to show above or below
      const showAbove = spaceBelow < menuHeight

      setMenuStyle({
        position: 'fixed',
        top: showAbove ? (rect.top - menuHeight) : (rect.bottom + 5),
        left: rect.right - 192, // 192px = w-48
        zIndex: 9999 // Ensure it's on top of everything
      })
      setIsOpen(true)
    }

    // Close on scroll or resize
    useEffect(() => {
      const handleScroll = () => { if (isOpen) setIsOpen(false) }
      window.addEventListener('scroll', handleScroll, true)
      window.addEventListener('resize', handleScroll)
      return () => {
        window.removeEventListener('scroll', handleScroll, true)
        window.removeEventListener('resize', handleScroll)
      }
    }, [isOpen])

    return (
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={toggleMenu}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <span className="text-xl font-bold text-gray-500">⋮</span>
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-[9998]" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}></div>
            <div
              className="fixed bg-white rounded-md shadow-lg border border-gray-100 py-1 w-48"
              style={menuStyle}
            >
              <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); onEdit(); }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Edit {type}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); onToggle(); }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                {isActive ? 'Deactivate' : 'Activate'} {type}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); onDelete(); }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Delete {type}
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  const toggleServiceExpand = (serviceId) => {
    setExpandedServices(prev => ({ ...prev, [serviceId]: !prev[serviceId] }))
  }

  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }))
  }

  const groupedServices = categories.map(category => ({
    ...category,
    services: services.filter(s => s.category_id === category.id)
  }))

  const filteredGroups = groupedServices
    .filter(group => selectedCategory === 'all' || group.id === selectedCategory)
    .map(group => ({
      ...group,
      services: group.services.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }))
    .filter(group => group.services.length > 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-700">← Back</Link>
              <h1 className="text-2xl font-bold text-blue-600">Manage Services</h1>
            </div>
            <button
              onClick={() => {
                setEditingService(null)
                setFormData({
                  id: null, category_id: '', name: '', description: '', base_price: '',
                  min_price: '', max_price: '', is_fixed_location: false, min_radius_km: 5,
                  max_radius_km: 50, is_active: true, image_url: '', new_category_name: '',
                  new_category_image: '', sub_services: []
                })
                setShowModal(true)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >+ Add Service</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="all">All Categories ({services.length} services)</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon ? `${cat.icon} ` : ''}{cat.name} ({services.filter(s => s.category_id === cat.id).length})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Services</label>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {filteredGroups.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">No services found</div>
          ) : (
            filteredGroups.map(group => (
              <div key={group.id} className="bg-white rounded-lg shadow-md overflow-visible">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-colors" onClick={() => toggleCategoryExpand(group.id)}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                      <span className="text-xl transition-transform" style={{ transform: expandedCategories[group.id] === true ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▼</span>
                      {group.icon && <span className="text-2xl">{group.icon}</span>}
                      {group.name}
                    </h2>
                    <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">{group.services.length} {group.services.length === 1 ? 'Service' : 'Services'}</span>
                  </div>
                  {group.description && <p className="text-blue-100 text-sm mt-2">{group.description}</p>}
                </div>

                {expandedCategories[group.id] === true && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-10"></th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price Range</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {group.services.map(service => (
                          <React.Fragment key={service.id}>
                            <tr key={service.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                {service.subservices && service.subservices.length > 0 && (
                                  <button onClick={() => toggleServiceExpand(service.id)} className="text-gray-600 hover:text-blue-600 transition-transform" style={{ transform: expandedServices[service.id] ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</button>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {service.name}
                                {service.subservices && service.subservices.length > 0 && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{service.subservices.length} variants</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{service.description || '-'}</td>
                              <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{service.base_price ? `₹${service.base_price}` : '-'}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">{service.min_price && service.max_price ? `₹${service.min_price} - ₹${service.max_price}` : '-'}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`px-2 py-1 text-xs rounded-full ${service.is_fixed_location ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                  {service.is_fixed_location ? 'Fixed Location' : 'Mobile'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs rounded-full ${service.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {service.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium">
                                <ActionMenu
                                  onEdit={() => handleEdit(service)}
                                  onToggle={() => toggleServiceStatus(service)}
                                  onDelete={() => deleteService(service.id)}
                                  isActive={service.is_active}
                                  type="Service"
                                />
                              </td>
                            </tr>
                            {expandedServices[service.id] && service.subservices && service.subservices.length > 0 && (
                              <tr>
                                <td colSpan="8" className="px-6 py-4 bg-gray-50">
                                  <div className="ml-8">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Sub-services / Variants:</h4>
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-gray-100">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Name</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Price</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Image</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Status</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {service.subservices.map(sub => (
                                          <tr key={sub.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-sm text-gray-900">{sub.name}</td>
                                            <td className="px-4 py-2 text-sm text-gray-700 font-semibold">₹{sub.base_charge}</td>
                                            <td className="px-4 py-2">
                                              {sub.image_url ? <img src={sub.image_url} alt={sub.name} className="h-8 w-8 object-cover rounded" /> : <span className="text-xs text-gray-400">No image</span>}
                                            </td>
                                            <td className="px-4 py-2">
                                              <span className={`px-2 py-1 text-xs rounded-full ${sub.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {sub.is_active ? 'Active' : 'Inactive'}
                                              </span>
                                            </td>
                                            <td className="px-4 py-2 text-sm font-medium">
                                              <ActionMenu
                                                onEdit={() => handleEdit(service)}
                                                onToggle={() => toggleSubServiceStatus(sub)}
                                                onDelete={() => deleteSubService(sub.id)}
                                                isActive={sub.is_active}
                                                type="Variant"
                                              />
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{editingService ? 'Edit Service' : 'Add New Service'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <div className="space-y-3">
                  <select required={!formData.new_category_name} value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value, new_category_name: '' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={!!formData.new_category_name}>
                    <option value="">Select Existing Category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                  {!editingService && (
                    <>
                      <div className="text-center text-sm text-gray-500">- OR -</div>
                      <input type="text" value={formData.new_category_name} onChange={(e) => setFormData({ ...formData, new_category_name: e.target.value, category_id: '' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Create New Category" />
                      {formData.new_category_name && (
                        <div className="mt-2">
                          <ImageUpload
                            label="Category Image"
                            value={formData.new_category_image}
                            onChange={(url) => setFormData({ ...formData, new_category_image: url })}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Deep Cleaning" />
              </div>

              <div>
                <ImageUpload
                  label="Service Image"
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={3} placeholder="Describe the service..." />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Base Price (₹)</label>
                  <input type="number" value={formData.base_price} onChange={(e) => setFormData({ ...formData, base_price: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (₹)</label>
                  <input type="number" value={formData.min_price} onChange={(e) => setFormData({ ...formData, min_price: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (₹)</label>
                  <input type="number" value={formData.max_price} onChange={(e) => setFormData({ ...formData, max_price: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="0" />
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center">
                  <input type="checkbox" checked={formData.is_fixed_location} onChange={(e) => setFormData({ ...formData, is_fixed_location: e.target.checked })} className="mr-2 h-4 w-4 text-blue-600" />
                  <label className="text-sm font-medium text-gray-700">Fixed Location Service <span className="text-gray-500 text-xs ml-2">(Provider has a shop)</span></label>
                </div>
                {!formData.is_fixed_location && (
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Min Radius (km)</label>
                      <input type="number" value={formData.min_radius_km} onChange={(e) => setFormData({ ...formData, min_radius_km: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="1" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Radius (km)</label>
                      <input type="number" value={formData.max_radius_km} onChange={(e) => setFormData({ ...formData, max_radius_km: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="1" />
                    </div>
                  </div>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">Sub-services (Variants)</label>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      sub_services: [...prev.sub_services, {
                        name: '',
                        base_charge: '',
                        image_url: ''
                      }]
                    }))}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Add Variant
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.sub_services.map((sub, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          placeholder="Variant Name (e.g. 1 BHK)"
                          value={sub.name}
                          onChange={(e) => {
                            const newSubs = [...formData.sub_services]
                            newSubs[index].name = e.target.value
                            setFormData({ ...formData, sub_services: newSubs })
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        />
                        <input
                          type="number"
                          placeholder="Price (₹)"
                          value={sub.base_charge}
                          onChange={(e) => {
                            const newSubs = [...formData.sub_services]
                            newSubs[index].base_charge = e.target.value
                            setFormData({ ...formData, sub_services: newSubs })
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1 mr-4">
                          <ImageUpload
                            label="Variant Image"
                            value={sub.image_url}
                            onChange={(url) => {
                              const newSubs = [...formData.sub_services]
                              newSubs[index].image_url = url
                              setFormData({ ...formData, sub_services: newSubs })
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newSubs = formData.sub_services.filter((_, i) => i !== index)
                            setFormData({ ...formData, sub_services: newSubs })
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove Variant
                        </button>
                      </div>

                      <div className="flex items-center mb-3">
                        <input
                          type="checkbox"
                          checked={sub.is_active !== false} // Default to true if undefined
                          onChange={(e) => {
                            const newSubs = [...formData.sub_services]
                            newSubs[index].is_active = e.target.checked
                            setFormData({ ...formData, sub_services: newSubs })
                          }}
                          className="mr-2 h-4 w-4 text-blue-600"
                        />
                        <label className="text-sm text-gray-700">Active</label>
                      </div>

                      {/* Sub-Sub Services Section */}
                      <div className="ml-4 pl-4 border-l-2 border-gray-100 mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-semibold text-gray-600 uppercase">Options / Add-ons</label>
                          <button
                            type="button"
                            onClick={() => {
                              const newSubs = [...formData.sub_services]
                              if (!newSubs[index].sub_subservices) newSubs[index].sub_subservices = []
                              newSubs[index].sub_subservices.push({ name: '', base_charge: '', image_url: '' })
                              setFormData({ ...formData, sub_services: newSubs })
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            + Add Option
                          </button>
                        </div>

                        <div className="space-y-2">
                          {sub.sub_subservices && sub.sub_subservices.map((subSub, subIndex) => (
                            <div key={subIndex} className="bg-gray-50 p-2 rounded border border-gray-100">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                <input
                                  type="text"
                                  placeholder="Option Name"
                                  value={subSub.name}
                                  onChange={(e) => {
                                    const newSubs = [...formData.sub_services]
                                    newSubs[index].sub_subservices[subIndex].name = e.target.value
                                    setFormData({ ...formData, sub_services: newSubs })
                                  }}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                />
                                <input
                                  type="number"
                                  placeholder="Price (₹)"
                                  value={subSub.base_charge}
                                  onChange={(e) => {
                                    const newSubs = [...formData.sub_services]
                                    newSubs[index].sub_subservices[subIndex].base_charge = e.target.value
                                    setFormData({ ...formData, sub_services: newSubs })
                                  }}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex-1 mr-2">
                                  <ImageUpload
                                    label="Option Image"
                                    value={subSub.image_url}
                                    onChange={(url) => {
                                      const newSubs = [...formData.sub_services]
                                      newSubs[index].sub_subservices[subIndex].image_url = url
                                      setFormData({ ...formData, sub_services: newSubs })
                                    }}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSubs = [...formData.sub_services]
                                    newSubs[index].sub_subservices = newSubs[index].sub_subservices.filter((_, i) => i !== subIndex)
                                    setFormData({ ...formData, sub_services: newSubs })
                                  }}
                                  className="text-red-500 hover:text-red-700 text-xs"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {formData.sub_services.length === 0 && <p className="text-xs text-gray-500 text-center py-2">No sub-services added</p>}
                </div>
              </div>

              <div className="flex items-center">
                <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="mr-2 h-4 w-4 text-blue-600" />
                <label className="text-sm font-medium text-gray-700">Active <span className="text-gray-500 text-xs ml-2">(Users can book this)</span></label>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  {editingService ? 'Update Service' : 'Create Service'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingService(null)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div >
  )
}
