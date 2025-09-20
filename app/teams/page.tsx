'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import {
  MapPin,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Phone,
  MessageSquare,
  Navigation,
  Activity,
  Filter,
  Search,
  Settings,
  Bell,
  Zap,
  Truck,
  Wrench,
  Battery,
  Signal,
  Eye,
  Send,
  Timer,
  DollarSign,
  TrendingUp,
  Wifi,
  WifiOff,
  Radio,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Target,
  Calendar,
  Star,
  ThermometerSun,
  Droplets,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown,
  Maximize2,
  Volume2,
  VolumeX,
} from 'lucide-react'

type ContractorStatus = 'available' | 'en-route' | 'on-job' | 'break' | 'offline'
type JobPriority = 'emergency' | 'urgent' | 'standard'
type JobStatus = 'pending' | 'assigned' | 'in-progress' | 'completed'

interface Contractor {
  id: string
  name: string
  status: ContractorStatus
  location: { lat: number; lng: number }
  specialty: string
  rating: number
  jobsCompleted: number
  responseTime: number
  currentJob?: string
  eta?: number
  lastUpdate: Date
  phone: string
  hourlyRate: number
  avatar: string
}

interface Job {
  id: string
  title: string
  priority: JobPriority
  status: JobStatus
  location: { lat: number; lng: number; address: string }
  customer: {
    name: string
    phone: string
    rating: number
  }
  description: string
  estimatedDuration: number
  hourlyRate: number
  assignedTo?: string
  createdAt: Date
  completedAt?: Date
  category: string
  emergencyLevel?: number
}

export default function TeamsPage() {
  const [selectedContractor, setSelectedContractor] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [timeFilter, setTimeFilter] = useState('today')
  const [statusFilter, setStatusFilter] = useState('all')

  // Mock real-time data
  const [contractors, setContractors] = useState<Contractor[]>([
    {
      id: 'c1',
      name: 'Mike Rodriguez',
      status: 'en-route',
      location: { lat: 40.7589, lng: -73.9851 },
      specialty: 'HVAC',
      rating: 4.9,
      jobsCompleted: 247,
      responseTime: 8,
      currentJob: 'j1',
      eta: 12,
      lastUpdate: new Date(),
      phone: '+1-555-0123',
      hourlyRate: 125,
      avatar: 'MR'
    },
    {
      id: 'c2',
      name: 'Sarah Chen',
      status: 'on-job',
      location: { lat: 40.7614, lng: -73.9776 },
      specialty: 'Electrical',
      rating: 4.8,
      jobsCompleted: 189,
      responseTime: 6,
      currentJob: 'j2',
      lastUpdate: new Date(Date.now() - 300000),
      phone: '+1-555-0124',
      hourlyRate: 135,
      avatar: 'SC'
    },
    {
      id: 'c3',
      name: 'David Park',
      status: 'available',
      location: { lat: 40.7505, lng: -73.9934 },
      specialty: 'Plumbing',
      rating: 4.7,
      jobsCompleted: 156,
      responseTime: 11,
      lastUpdate: new Date(Date.now() - 120000),
      phone: '+1-555-0125',
      hourlyRate: 110,
      avatar: 'DP'
    },
    {
      id: 'c4',
      name: 'Lisa Thompson',
      status: 'break',
      location: { lat: 40.7282, lng: -73.7949 },
      specialty: 'Locksmith',
      rating: 4.9,
      jobsCompleted: 203,
      responseTime: 5,
      lastUpdate: new Date(Date.now() - 900000),
      phone: '+1-555-0126',
      hourlyRate: 95,
      avatar: 'LT'
    },
    {
      id: 'c5',
      name: 'Alex Miller',
      status: 'en-route',
      location: { lat: 40.7831, lng: -73.9712 },
      specialty: 'Auto',
      rating: 4.6,
      jobsCompleted: 134,
      responseTime: 9,
      currentJob: 'j3',
      eta: 18,
      lastUpdate: new Date(Date.now() - 60000),
      phone: '+1-555-0127',
      hourlyRate: 85,
      avatar: 'AM'
    }
  ])

  const [jobs, setJobs] = useState<Job[]>([
    {
      id: 'j1',
      title: 'HVAC System Failure',
      priority: 'emergency',
      status: 'assigned',
      location: { lat: 40.7589, lng: -73.9851, address: '123 Broadway, NYC' },
      customer: { name: 'John Smith', phone: '+1-555-9001', rating: 4.8 },
      description: 'Complete AC failure in office building, 90°F inside',
      estimatedDuration: 180,
      hourlyRate: 125,
      assignedTo: 'c1',
      createdAt: new Date(Date.now() - 3600000),
      category: 'HVAC',
      emergencyLevel: 9
    },
    {
      id: 'j2',
      title: 'Electrical Sparking Outlet',
      priority: 'emergency',
      status: 'in-progress',
      location: { lat: 40.7614, lng: -73.9776, address: '456 5th Ave, NYC' },
      customer: { name: 'Emma Davis', phone: '+1-555-9002', rating: 4.5 },
      description: 'Outlet sparking in kitchen, safety hazard',
      estimatedDuration: 120,
      hourlyRate: 135,
      assignedTo: 'c2',
      createdAt: new Date(Date.now() - 7200000),
      category: 'Electrical',
      emergencyLevel: 8
    },
    {
      id: 'j3',
      title: 'Car Lockout - Airport',
      priority: 'urgent',
      status: 'assigned',
      location: { lat: 40.7831, lng: -73.9712, address: 'JFK Airport Terminal 4' },
      customer: { name: 'Robert Wilson', phone: '+1-555-9003', rating: 4.9 },
      description: 'Locked keys in rental car, flight in 2 hours',
      estimatedDuration: 30,
      hourlyRate: 85,
      assignedTo: 'c5',
      createdAt: new Date(Date.now() - 1800000),
      category: 'Auto',
      emergencyLevel: 6
    },
    {
      id: 'j4',
      title: 'Kitchen Sink Clog',
      priority: 'standard',
      status: 'pending',
      location: { lat: 40.7505, lng: -73.9934, address: '789 Park Ave, NYC' },
      customer: { name: 'Maria Garcia', phone: '+1-555-9004', rating: 4.7 },
      description: 'Complete blockage in kitchen sink drain',
      estimatedDuration: 90,
      hourlyRate: 110,
      createdAt: new Date(Date.now() - 900000),
      category: 'Plumbing',
      emergencyLevel: 3
    }
  ])

  // Real-time updates simulation
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // Simulate contractor location updates
      setContractors(prev => prev.map(contractor => {
        if (contractor.status === 'en-route') {
          return {
            ...contractor,
            location: {
              lat: contractor.location.lat + (Math.random() - 0.5) * 0.001,
              lng: contractor.location.lng + (Math.random() - 0.5) * 0.001
            },
            eta: Math.max(1, (contractor.eta || 15) - 1),
            lastUpdate: new Date()
          }
        }
        return { ...contractor, lastUpdate: new Date() }
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  // Calculate metrics
  const metrics = {
    activeTeam: contractors.filter(c => c.status !== 'offline').length,
    avgResponse: Math.round(contractors.reduce((sum, c) => sum + c.responseTime, 0) / contractors.length),
    jobsToday: jobs.length,
    emergencyJobs: jobs.filter(j => j.priority === 'emergency').length,
    completionRate: 94,
    revenue: 15420
  }

  const getStatusColor = (status: ContractorStatus) => {
    switch (status) {
      case 'available': return 'bg-emerald-500'
      case 'en-route': return 'bg-blue-500'
      case 'on-job': return 'bg-amber-500'
      case 'break': return 'bg-gray-400'
      case 'offline': return 'bg-red-500'
    }
  }

  const getPriorityColor = (priority: JobPriority) => {
    switch (priority) {
      case 'emergency': return 'bg-red-500'
      case 'urgent': return 'bg-amber-500'
      case 'standard': return 'bg-blue-500'
    }
  }

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}h ${minutes % 60}m ago`
    return `${minutes}m ago`
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 ${isFullscreen ? 'fixed inset-0 z-50' : ''} -mx-3 sm:-mx-4 lg:-mx-6`}>
      {/* Simplified Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between py-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              Rushr Teams
            </h1>
            <p className="text-slate-600 mt-1">Dispatch Operations</p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-sm px-3 py-1 rounded-full ${autoRefresh ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
              {autoRefresh ? 'LIVE' : 'PAUSED'}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
            </Button>

            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Essential Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active Team</p>
                <p className="text-2xl font-bold text-slate-900">{metrics.activeTeam}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Emergency</p>
                <p className="text-2xl font-bold text-slate-900">{metrics.emergencyJobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Avg Response</p>
                <p className="text-2xl font-bold text-slate-900">{metrics.avgResponse}m</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Jobs Today</p>
                <p className="text-2xl font-bold text-slate-900">{metrics.jobsToday}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 pb-20">
          {/* Enhanced Team Panel */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-600" />
                    Live Team Status
                  </CardTitle>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[calc(100%-80px)] overflow-y-auto">
                <AnimatePresence>
                  {contractors.map((contractor) => (
                    <div
                      key={contractor.id}
                      onClick={() => setSelectedContractor(contractor.id)}
                      className={`p-4 rounded-lg border bg-white hover:shadow-sm transition cursor-pointer ${
                        selectedContractor === contractor.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {contractor.avatar}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(contractor.status)} rounded-full border-2 border-white`}></div>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900">{contractor.name}</div>
                          <div className="text-sm text-slate-600">{contractor.specialty}</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm capitalize font-medium text-slate-700">{contractor.status.replace('-', ' ')}</span>
                          {contractor.eta && (
                            <span className="text-sm text-emerald-600 font-medium">ETA {contractor.eta}m</span>
                          )}
                        </div>

                        {contractor.currentJob && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Truck className="h-4 w-4 text-blue-500" />
                            <span>Job #{contractor.currentJob}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{contractor.jobsCompleted} jobs</span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-500" />
                            {contractor.rating}
                          </span>
                          <span>${contractor.hourlyRate}/hr</span>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Phone className="h-3 w-3 mr-1" />
                            Call
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Text
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Live Map */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Live Operations Map
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Filter className="h-4 w-4 mr-1" />
                      Filter
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Search className="h-4 w-4 mr-1" />
                      Search
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="relative h-[500px] bg-slate-100 rounded-lg overflow-hidden">
                  {/* Simple Map Grid */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `
                      linear-gradient(rgba(100,116,139,0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(100,116,139,0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px',
                  }} />

                  {/* Contractor Markers */}
                  <div className="absolute inset-4">
                    {contractors.map((contractor, index) => (
                      <div
                        key={contractor.id}
                        className="absolute cursor-pointer"
                        style={{
                          left: `${20 + (index * 15)}%`,
                          top: `${25 + (index * 12)}%`
                        }}
                        onClick={() => setSelectedContractor(contractor.id)}
                      >
                        <div className={`w-8 h-8 ${getStatusColor(contractor.status)} rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold`}>
                          {contractor.avatar.charAt(0)}
                        </div>

                        {contractor.eta && (
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                            {contractor.eta}m
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Job Markers */}
                    {jobs.filter(j => j.status === 'pending').map((job, index) => (
                      <div
                        key={job.id}
                        className="absolute cursor-pointer"
                        style={{
                          left: `${60 + (index * 12)}%`,
                          top: `${30 + (index * 15)}%`
                        }}
                        onClick={() => setSelectedJob(job.id)}
                      >
                        <div className={`w-6 h-6 ${getPriorityColor(job.priority)} rounded-full border-2 border-white shadow-lg`}>
                        </div>
                        {job.priority === 'emergency' && (
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-lg">🚨</div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Simplified Legend */}
                  <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-sm">
                    <div className="text-sm font-medium mb-2">Team Status</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        <span>Available ({contractors.filter(c => c.status === 'available').length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>En Route ({contractors.filter(c => c.status === 'en-route').length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                        <span>On Job ({contractors.filter(c => c.status === 'on-job').length})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Job Management */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Priority Queue
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {jobs.filter(j => j.status === 'pending').map((job) => (
                    <div
                      key={job.id}
                      className={`p-4 rounded-lg border transition cursor-pointer ${
                        job.priority === 'emergency' ? 'border-red-300 bg-red-50' :
                        job.priority === 'urgent' ? 'border-amber-300 bg-amber-50' :
                        'border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 ${getPriorityColor(job.priority)} rounded-full`}></div>
                        <span className="font-semibold text-sm">{job.priority.toUpperCase()}</span>
                        <span className="text-xs text-slate-500 ml-auto">{formatTime(job.createdAt)}</span>
                      </div>

                      <h4 className="font-semibold text-slate-900 mb-1">{job.title}</h4>
                      <p className="text-sm text-slate-600 mb-2">{job.customer.name}</p>
                      <p className="text-xs text-slate-500 mb-3 line-clamp-2">{job.description}</p>

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500">📍 {job.location.address.split(',')[0]}</span>
                        <span className="text-xs text-slate-500">{job.estimatedDuration}min est</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-emerald-600">${job.hourlyRate}/hr</span>
                        <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700">
                          Assign
                        </Button>
                      </div>
                    </div>
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start h-auto p-3" size="sm">
                  <div className="bg-red-500 text-white p-2 rounded mr-3">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Emergency Broadcast</div>
                    <div className="text-xs text-slate-500">Alert all available team</div>
                  </div>
                </Button>

                <Button variant="outline" className="w-full justify-start h-auto p-3" size="sm">
                  <div className="bg-blue-500 text-white p-2 rounded mr-3">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Team Check-in</div>
                    <div className="text-xs text-slate-500">Status update request</div>
                  </div>
                </Button>

                <Button variant="outline" className="w-full justify-start h-auto p-3" size="sm">
                  <div className="bg-amber-500 text-white p-2 rounded mr-3">
                    <Target className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Route Optimization</div>
                    <div className="text-xs text-slate-500">Optimize all routes</div>
                  </div>
                </Button>

                <Button variant="outline" className="w-full justify-start h-auto p-3" size="sm">
                  <div className="bg-purple-500 text-white p-2 rounded mr-3">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Generate Report</div>
                    <div className="text-xs text-slate-500">Performance analytics</div>
                  </div>
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}