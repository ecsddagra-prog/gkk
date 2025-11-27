import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { formatCurrency, formatDateTime } from '../lib/utils'

export default function Wallet({ user }) {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [topupAmount, setTopupAmount] = useState('500')
  const [addingFunds, setAddingFunds] = useState(false)

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
      // Load profile
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profileData)

      // Load transactions
      const { data: transactionsData } = await supabase
        .from('wallet_transactions')
        .select('*, booking:bookings(booking_number)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      setTransactions(transactionsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddBalance = async (e) => {
    e.preventDefault()
    const numericAmount = Number(topupAmount)
    if (!numericAmount || numericAmount < 50) {
      toast.error('Minimum top-up amount is ₹50')
      return
    }

    setAddingFunds(true)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const { data } = await axios.post('/api/wallet/add-balance', {
        amount: numericAmount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      try {
        await axios.post('/api/wallet/webhook', {
          topup_id: data.topup.id,
          status: 'success',
          reference_id: `MOCK-${Date.now()}`
        })
        toast.success('Wallet topped up successfully!')
      } catch (webhookError) {
        console.warn('Wallet webhook simulation failed', webhookError)
        toast.success('Top-up initiated. Waiting for payment confirmation.')
      }

      loadData()
    } catch (error) {
      console.error('Add balance error:', error)
      toast.error(error.response?.data?.error || 'Failed to add balance')
    } finally {
      setAddingFunds(false)
    }
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
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-blue-600">My Wallet</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 text-white mb-8">
          <div className="text-sm opacity-90 mb-2">Current Balance</div>
          <div className="text-4xl font-bold mb-4">{formatCurrency(profile?.wallet_balance || 0)}</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="opacity-75">Total Cashback</div>
              <div className="text-xl font-semibold">{formatCurrency(profile?.total_cashback || 0)}</div>
            </div>
            <div>
              <div className="opacity-75">Reward Points</div>
              <div className="text-xl font-semibold">{profile?.total_rewards || 0} pts</div>
            </div>
          </div>
        </div>

        {/* Add Balance */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Add Balance</h2>
          <form onSubmit={handleAddBalance} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
              <input
                type="number"
                min="50"
                step="50"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter amount"
              />
              <p className="text-xs text-gray-500 mt-1">Mock payment will auto-complete in sandbox</p>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={addingFunds}
                className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {addingFunds ? 'Processing...' : 'Add Money'}
              </button>
            </div>
          </form>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Transaction History</h2>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map(transaction => (
                <div key={transaction.id} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold capitalize">{transaction.transaction_type}</div>
                      <div className="text-sm text-gray-600">{transaction.description}</div>
                      {transaction.booking && (
                        <div className="text-xs text-gray-500 mt-1">
                          Booking: {transaction.booking.booking_number}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDateTime(transaction.created_at)}
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${
                      transaction.transaction_type === 'credit' || 
                      transaction.transaction_type === 'cashback' || 
                      transaction.transaction_type === 'reward'
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.transaction_type === 'credit' || 
                       transaction.transaction_type === 'cashback' || 
                       transaction.transaction_type === 'reward'
                        ? '+' 
                        : '-'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </div>
                  </div>
                  {transaction.balance_after !== null && (
                    <div className="text-xs text-gray-500 mt-2">
                      Balance: {formatCurrency(transaction.balance_after)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

