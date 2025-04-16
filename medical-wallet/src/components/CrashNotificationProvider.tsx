'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  requestNotificationPermission, 
  onMessageListener, 
  sendCrashNotification 
} from '../lib/firebase'
import { Bell, BellOff } from 'lucide-react'

// Types
type NotificationStatus = 'idle' | 'granted' | 'denied' | 'unsupported'
type CrashSeverity = 'low' | 'medium' | 'high'

interface CrashNotification {
  id: string
  type: string
  severity: CrashSeverity
  message: string
  timestamp: number
  read: boolean
}

interface MessagePayload {
  data?: {
    type?: string
    severity?: CrashSeverity
    [key: string]: string | undefined
  }
  notification?: {
    title?: string
    body?: string
  }
}

interface CrashNotificationContextType {
  notificationStatus: NotificationStatus
  notifications: CrashNotification[]
  unreadCount: number
  requestPermission: () => Promise<void>
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  simulateCrashNotification: (severity: CrashSeverity) => Promise<void>
}

// Create context
const CrashNotificationContext = createContext<CrashNotificationContextType | null>(null)

// Provider component
export const CrashNotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notificationStatus, setNotificationStatus] = useState<NotificationStatus>('idle')
  const [notifications, setNotifications] = useState<CrashNotification[]>([])
  const [deviceId, setDeviceId] = useState<string>('')

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length

  // Request notification permission
  const requestPermission = async () => {
    try {
      if (!('Notification' in window)) {
        setNotificationStatus('unsupported')
        return
      }

      const token = await requestNotificationPermission()
      
      if (token) {
        setNotificationStatus('granted')
        // Generate a simple device ID if not already set
        if (!deviceId) {
          const newDeviceId = `device-${Math.random().toString(36).substring(2, 10)}`
          setDeviceId(newDeviceId)
          localStorage.setItem('deviceId', newDeviceId)
        }
      } else {
        setNotificationStatus(Notification.permission as 'granted' | 'denied')
      }
    } catch (error) {
      console.error('Error requesting permission:', error)
      setNotificationStatus('denied')
    }
  }

  // Listen for incoming messages
  useEffect(() => {
    // Check if the browser supports notifications
    if (!('Notification' in window)) {
      setNotificationStatus('unsupported')
      return
    }

    // Set initial notification status
    setNotificationStatus(Notification.permission as 'granted' | 'denied')

    // Load stored device ID
    const storedDeviceId = localStorage.getItem('deviceId')
    if (storedDeviceId) {
      setDeviceId(storedDeviceId)
    } else {
      const newDeviceId = `device-${Math.random().toString(36).substring(2, 10)}`
      setDeviceId(newDeviceId)
      localStorage.setItem('deviceId', newDeviceId)
    }

    // Load stored notifications
    const storedNotifications = localStorage.getItem('crashNotifications')
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications))
    }

    // Set up message listener
    const messageListener = onMessageListener();
    
    if (messageListener && typeof messageListener.then === 'function') {
      messageListener.then((payload: unknown) => {
        const typedPayload = payload as MessagePayload | null;
        if (!typedPayload) return;

        console.log('Foreground notification received:', typedPayload);
        
        // Show notification
        const newNotification: CrashNotification = {
          id: `crash-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          type: typedPayload.data?.type || 'crash',
          severity: (typedPayload.data?.severity as CrashSeverity) || 'medium',
          message: typedPayload.notification?.body || 'A crash has been detected',
          timestamp: Date.now(),
          read: false
        };

        // Add to notifications
        setNotifications(prev => {
          const updated = [newNotification, ...prev];
          localStorage.setItem('crashNotifications', JSON.stringify(updated));
          return updated;
        });

        // Show browser notification if in background
        if (document.visibilityState === 'hidden') {
          const notification = new Notification(typedPayload.notification?.title || 'Crash Detected', {
            body: typedPayload.notification?.body || 'A crash has been detected',
            icon: '/icons/icon-192x192.png'
          });

          notification.onclick = () => {
            window.focus();
          };
        }
      });
    }

    return () => {
      // Nothing to clean up for message listener in this implementation
    };
  }, [])

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n)
      localStorage.setItem('crashNotifications', JSON.stringify(updated))
      return updated
    })
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }))
      localStorage.setItem('crashNotifications', JSON.stringify(updated))
      return updated
    })
  }

  // Simulate a crash notification (for testing)
  const simulateCrashNotification = async (severity: CrashSeverity = 'medium') => {
    try {
      const crashTypes = ['Fall Detected', 'Sudden Impact', 'Unusual Movement', 'Vehicle Collision']
      const crashType = crashTypes[Math.floor(Math.random() * crashTypes.length)]
      
      // Get current location (if available)
      let location = null
      if ('geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            })
          })
          
          location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        } catch (err) {
          console.warn('Error getting location:', err)
        }
      }
      
      // Generate a unique notification ID
      const uniqueId = `crash-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      
      // Send notification to server
      const response = await sendCrashNotification({
        deviceId,
        crashType,
        severity,
        timestamp: Date.now(),
        location
      })
      
      console.log('Notification sent:', response)
      
      // Create local notification
      const newNotification: CrashNotification = {
        id: uniqueId,
        type: crashType,
        severity,
        message: getSeverityMessage(severity, crashType),
        timestamp: Date.now(),
        read: false
      }
      
      // Add to notifications
      setNotifications(prev => {
        const updated = [newNotification, ...prev]
        localStorage.setItem('crashNotifications', JSON.stringify(updated))
        return updated
      })
      
      // Show browser notification
      if (notificationStatus === 'granted') {
        const notification = new Notification('Crash Detected', {
          body: newNotification.message,
          icon: '/icons/icon-192x192.png'
        })
        
        notification.onclick = () => {
          window.focus()
        }
      }
    } catch (error) {
      console.error('Error simulating crash notification:', error)
    }
  }
  
  // Helper to get severity message
  const getSeverityMessage = (severity: CrashSeverity, crashType: string): string => {
    switch (severity) {
      case 'high':
        return `EMERGENCY: ${crashType}! Immediate assistance may be required.`
      case 'medium':
        return `Warning: ${crashType}. Please check on the person.`
      case 'low':
        return `Alert: Minor ${crashType}. Monitoring situation.`
      default:
        return `${crashType} detected.`
    }
  }

  return (
    <CrashNotificationContext.Provider
      value={{
        notificationStatus,
        notifications,
        unreadCount,
        requestPermission,
        markAsRead,
        markAllAsRead,
        simulateCrashNotification
      }}
    >
      {children}
    </CrashNotificationContext.Provider>
  )
}

// Hook for using the notification context
export const useCrashNotifications = () => {
  const context = useContext(CrashNotificationContext)
  if (!context) {
    throw new Error('useCrashNotifications must be used within a CrashNotificationProvider')
  }
  return context
}

// Notification Bell component
export const NotificationBell = () => {
  const { notificationStatus, unreadCount, notifications, markAllAsRead } = useCrashNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const toggleNotifications = () => {
    setIsOpen(!isOpen)
    if (!isOpen && unreadCount > 0) {
      markAllAsRead()
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggleNotifications}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        {notificationStatus === 'granted' ? (
          <Bell className="h-6 w-6 text-gray-700" />
        ) : (
          <BellOff className="h-6 w-6 text-gray-400" />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-medium">Notifications</h3>
            {notifications.length > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={`notification-${notification.id}`}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${notification.read ? '' : 'bg-blue-50'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                      notification.severity === 'high' ? 'bg-red-500' :
                      notification.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{notification.type}</p>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">No notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 