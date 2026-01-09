import Link from 'next/link'
export default function Header({ user, onSearch }) {
    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-inner">H</div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">Home Solution</h1>
                    </Link>

                    {/* Search Bar (Centered) */}
                    <div className="flex-1 max-w-xl px-4 md:px-12">
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </span>
                            <input
                                type="text"
                                onChange={(e) => onSearch && onSearch(e.target.value)}
                                placeholder="Search for any service..."
                                className="w-full bg-gray-100 border-none rounded-2xl py-3 pl-12 pr-4 text-gray-900 focus:ring-2 focus:ring-purple-600 transition-all placeholder:text-gray-500"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-full relative transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        {user ? (
                            <Link href="/profile" className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-2xl transition-colors">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-700 font-bold overflow-hidden border-2 border-white shadow-sm">
                                    <span className="text-sm">{user.email?.charAt(0).toUpperCase()}</span>
                                </div>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login" className="px-4 py-2 text-gray-700 font-medium hover:text-purple-600 transition">
                                    Login
                                </Link>
                                <Link
                                    href="/signup"
                                    className="px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-md active:scale-95"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
