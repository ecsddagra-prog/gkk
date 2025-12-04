import { useEffect, useState } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

export default function PerformanceChart({ period, stats }) {
    const [chartData, setChartData] = useState(null)

    useEffect(() => {
        generateChartData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [period, stats])

    const generateChartData = () => {
        const days = period === '7days' ? 7 : 30
        const labels = []
        const data = []

        // Generate mock data based on total earnings
        const baseEarning = stats?.totalEarnings || 10000
        const dailyAverage = baseEarning / days

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)

            if (period === '7days') {
                labels.push(date.toLocaleDateString('en-IN', { weekday: 'short' }))
            } else {
                labels.push(date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }))
            }

            // Generate realistic fluctuating data
            const variance = dailyAverage * 0.3
            const value = dailyAverage + (Math.random() * variance * 2 - variance)
            data.push(Math.max(0, Math.round(value)))
        }

        setChartData({
            labels,
            datasets: [
                {
                    label: 'Revenue (₹)',
                    data,
                    borderColor: 'rgb(99, 102, 241)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: 'rgb(99, 102, 241)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                }
            ]
        })
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(99, 102, 241, 0.5)',
                borderWidth: 1,
                displayColors: false,
                callbacks: {
                    label: function (context) {
                        return `₹${context.parsed.y.toLocaleString('en-IN')}`
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false
                },
                ticks: {
                    font: {
                        size: 11
                    },
                    color: '#6B7280'
                }
            },
            y: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    font: {
                        size: 11
                    },
                    color: '#6B7280',
                    callback: function (value) {
                        return '₹' + (value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value)
                    }
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        }
    }

    if (!chartData) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div style={{ height: '300px', width: '100%' }}>
            <Line data={chartData} options={options} />
        </div>
    )
}
