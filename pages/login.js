import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { Mail, Phone, Lock, ArrowRight, Home } from 'lucide-react'

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [loginType, setLoginType] = useState('email') // 'email' or 'phone'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data } = await axios.post('/api/auth/login', {
        email: loginType === 'email' ? formData.email : null,
        phone: loginType === 'phone' ? formData.phone : null,
        password: formData.password
      })

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: loginType === 'email' ? formData.email : formData.phone,
        password: formData.password
      })

      if (signInError) throw signInError

      toast.success('Welcome back!')

      const role = data.user?.role
      if (role === 'superadmin') {
        router.push('/admin/super-dashboard')
      } else if (role === 'admin') {
        router.push('/admin/dashboard')
      } else if (role === 'provider') {
        router.push('/provider/dashboard')
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Validation failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col relative overflow-hidden">
      {/* Abstract Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/50 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/50 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <nav className="relative z-10 p-8">
        <Link href="/" className="flex items-center gap-2 text-gray-900 font-black text-xl tracking-tighter hover:opacity-70 transition-opacity">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white">
            <Home className="w-5 h-5" />
          </div>
          GKK
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-[480px]">
          <div className="glass-premium bg-white/70 rounded-[48px] p-10 border border-white shadow-2xl">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Welcome <span className="text-purple-600">Back</span></h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Secure login to your account</p>
            </div>

            {/* Login Type Toggle */}
            <div className="bg-gray-100/50 p-1.5 rounded-[24px] flex gap-1 mb-8">
              <button
                type="button"
                onClick={() => setLoginType('email')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[20px] font-black text-xs transition-all ${loginType === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                <Mail className={`w-4 h-4 ${loginType === 'email' ? 'text-purple-600' : ''}`} /> Email
              </button>
              <button
                type="button"
                onClick={() => setLoginType('phone')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[20px] font-black text-xs transition-all ${loginType === 'phone' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                <Phone className={`w-4 h-4 ${loginType === 'phone' ? 'text-purple-600' : ''}`} /> Phone
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                    {loginType === 'email' ? <Mail className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                  </div>
                  <input
                    type={loginType === 'email' ? 'email' : 'tel'}
                    required
                    value={loginType === 'email' ? formData.email : formData.phone}
                    onChange={(e) => setFormData({ ...formData, [loginType]: e.target.value })}
                    className="w-full bg-white border border-gray-100 p-5 pl-14 rounded-[24px] focus:ring-4 focus:ring-purple-100 outline-none font-bold text-gray-700 transition-all placeholder:text-gray-300"
                    placeholder={loginType === 'email' ? "Email Address" : "Phone Number"}
                  />
                </div>

                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-white border border-gray-100 p-5 pl-14 rounded-[24px] focus:ring-4 focus:ring-purple-100 outline-none font-bold text-gray-700 transition-all placeholder:text-gray-300"
                    placeholder="Password"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Link href="/forgot-password" size="sm" className="text-xs font-black text-purple-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-purple-600 hover:bg-purple-700 text-white rounded-[24px] font-black text-lg shadow-xl shadow-purple-200 hover:shadow-purple-300 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Authenticating...' : (
                  <>Sign In <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-gray-400 font-bold text-sm tracking-tight">
                New to GKK? <Link href="/signup" className="text-purple-600 hover:underline">Create an account</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
