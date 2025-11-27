import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { formatCurrency, formatDateTime } from '../../lib/utils'

export default function RateQuoteDetails({ user }) {
  const router = useRouter()
  const { id } = router.query
  const [rateQuote, setRateQuote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState('00:00')
  const [isOwner, setIsOwner] = useState(false)
  const [providerId, setProviderId] = useState(null)
  const [providerBid, setProviderBid] = useState({ amount: '', message: '' })
  const [submittingBid, setSubmittingBid] = useState(false)
  const [acceptingQuote, setAcceptingQuote] = useState(false)
  useEffect(() => {
    if (!user) return

    const fetchProviderId = async () => {
      try {
        const { data } = await supabase
          .from('providers')
          .select('id')
          .eq('user_id', user.id)
          .single()
        setProviderId(data?.id || null)
      } catch {
        setProviderId(null)
      }
    }

    fetchProviderId()
  }, [user])

  useEffect(() => {
    if (!providerId || !rateQuote?.provider_quotes) return
    const existingQuote = rateQuote.provider_quotes.find(quote => quote.provider_id === providerId)
    if (existingQuote) {
      setProviderBid({
        amount: existingQuote.quoted_price,
        message: existingQuote.message || ''
      })
    }
  }, [providerId, rateQuote?.provider_quotes])


  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    if (id) {
      loadRateQuote()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id])

  useEffect(() => {
    if (!rateQuote?.expires_at) return

    const timer = setInterval(() => {
      const diff = new Date(rateQuote.expires_at).getTime() - Date.now()
      if (diff <= 0) {
        setCountdown('00:00')
        clearInterval(timer)
        return
      }
      const minutes = Math.floor(diff / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setCountdown(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
    }, 1000)

    return () => clearInterval(timer)
  }, [rateQuote?.expires_at])

  const loadRateQuote = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const { data } = await axios.get(`/api/rate-quotes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setRateQuote(data.rate_quote)
      setIsOwner(data.rate_quote.user_id === user.id)
    } catch (error) {
      console.error('Failed to load rate quote:', error)
      toast.error(error.response?.data?.error || 'Unable to load rate quote')
    } finally {
      setLoading(false)
    }
  }

  const activeQuotes = useMemo(() => rateQuote?.provider_quotes || [], [rateQuote])

  const handleAcceptQuote = async (providerQuoteId) => {
    setAcceptingQuote(true)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const { data } = await axios.post(`/api/rate-quotes/${id}/accept`, {
        provider_quote_id: providerQuoteId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success('Quote accepted! Booking created.')
      if (data?.booking?.id) {
        router.push(`/booking/${data.booking.id}`)
      } else {
        router.push('/bookings')
      }
    } catch (error) {
      console.error('Accept quote error:', error)
      toast.error(error.response?.data?.error || 'Failed to accept quote')
      loadRateQuote()
    } finally {
      setAcceptingQuote(false)
    }
  }

  const handleSubmitBid = async (e) => {
    e.preventDefault()
    const amount = Number(providerBid.amount)
    if (!amount || amount <= 0) {
      toast.error('Enter a valid quote amount')
      return
    }

    setSubmittingBid(true)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      await axios.post(`/api/rate-quotes/${id}/quotes`, {
        quoted_price: amount,
        message: providerBid.message
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success('Quote submitted')
      loadRateQuote()
    } catch (error) {
      console.error('Bid submission error:', error)
      toast.error(error.response?.data?.error || 'Failed to submit quote')
    } finally {
      setSubmittingBid(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!rateQuote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Rate quote not found</h2>
          <Link href="/book-service" className="text-blue-600 hover:text-blue-700">
            Back to booking
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href={isOwner ? '/dashboard' : '/provider/dashboard'} className="text-blue-600 hover:text-blue-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-blue-600">Rate Quote</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">{rateQuote.service?.name}</h2>
                  {rateQuote.sub_service && (
                    <p className="text-sm text-gray-500">{rateQuote.sub_service.name}</p>
                  )}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${rateQuote.status === 'converted'
                    ? 'bg-green-100 text-green-700'
                    : rateQuote.status === 'cancelled' || rateQuote.status === 'expired'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                  {rateQuote.status}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-gray-500">Countdown</div>
                  <div className="text-3xl font-bold text-blue-600">{countdown}</div>
                  <div className="text-xs text-gray-400 mt-1">Closes by {formatDateTime(rateQuote.expires_at)}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-gray-500">Requested Price</div>
                  <div className="text-3xl font-bold">{rateQuote.requested_price ? formatCurrency(rateQuote.requested_price) : '—'}</div>
                  <div className="text-xs text-gray-400 mt-1">User preferred budget</div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-700">
                <div><span className="font-semibold">Address:</span> {rateQuote.details?.service_address}</div>
                {rateQuote.details?.scheduled_date && (
                  <div><span className="font-semibold">Schedule:</span> {formatDateTime(rateQuote.details.scheduled_date)}</div>
                )}
                {rateQuote.details?.base_charge && (
                  <div>
                    <span className="font-semibold">Estimated Rate:</span> {formatCurrency(rateQuote.details.base_charge)}
                    {rateQuote.details?.hourly_charge && (
                      <span className="ml-4">Hourly: {formatCurrency(rateQuote.details.hourly_charge)}/hr</span>
                    )}
                  </div>
                )}
                <div>
                  <span className="font-semibold">Booking For:</span> {rateQuote.details?.for_whom || 'self'}
                  {rateQuote.details?.for_whom === 'other' && rateQuote.details?.other_contact && (
                    <span className="ml-2 text-gray-500">
                      ({rateQuote.details.other_contact.name}, {rateQuote.details.other_contact.phone})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Provider Quotes</h3>
                <div className="text-sm text-gray-500">{activeQuotes.length} response(s)</div>
              </div>
              {activeQuotes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {rateQuote.status === 'expired' ? 'Countdown ended. No quotes received.' : 'Waiting for providers to respond...'}
                </div>
              ) : (
                <div className="space-y-4">
                  {activeQuotes.map(quote => (
                    <div key={quote.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm text-gray-500">{quote.provider?.business_name || 'Provider'}</div>
                          <div className="text-2xl font-bold text-blue-600">{formatCurrency(quote.quoted_price)}</div>
                          {quote.message && <p className="text-sm text-gray-600 mt-2">{quote.message}</p>}
                          <div className="text-xs text-gray-400 mt-2">{formatDateTime(quote.created_at)}</div>
                        </div>
                        <div className="text-right space-y-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${quote.status === 'accepted'
                              ? 'bg-green-100 text-green-700'
                              : quote.status === 'rejected'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {quote.status}
                          </span>
                          {isOwner && rateQuote.status !== 'converted' && quote.status === 'pending' && (
                            <button
                              onClick={() => handleAcceptQuote(quote.id)}
                              className="block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                              disabled={acceptingQuote}
                            >
                              {acceptingQuote ? 'Processing...' : 'Accept Quote'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Provider Bid Panel */}
          <div className="space-y-6">
            {!isOwner && providerId && !['converted', 'expired', 'cancelled'].includes(rateQuote.status) && countdown !== '00:00' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">Submit Your Quote</h3>
                <p className="text-sm text-gray-500 mb-4">Only verified, available providers can respond.</p>
                <form onSubmit={handleSubmitBid} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quote Amount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={providerBid.amount}
                      onChange={(e) => setProviderBid({ ...providerBid, amount: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
                    <textarea
                      rows={3}
                      value={providerBid.message}
                      onChange={(e) => setProviderBid({ ...providerBid, message: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Mention inclusions, arrival ETA, etc."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    disabled={submittingBid}
                  >
                    {submittingBid ? 'Submitting...' : providerBid.amount ? 'Update Quote' : 'Submit Quote'}
                  </button>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">How countdown works?</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                <li>Providers must respond before the timer hits zero.</li>
                <li>User can accept any quote to instantly create a booking.</li>
                <li>Once accepted, other quotes are rejected automatically.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

