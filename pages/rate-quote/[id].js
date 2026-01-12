import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { formatCurrency, formatDateTime, formatDate } from '../../lib/utils'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { Calendar, MapPin, Clock, ArrowRight, Zap, Star, ShieldCheck, ChevronLeft } from 'lucide-react'

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

    const updateTimer = () => {
      const diff = new Date(rateQuote.expires_at).getTime() - Date.now()
      if (diff <= 0) {
        setCountdown('00:00')
        return false
      }
      const minutes = Math.floor(diff / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setCountdown(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
      return true
    }

    // Run immediately
    if (!updateTimer()) return

    const timer = setInterval(() => {
      if (!updateTimer()) clearInterval(timer)
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
    <div className="min-h-screen bg-[#F8F9FD]">
      <Header user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb / Back */}
        <div className="mb-8">
          <Link href={isOwner ? '/bookings' : '/provider/dashboard'} className="inline-flex items-center gap-2 text-sm font-black text-gray-400 hover:text-purple-600 transition-colors uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-10">
            <div className="glass-premium bg-white/70 rounded-[48px] p-10 shadow-2xl border border-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>

              <div className="flex justify-between items-start mb-10 relative z-10">
                <div>
                  <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">{rateQuote.service?.category?.name || 'Service Negotiation'}</p>
                  <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter leading-none">{rateQuote.service?.name}</h2>
                </div>
                <span className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${rateQuote.status === 'converted'
                  ? 'bg-green-100 text-green-600'
                  : rateQuote.status === 'cancelled' || rateQuote.status === 'expired'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-orange-100 text-orange-600'
                  }`}>
                  {rateQuote.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 relative z-10">
                <div className="bg-gray-900 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Clock className="w-12 h-12" /></div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Live Auction Ends In</p>
                  <p className="text-4xl font-black tracking-tight">{countdown}</p>
                  <p className="text-[10px] font-bold text-white/20 mt-2">Closes at {formatDateTime(rateQuote.expires_at)}</p>
                </div>
                <div className="glass-premium bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Target Budget</p>
                  <p className="text-4xl font-black text-gray-900 tracking-tight">{rateQuote.requested_price ? formatCurrency(rateQuote.requested_price) : 'OPEN BID'}</p>
                  <p className="text-[10px] font-bold text-purple-400 mt-2 uppercase tracking-widest flex items-center gap-1"><Zap className="w-3 h-3" /> Preferred Rate</p>
                </div>
              </div>

              <div className="space-y-6 pt-10 border-t border-gray-100 relative z-10">
                {rateQuote.details?.sub_service_names && (
                  <div className="bg-purple-50/50 rounded-2xl p-6 border border-purple-100">
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">Requested Scope</p>
                    <p className="text-sm font-bold text-purple-900 italic leading-relaxed">"{rateQuote.details.sub_service_names}"</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Site Location</p>
                      <p className="text-xs font-bold text-gray-700 truncate max-w-[200px]">{rateQuote.details?.service_address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Preferred Schedule</p>
                      <p className="text-xs font-bold text-gray-700">
                        {rateQuote.details?.scheduled_date ? formatDateTime(rateQuote.details.scheduled_date) : 'Flexible'}
                      </p>
                      {rateQuote.details?.waiting_time_flexibility && (
                        <p className="text-[10px] text-purple-600 font-black uppercase tracking-wider mt-1">
                          Flex: {rateQuote.details.waiting_time_flexibility}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider List */}
            <div className="glass-premium bg-white/70 rounded-[48px] p-10 shadow-xl border border-white">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Professional Bids</h3>
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg shadow-purple-100">{activeQuotes.length} Response(s)</span>
              </div>

              {activeQuotes.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200">
                  <div className="animate-pulse flex flex-col items-center">
                    <Zap className="w-12 h-12 text-gray-200 mb-4" />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                      {rateQuote.status === 'expired' ? 'Session Expired' : 'Notifying expert pros...'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeQuotes.map(quote => (
                    <div key={quote.id} className="glass-premium bg-white/50 rounded-[32px] p-8 border border-white shadow-sm hover:shadow-md transition-all">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white text-lg font-black">
                              {quote.provider?.business_name?.charAt(0) || 'P'}
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Certified Pro</p>
                              <h4 className="text-lg font-black text-gray-900 uppercase tracking-tighter">{quote.provider?.business_name || 'Verified Pro'}</h4>
                            </div>
                          </div>
                          <div className="text-4xl font-black text-purple-600 tracking-tighter">{formatCurrency(quote.quoted_price)}</div>
                          {quote.message && (
                            <div className="mt-4 p-4 bg-white/80 rounded-2xl border border-purple-50">
                              <p className="text-xs font-bold text-gray-500 italic leading-relaxed">"{quote.message}"</p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-4 w-full md:w-auto">
                          <span className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-sm ${quote.status === 'accepted'
                            ? 'bg-green-100 text-green-600'
                            : quote.status === 'rejected'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-white text-orange-600 border border-orange-100'
                            }`}>
                            {quote.status}
                          </span>
                          {isOwner && rateQuote.status !== 'converted' && quote.status === 'pending' && (
                            <button
                              onClick={() => handleAcceptQuote(quote.id)}
                              className="w-full md:w-auto px-8 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 flex items-center gap-2 group"
                              disabled={acceptingQuote}
                            >
                              {acceptingQuote ? 'Processing...' : 'Accept & Book'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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

          {/* Right Panel: Submission / Info */}
          <div className="space-y-10">
            {/* Bid Form for Providers */}
            {!isOwner && providerId && !['converted', 'expired', 'cancelled'].includes(rateQuote.status) && countdown !== '00:00' && (
              <div className="bg-gray-900 text-white rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -ml-16 -mt-16"></div>
                <h3 className="text-xl font-black uppercase tracking-tighter mb-2 italic">Send Your Bid</h3>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-8">Exclusive to verified professionals</p>

                <form onSubmit={handleSubmitBid} className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Quote Amount (INR)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-purple-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        required
                        value={providerBid.amount}
                        onChange={(e) => setProviderBid({ ...providerBid, amount: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 p-5 pl-10 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none font-black text-2xl tracking-tighter"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Expert Note</label>
                    <textarea
                      rows={4}
                      value={providerBid.message}
                      onChange={(e) => setProviderBid({ ...providerBid, message: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none font-bold text-sm text-white/80 placeholder:text-white/10"
                      placeholder="Special inclusions, time estimate..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-purple-500/10 active:scale-95 disabled:opacity-50"
                    disabled={submittingBid}
                  >
                    {submittingBid ? 'Submitting...' : providerBid.amount ? 'Update Bid' : 'Submit Bid'}
                  </button>
                </form>
              </div>
            )}

            <div className="glass-premium bg-white/70 rounded-[40px] p-10 border border-white shadow-xl">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-6 italic">Secure Auction</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0"><ShieldCheck className="w-4 h-4" /></div>
                  <p className="text-xs font-bold text-gray-500 leading-relaxed">Top-rated pros receive instant alerts for your request.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0"><Zap className="w-4 h-4" /></div>
                  <p className="text-xs font-bold text-gray-500 leading-relaxed">Auction ends instantly when you accept any bid.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0"><Star className="w-4 h-4" /></div>
                  <p className="text-xs font-bold text-gray-500 leading-relaxed">Compare prices and pro profiles side-by-side.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
