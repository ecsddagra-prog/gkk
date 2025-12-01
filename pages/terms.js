import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Terms() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="bg-white shadow rounded-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms and Conditions</h1>
                    <div className="prose prose-purple max-w-none text-gray-600">
                        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">1. Introduction</h2>
                        <p className="mb-4">
                            Welcome to Home Solution. By accessing our website and using our services, you agree to be bound by these Terms and Conditions.
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">2. Use of Services</h2>
                        <p className="mb-4">
                            Our platform connects customers with service professionals. We are not responsible for the conduct of any user or the quality of services provided by professionals, although we strive to maintain high standards through our verification process.
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">3. User Accounts</h2>
                        <p className="mb-4">
                            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">4. Payments</h2>
                        <p className="mb-4">
                            Payments for services are processed securely through our platform. Prices are subject to change and may vary by location and service provider.
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">5. Cancellation and Refunds</h2>
                        <p className="mb-4">
                            Cancellations made within 24 hours of the scheduled service time may incur a fee. Refunds are processed according to our refund policy.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
