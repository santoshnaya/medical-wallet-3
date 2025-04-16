'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useCrashNotifications } from '../../components/CrashNotificationProvider'
import { 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Bell, 
  BellOff, 
  AlertCircle 
} from 'lucide-react'

interface CrashData {
  latitude: number;
  longitude: number;
  timestamp: number;
  severity: 'low' | 'medium' | 'high';
}

interface SMSResponse {
  success: boolean;
  message: string;
  verificationStatus?: 'pending' | 'approved';
}

const CrashDetectionPage = () => {
  const { 
    notificationStatus, 
    requestPermission, 
    simulateCrashNotification 
  } = useCrashNotifications()
  
  const [showMotionDemo, setShowMotionDemo] = useState(false)
  const [motionValues, setMotionValues] = useState({
    acceleration: { x: 0, y: 0, z: 0 },
    rotation: { alpha: 0, beta: 0, gamma: 0 }
  })
  const [motionThreshold, setMotionThreshold] = useState(20) // m/s^2
  const [location, setLocation] = useState('')
  const [isMonitoring, setIsMonitoring] = useState(false)
  
  // Handle permission request
  const handlePermissionRequest = async () => {
    await requestPermission()
  }
  
  // Start motion detection demo
  const startMotionDemo = () => {
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      setShowMotionDemo(true)
      
      window.addEventListener('devicemotion', handleMotion)
    } else {
      alert('Device motion is not supported in your browser or device.')
    }
  }
  
  // Stop motion detection demo
  const stopMotionDemo = () => {
    setShowMotionDemo(false)
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', handleMotion)
    }
  }
  
  // Handle motion events
  const handleMotion = (event: DeviceMotionEvent) => {
    const acceleration = event.accelerationIncludingGravity
    
    if (!acceleration) return
    
    // Update motion values
    setMotionValues({
      acceleration: {
        x: acceleration.x || 0,
        y: acceleration.y || 0,
        z: acceleration.z || 0
      },
      rotation: {
        alpha: event.rotationRate?.alpha || 0,
        beta: event.rotationRate?.beta || 0,
        gamma: event.rotationRate?.gamma || 0
      }
    })
    
    // Calculate total acceleration magnitude
    const totalAcceleration = Math.sqrt(
      Math.pow(acceleration.x || 0, 2) +
      Math.pow(acceleration.y || 0, 2) +
      Math.pow(acceleration.z || 0, 2)
    )
    
    // Check for sudden motion above threshold
    if (totalAcceleration > motionThreshold) {
      handleCrashDetected()
      stopMotionDemo()
    }
  }
  
  // Function to get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude},${position.coords.longitude}`)
        },
        (error) => {
          console.error('Error getting location:', error)
          toast.error('Failed to get location')
        }
      )
    }
  }
  
  const handleCrashDetected = async () => {
    try {
      getCurrentLocation()
      
      const response: SMSResponse = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: '+16284952327', // Fixed emergency contact number
          location: location || 'Location not available',
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Emergency alert sent successfully')
      } else if (data.verificationStatus === 'pending') {
        toast.success('Verification code sent. Please check your phone for the code.')
      } else {
        toast.error(`Failed to send emergency alert: ${data.details || data.error}`)
        console.error('SMS Error:', data)
      }
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(`Failed to process crash detection: ${error.message}`)
    }
  }
  
  const toggleMonitoring = () => {
    if (!isMonitoring) {
      startMotionDemo()
      getCurrentLocation()
      toast.success('Crash detection monitoring started')
    } else {
      stopMotionDemo()
      toast.success('Crash detection monitoring stopped')
    }
    
    setIsMonitoring(!isMonitoring)
  }
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('devicemotion', handleMotion)
      }
    }
  }, [])
  
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-2">Crash Detection</h1>
        <p className="text-black mb-8 font-medium">
          This system can detect falls, crashes, and sudden movements to alert emergency contacts.
        </p>
        
        {/* Notification Status */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-black mb-4">Notification Status</h2>
          
          <div className="flex items-center gap-3 mb-6">
            {notificationStatus === 'granted' ? (
              <>
                <ShieldCheck className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-bold text-black">Notifications are enabled</p>
                  <p className="text-sm text-black font-medium">
                    You will receive alerts when a crash is detected.
                  </p>
                </div>
              </>
            ) : notificationStatus === 'denied' ? (
              <>
                <ShieldAlert className="h-8 w-8 text-red-600" />
                <div>
                  <p className="font-bold text-black">Notifications are blocked</p>
                  <p className="text-sm text-black font-medium">
                    Please enable notifications in your browser settings.
                  </p>
                </div>
              </>
            ) : notificationStatus === 'unsupported' ? (
              <>
                <BellOff className="h-8 w-8 text-black" />
                <div>
                  <p className="font-bold text-black">Notifications are not supported</p>
                  <p className="text-sm text-black font-medium">
                    Your device or browser doesn't support notifications.
                  </p>
                </div>
              </>
            ) : (
              <>
                <Bell className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-bold text-black">Notification permission required</p>
                  <p className="text-sm text-black font-medium">
                    Enable notifications to receive crash alerts.
                  </p>
                </div>
              </>
            )}
          </div>
          
          <div>
            {notificationStatus !== 'granted' && notificationStatus !== 'unsupported' && (
              <button
                onClick={handlePermissionRequest}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Enable Notifications
              </button>
            )}
          </div>
        </div>
        
        {/* Motion Detection Demo */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-bold text-black mb-4">Motion Detection</h2>
          <p className="text-black mb-4 font-medium">
            This feature uses your device's motion sensors to detect sudden movements or falls.
            {showMotionDemo ? ' Move your device quickly to trigger an alert.' : ''}
          </p>
          
          {showMotionDemo && (
            <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-bold text-black mb-1">Acceleration (m/s²)</p>
                  <div className="space-y-1">
                    <p className="text-sm text-black font-medium">X: {motionValues.acceleration.x.toFixed(2)}</p>
                    <p className="text-sm text-black font-medium">Y: {motionValues.acceleration.y.toFixed(2)}</p>
                    <p className="text-sm text-black font-medium">Z: {motionValues.acceleration.z.toFixed(2)}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-bold text-black mb-1">Rotation Rate (deg/s)</p>
                  <div className="space-y-1">
                    <p className="text-sm text-black font-medium">Alpha: {motionValues.rotation.alpha.toFixed(2)}</p>
                    <p className="text-sm text-black font-medium">Beta: {motionValues.rotation.beta.toFixed(2)}</p>
                    <p className="text-sm text-black font-medium">Gamma: {motionValues.rotation.gamma.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="text-sm font-bold text-black mb-1 block">
                  Detection Threshold: {motionThreshold} m/s²
                </label>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={motionThreshold}
                  onChange={(e) => setMotionThreshold(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-sm text-black mt-1 font-medium">
                  Lower values make detection more sensitive. Higher values require more force.
                </p>
              </div>
            </div>
          )}
          
          <div className="flex gap-4">
            {!showMotionDemo ? (
              <button
                onClick={toggleMonitoring}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
              </button>
            ) : (
              <button
                onClick={stopMotionDemo}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium"
              >
                Stop Motion Detection
              </button>
            )}
          </div>
          
          <p className="text-sm text-black mt-4 font-medium">
            Note: Motion detection may not work on all devices or browsers. You must grant permission
            to access motion sensors when prompted.
          </p>
        </div>

        <div className="mt-6">
          <button
            onClick={handleCrashDetected}
            className="w-full p-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md"
          >
            Test Emergency Alert
          </button>
        </div>
      </div>
    </div>
  )
}

export default CrashDetectionPage 