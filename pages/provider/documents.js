import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'
import ImageUpload from '../../components/ImageUpload'

const createEmptyForms = () => ({
  experience: { years: '', specialties: '', file_url: '' },
  license: { license_number: '', issued_by: '', expiry_date: '', file_url: '' },
  qualification: { qualification_name: '', institute: '', completion_year: '', file_url: '' },
  bank: { account_holder: '', account_number: '', ifsc_code: '', bank_name: '', file_url: '' }
})

export default function ProviderDocuments({ user }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [provider, setProvider] = useState(null)
  const [documents, setDocuments] = useState({})
  const [forms, setForms] = useState(() => createEmptyForms())
  const [submittingDoc, setSubmittingDoc] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadData = async () => {
    try {
      const { data: providerData, error } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error || !providerData) {
        router.push('/provider/register')
        return
      }

      setProvider(providerData)

      const docMap = {}
        ; (data.documents || []).forEach(doc => {
          docMap[doc.document_type] = doc
        })
      setDocuments(docMap)

      const nextForms = createEmptyForms()
      Object.entries(docMap).forEach(([key, doc]) => {
        if (nextForms[key]) {
          nextForms[key] = {
            ...nextForms[key],
            ...(doc.metadata || {}),
            file_url: doc.document_url || ''
          }
        }
      })
      setForms(nextForms)
    } catch (error) {
      console.error('Documents load error:', error)
      toast.error('Failed to load provider documents')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (docType, field, value) => {
    setForms(prev => ({
      ...prev,
      [docType]: {
        ...prev[docType],
        [field]: value
      }
    }))
  }

  const submitDocument = async (docType) => {
    setSubmittingDoc(docType)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const { file_url, ...metadata } = forms[docType]

      if (docType === 'bank') {
        if (!metadata.account_holder || !metadata.account_number || !metadata.ifsc_code) {
          toast.error('Please fill all mandatory bank fields')
          setSubmittingDoc('')
          return
        }
      }

      await axios.post('/api/providers/documents', {
        document_type: docType,
        metadata,
        document_url: file_url || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (docType === 'bank' && provider) {
        await supabase
          .from('providers')
          .update({
            bank_account_number: metadata.account_number,
            ifsc_code: metadata.ifsc_code
          })
          .eq('id', provider.id)
      }

      toast.success('Document saved')
      loadData()
    } catch (error) {
      console.error('Document submit error:', error)
      toast.error(error.response?.data?.error || 'Failed to save document')
    } finally {
      setSubmittingDoc('')
    }
  }

  const renderDocStatus = (docType) => {
    const record = documents[docType]
    if (!record) {
      return <span className="text-sm text-gray-500">Not submitted</span>
    }
    const statusColors = {
      approved: 'text-green-600',
      pending: 'text-yellow-600',
      rejected: 'text-red-600'
    }
    return (
      <span className={`text-sm font-semibold ${statusColors[record.status] || 'text-gray-600'}`}>
        {record.status}
      </span>
    )
  }

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
            <Link href="/provider/dashboard" className="text-blue-600 hover:text-blue-700">
              ← Provider Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-blue-600">Provider Verification</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-2">{provider?.business_name}</h2>
          <p className="text-sm text-gray-600">{provider?.business_address}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div>
              <span className="font-medium">Category:</span>{' '}
              {provider?.business_category_id ? 'Assigned' : 'Not set'}
            </div>
            <div>
              <span className="font-medium">Verification:</span>{' '}
              {provider?.is_verified ? 'Approved' : 'Pending'}
            </div>
          </div>
        </div>

        {/* Experience */}
        <section className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Experience Details</h3>
            {renderDocStatus('experience')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of experience *</label>
              <input
                type="number"
                min="0"
                value={forms.experience.years}
                onChange={(e) => handleInputChange('experience', 'years', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specializations</label>
              <input
                type="text"
                value={forms.experience.specialties}
                onChange={(e) => handleInputChange('experience', 'specialties', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g. AC repair, deep cleaning"
              />
            </div>
          </div>
          <div>
            <ImageUpload
              label="Proof / Portfolio"
              value={forms.experience.file_url}
              onChange={(url) => handleInputChange('experience', 'file_url', url)}
            />
          </div>
          <button
            type="button"
            onClick={() => submitDocument('experience')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={submittingDoc === 'experience'}
          >
            {submittingDoc === 'experience' ? 'Saving...' : 'Save Experience'}
          </button>
        </section>

        {/* License */}
        <section className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">License / Certifications</h3>
            {renderDocStatus('license')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
              <input
                type="text"
                value={forms.license.license_number}
                onChange={(e) => handleInputChange('license', 'license_number', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issued By *</label>
              <input
                type="text"
                value={forms.license.issued_by}
                onChange={(e) => handleInputChange('license', 'issued_by', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry (optional)</label>
              <input
                type="date"
                value={forms.license.expiry_date}
                onChange={(e) => handleInputChange('license', 'expiry_date', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div>
            <ImageUpload
              label="Document Image"
              value={forms.license.file_url}
              onChange={(url) => handleInputChange('license', 'file_url', url)}
            />
          </div>
          <button
            type="button"
            onClick={() => submitDocument('license')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={submittingDoc === 'license'}
          >
            {submittingDoc === 'license' ? 'Saving...' : 'Save License'}
          </button>
        </section>

        {/* Qualification */}
        <section className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Qualifications</h3>
            {renderDocStatus('qualification')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course / Certification *</label>
              <input
                type="text"
                value={forms.qualification.qualification_name}
                onChange={(e) => handleInputChange('qualification', 'qualification_name', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institute / Trainer *</label>
              <input
                type="text"
                value={forms.qualification.institute}
                onChange={(e) => handleInputChange('qualification', 'institute', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                min="1970"
                max={new Date().getFullYear()}
                value={forms.qualification.completion_year}
                onChange={(e) => handleInputChange('qualification', 'completion_year', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div>
            <ImageUpload
              label="Certificate Image"
              value={forms.qualification.file_url}
              onChange={(url) => handleInputChange('qualification', 'file_url', url)}
            />
          </div>
          <button
            type="button"
            onClick={() => submitDocument('qualification')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={submittingDoc === 'qualification'}
          >
            {submittingDoc === 'qualification' ? 'Saving...' : 'Save Qualification'}
          </button>
        </section>

        {/* Bank */}
        <section className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Bank Details</h3>
            {renderDocStatus('bank')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder *</label>
              <input
                type="text"
                value={forms.bank.account_holder}
                onChange={(e) => handleInputChange('bank', 'account_holder', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
              <input
                type="text"
                value={forms.bank.bank_name}
                onChange={(e) => handleInputChange('bank', 'bank_name', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
              <input
                type="text"
                value={forms.bank.account_number}
                onChange={(e) => handleInputChange('bank', 'account_number', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code *</label>
              <input
                type="text"
                value={forms.bank.ifsc_code}
                onChange={(e) => handleInputChange('bank', 'ifsc_code', e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border rounded-lg"
                maxLength={11}
              />
            </div>
          </div>
          <div>
            <ImageUpload
              label="Cancelled Cheque / Passbook"
              value={forms.bank.file_url}
              onChange={(url) => handleInputChange('bank', 'file_url', url)}
            />
          </div>
          <button
            type="button"
            onClick={() => submitDocument('bank')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={submittingDoc === 'bank'}
          >
            {submittingDoc === 'bank' ? 'Saving...' : 'Save Bank Details'}
          </button>
        </section>
      </div>
    </div>
  )
}

