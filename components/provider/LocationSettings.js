import { useState } from 'react'

export default function LocationSettings() {
    return (
        <div className="max-w-2xl space-y-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-yellow-900 mb-2">Location Settings</h3>
                <p className="text-sm text-yellow-700">
                    This feature is temporarily disabled. Please contact support for location configuration.
                </p>
            </div>
        </div>
    )
}
