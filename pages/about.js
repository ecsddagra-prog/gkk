import Header from '../components/Header'
import Footer from '../components/Footer'

export default function About() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Home Solution</h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            We are on a mission to empower local professionals and provide hassle-free home services to customers globally.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Who We Are</h2>
                            <p className="text-gray-600 mb-4 text-lg">
                                Home Solution is a leading platform connecting customers with trusted, verified service professionals. From cleaning and repairs to beauty and wellness, we bring expert services right to your doorstep.
                            </p>
                            <p className="text-gray-600 text-lg">
                                Founded in 2024, we have grown to serve over 12 million customers with a network of 50,000+ skilled professionals. Our commitment to quality, safety, and reliability sets us apart.
                            </p>
                        </div>
                        <div className="bg-purple-100 rounded-2xl p-8 h-80 flex items-center justify-center">
                            <span className="text-9xl">🏠</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="p-6 bg-purple-50 rounded-xl">
                            <div className="text-4xl mb-4">🛡️</div>
                            <h3 className="text-xl font-bold mb-2">Safety First</h3>
                            <p className="text-gray-600">Rigorous background checks and safety protocols for all professionals.</p>
                        </div>
                        <div className="p-6 bg-blue-50 rounded-xl">
                            <div className="text-4xl mb-4">⚡</div>
                            <h3 className="text-xl font-bold mb-2">Fast Service</h3>
                            <p className="text-gray-600">Quick booking and on-time service delivery guaranteed.</p>
                        </div>
                        <div className="p-6 bg-green-50 rounded-xl">
                            <div className="text-4xl mb-4">💎</div>
                            <h3 className="text-xl font-bold mb-2">Quality Work</h3>
                            <p className="text-gray-600">Expert professionals trained to deliver top-notch service quality.</p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
