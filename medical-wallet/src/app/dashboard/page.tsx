'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts'
import { 
  Activity, Users, Heart, Hospital, ShoppingBag, Calendar, 
  Filter, Download, ChevronDown, ChevronUp 
} from 'lucide-react'

interface HealthData {
  year: number
  country: string
  life_expectancy: number
  adult_mortality: number
  infant_deaths: number
  alcohol: number
  percentage_expenditure: number
  hepatitis_b: number
  measles: number
  bmi: number
  under_five_deaths: number
  polio: number
  total_expenditure: number
  diphtheria: number
  hiv_aids: number
  gdp: number
  population: number
  thinness_10_19_years: number
  thinness_5_9_years: number
  income_composition_of_resources: number
  schooling: number
}

export default function Dashboard() {
  const [healthData, setHealthData] = useState<HealthData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('last6months')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedMetrics, setSelectedMetrics] = useState(['life_expectancy', 'adult_mortality', 'gdp'])

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const response = await fetch('/Global_Health_Statistics.csv')
        const text = await response.text()
        const rows = text.split('\n')
        const headers = rows[0].split(',')
        
        const data = rows.slice(1).map(row => {
          const values = row.split(',')
          const entry: any = {}
          headers.forEach((header, index) => {
            entry[header.trim()] = parseFloat(values[index]) || values[index]
          })
          return entry as HealthData
        })
        
        setHealthData(data)
      } catch (error) {
        console.error('Error fetching health data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHealthData()
  }, [])

  const toggleMetric = (metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    )
  }

  // Process data for charts
  const processedData = {
    lifeExpectancy: healthData
      .filter(d => d.life_expectancy)
      .sort((a, b) => a.year - b.year)
      .map(d => ({
        year: d.year,
        value: d.life_expectancy
      })),
    
    mortality: healthData
      .filter(d => d.adult_mortality)
      .sort((a, b) => a.year - b.year)
      .map(d => ({
        year: d.year,
        value: d.adult_mortality
      })),
    
    gdp: healthData
      .filter(d => d.gdp)
      .sort((a, b) => a.year - b.year)
      .map(d => ({
        year: d.year,
        value: d.gdp
      }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading health statistics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Global Health Statistics Dashboard</h1>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              <Filter className="h-5 w-5" />
              Filters
              {showFilters ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all">
              <Download className="h-5 w-5" />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="last6months">Last 6 Months</option>
                  <option value="lastyear">Last Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Metrics</label>
                <div className="flex flex-wrap gap-2">
                  {['life_expectancy', 'adult_mortality', 'gdp'].map(metric => (
                    <button
                      key={metric}
                      onClick={() => toggleMetric(metric)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedMetrics.includes(metric)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {metric.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Life Expectancy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(healthData.reduce((acc, curr) => acc + curr.life_expectancy, 0) / healthData.length)} years
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Adult Mortality</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(healthData.reduce((acc, curr) => acc + curr.adult_mortality, 0) / healthData.length)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Hospital className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average GDP</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${Math.round(healthData.reduce((acc, curr) => acc + curr.gdp, 0) / healthData.length).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Data Points</p>
                <p className="text-2xl font-bold text-gray-900">{healthData.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Life Expectancy Trend */}
          {selectedMetrics.includes('life_expectancy') && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Life Expectancy Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={processedData.lifeExpectancy}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Adult Mortality Trend */}
          {selectedMetrics.includes('adult_mortality') && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Adult Mortality Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processedData.mortality}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* GDP Trend */}
        {selectedMetrics.includes('gdp') && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">GDP Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedData.gdp}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}