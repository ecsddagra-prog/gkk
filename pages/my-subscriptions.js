import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function MySubscriptions() {
    // ... (rest of the component)
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
                {/* ... content ... */}
            </div>
            <Footer />
        </div>
    )
}
