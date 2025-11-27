export default function TrustBadge({ icon, value, label }) {
    return (
        <div className="flex flex-col items-center text-center p-4">
            <div className="text-4xl mb-2">{icon}</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
            <div className="text-sm text-gray-600">{label}</div>
        </div>
    )
}
