import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import { User, Mail, Phone, Lock, ArrowRight, Home, Gift } from 'lucide-react'

export default function Signup() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    referred_by: ''
  })
  const [loading, setLoading] = useState(false)
  const [signupType, setSignupType] = useState('email')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { data } = await axios.post('/api/auth/signup', {
        email: signupType === 'email' ? formData.email : null,
        phone: signupType === 'phone' ? formData.phone : null,
        password: formData.password,
        full_name: formData.full_name,
        referred_by: formData.referred_by || null
      })

      toast.success('Welcome to GKK!')

      const { supabase } = await import('../lib/supabase')
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: signupType === 'email' ? formData.email : formData.phone,
        password: formData.password
      })

      if (signInError) {
        router.push('/login')
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col relative overflow-hidden">
      {/* Abstract Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/50 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/50 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <nav className="relative z-10 p-8">
        <Link href="/" className="flex items-center gap-2 text-gray-900 font-black text-xl tracking-tighter hover:opacity-70 transition-opacity">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white">
            <Home className="w-5 h-5" />
          </div>
          GKK
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10 py-12">
        <div className="w-full max-w-[540px]">
          <div className="glass-premium bg-white/70 rounded-[48px] p-10 border border-white shadow-2xl">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Join <span className="text-purple-600">GKK</span></h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Create your premium account today</p>
            </div>

            {/* Signup Type Toggle */}
            <div className="bg-gray-100/50 p-1.5 rounded-[24px] flex gap-1 mb-8">
              <button
                type="button"
                onClick={() => setSignupType('email')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[20px] font-black text-xs transition-all ${signupType === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                <Mail className={`w-4 h-4 ${signupType === 'email' ? 'text-purple-600' : ''}`} /> Email
              </button>
              <button
                type="button"
                onClick={() => setSignupType('phone')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[20px] font-black text-xs transition-all ${signupType === 'phone' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                <Phone className={`w-4 h-4 ${signupType === 'phone' ? 'text-purple-600' : ''}`} /> Phone
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4">
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full bg-white border border-gray-100 p-5 pl-14 rounded-[24px] focus:ring-4 focus:ring-purple-100 outline-none font-bold text-gray-700 transition-all placeholder:text-gray-300"
                    placeholder="Full Name"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                    {signupType === 'email' ? <Mail className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                  </div>
                  <input
                    type={signupType === 'email' ? 'email' : 'tel'}
                    required
                    value={signupType === 'email' ? formData.email : formData.phone}
                    onChange={(e) => setFormData({ ...formData, [signupType]: e.target.value })}
                    className="w-full bg-white border border-gray-100 p-5 pl-14 rounded-[24px] focus:ring-4 focus:ring-purple-100 outline-none font-bold text-gray-700 transition-all placeholder:text-gray-300"
                    placeholder={signupType === 'email' ? "Email Address" : "Phone Number"}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-white border border-gray-100 p-5 pl-14 rounded-[24px] focus:ring-4 focus:ring-purple-100 outline-none font-bold text-gray-700 transition-all placeholder:text-gray-300 text-sm"
                      placeholder="Password"
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full bg-white border border-gray-100 p-5 pl-14 rounded-[24px] focus:ring-4 focus:ring-purple-100 outline-none font-bold text-gray-700 transition-all placeholder:text-gray-300 text-sm"
                      placeholder="Confirm"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                    <Gift className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.referred_by}
                    onChange={(e) => setFormData({ ...formData, referred_by: e.target.value })}
                    className="w-full bg-white border border-gray-100 p-5 pl-14 rounded-[24px] focus:ring-4 focus:ring-purple-100 outline-none font-bold text-gray-700 transition-all placeholder:text-gray-300"
                    placeholder="Referral Code (Optional)"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-purple-600 hover:bg-purple-700 text-white rounded-[24px] font-black text-lg shadow-xl shadow-purple-200 hover:shadow-purple-300 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {loading ? 'Creating Account...' : (
                  <>Create Account <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-gray-400 font-bold text-sm tracking-tight">
                Already have an account? <Link href="/login" className="text-purple-600 hover:underline">Sign in instead</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

