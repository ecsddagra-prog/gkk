import { useState } from 'react'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Help() {
    const [openIndex, setOpenIndex] = useState(null)

    const faqs = [
        {
            question: "How do I book a service?",
            answer: "You can book a service by browsing our categories or searching for a specific service. Select the service, choose a convenient time slot, and proceed to checkout."
        },
        {
            question: "How are professionals verified?",
            answer: "All professionals on our platform undergo a rigorous background check, including identity verification and criminal record checks. We also verify their skills and certifications."
        },
        {
            question: "What if I'm not satisfied with the service?",
            answer: "We have a satisfaction guarantee. If you're not happy with the service, please contact our support team within 24 hours, and we will address the issue or provide a refund."
        },
        {
            question: "Can I reschedule my booking?",
            answer: "Yes, you can reschedule your booking up to 4 hours before the scheduled time through the 'My Bookings' section in your dashboard."
        },
        {
            question: "How do I pay for services?",
            answer: "We accept various payment methods including credit/debit cards, UPI, and net banking. You can also choose to pay cash after the service is completed."
        }
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="bg-purple-700 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Help Center</h1>
                    <p className="text-purple-100 text-xl max-w-2xl mx-auto">
                        Find answers to common questions and get support.
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white shadow rounded-lg overflow-hidden">
                            <button
                                className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            >
                                <span className="font-medium text-gray-900">{faq.question}</span>
                                <span className="ml-6 text-purple-600 text-xl">
                                    {openIndex === index ? '−' : '+'}
                                </span>
                            </button>
                            {openIndex === index && (
                                <div className="px-6 pb-4 text-gray-600 bg-gray-50 border-t border-gray-100">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-12 bg-blue-50 rounded-xl p-8 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Still need help?</h3>
                    <p className="text-gray-600 mb-6">Our support team is available 24/7 to assist you.</p>
                    <Link
                        href="/contact"
                        className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                        Contact Support
                    </Link>
                </div>
            </div>

            <Footer />
        </div>
    )
}
