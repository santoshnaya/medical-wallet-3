# Medical Wallet Application

A comprehensive medical records management system built with modern web technologies.

## Tech Stack

### Frontend Framework
- [Next.js 14](https://nextjs.org/) - React framework with App Router
- [React 18](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Lucide Icons](https://lucide.dev/) - Icon library

### Backend & Database
- [Firebase](https://firebase.google.com/)
  - Authentication - User management
  - Firestore - NoSQL database
  - Cloud Storage - File storage
  - Cloud Messaging - Push notifications
  - Analytics - Usage tracking

### State Management & Data Fetching
- [React Query](https://tanstack.com/query/latest) - Server state management
- [Zustand](https://zustand-demo.pmnd.rs/) - Client state management

### UI Components
- [Radix UI](https://www.radix-ui.com/)
  - Dropdown Menu
  - Dialog
  - Popover
- [react-hot-toast](https://react-hot-toast.com/) - Toast notifications

### Third-Party Integrations
- [Twilio](https://www.twilio.com/) - SMS notifications
- [Google Gemini AI](https://ai.google.dev/) - AI chatbot
- [Uploadcare](https://uploadcare.com/) - File uploads
- [jsPDF](https://www.npmjs.com/package/jspdf) - PDF generation
- [QRCode.react](https://www.npmjs.com/package/qrcode.react) - QR code generation

## Features

### Authentication & Authorization
- Multi-role system (Admin, Doctor, User)
- Email/password authentication
- Role-based access control
- Session management
- Secure password handling

### Medical Records Management
- Digital health records storage
- Document upload and management
- Medical history tracking
- Secure data access
- PDF report generation

### Emergency Features
- Crash detection using device sensors
- Real-time location tracking
- Emergency contact notifications
- SMS alerts via Twilio
- Push notifications via Firebase

### AI Integration
- Medical chatbot using Gemini AI
- Symptom analysis
- Health recommendations
- Natural language processing
- Context-aware responses

### User Interface
- Responsive design
- Dark/light mode
- Accessibility features
- Loading states
- Error handling
- Toast notifications
- Animated transitions

### Data Management
- Real-time updates
- Offline support
- Data validation
- Error recovery
- Cache management

## Project Structure

```
medical-wallet/
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # Reusable React components
│   ├── lib/                 # Utility functions and configs
│   ├── types/              # TypeScript type definitions
│   └── styles/             # Global styles
├── public/                 # Static assets
└── config/                 # Configuration files
```

## Environment Variables

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=

# Twilio Configuration
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Gemini AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=

# Uploadcare Configuration
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Medical Records
- `GET /api/records` - Fetch medical records
- `POST /api/records` - Create new record
- `PUT /api/records/:id` - Update record
- `DELETE /api/records/:id` - Delete record

### Emergency
- `POST /api/send-sms` - Send emergency SMS
- `POST /api/crash-detection` - Process crash detection
- `GET /api/emergency-contacts` - Get emergency contacts

### AI Chat
- `POST /api/chat` - Process chat messages
- `GET /api/chat/history` - Get chat history

## Dependencies

```json
{
  "dependencies": {
    "@google/generative-ai": "^0.1.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-dropdown-menu": "^1.0.0",
    "@radix-ui/react-popover": "^1.0.0",
    "@uploadcare/react-widget": "^1.0.0",
    "firebase": "^10.0.0",
    "framer-motion": "^10.0.0",
    "jspdf": "^2.5.0",
    "lucide-react": "^0.300.0",
    "next": "14.0.0",
    "qrcode.react": "^3.1.0",
    "react": "18.0.0",
    "react-dom": "18.0.0",
    "react-hot-toast": "^2.4.0",
    "react-query": "^3.0.0",
    "twilio": "^4.0.0",
    "zustand": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0",
    "tailwindcss": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`
5. Build for production: `npm run build`
6. Start production server: `npm start`

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License - See LICENSE file for details

## Datasets & Data Sources

### Medical Records Dataset
- **Location**: `public/data/medical-records.json`
- **Purpose**: Sample medical records for testing and development
- **Features**:
  - Patient demographics
  - Medical history
  - Allergies
  - Medications
  - Lab results
  - Vital signs

### Anemia Prediction Dataset
- **Location**: `public/predictions/anemia.csv`
- **Purpose**: Machine learning model for anemia prediction
- **Features**:
  - Gender
  - Hemoglobin levels
  - MCH (Mean Corpuscular Hemoglobin)
  - MCHC (Mean Corpuscular Hemoglobin Concentration)
  - MCV (Mean Corpuscular Volume)
  - Diagnosis results

### Emergency Contacts Dataset
- **Location**: Firestore Collection `emergency-contacts`
- **Purpose**: Store emergency contact information
- **Features**:
  - Contact name
  - Phone number
  - Relationship
  - Priority level
  - Notification preferences

### Crash Detection Dataset
- **Location**: Firestore Collection `crashes`
- **Purpose**: Store crash detection events
- **Features**:
  - Timestamp
  - Location coordinates
  - Severity level
  - Device information
  - Response status

### User Analytics Dataset
- **Location**: Firebase Analytics
- **Purpose**: Track user behavior and app usage
- **Features**:
  - User sessions
  - Feature usage
  - Error tracking
  - Performance metrics
  - User engagement

### Medical Facilities Dataset
- **Location**: `public/data/medical-facilities.json`
- **Purpose**: List of nearby medical facilities
- **Features**:
  - Facility name
  - Address
  - Contact information
  - Services offered
  - Operating hours
  - Distance from user

### Chat History Dataset
- **Location**: Firestore Collection `chat-history`
- **Purpose**: Store AI chat interactions
- **Features**:
  - User messages
  - AI responses
  - Timestamps
  - Context information
  - Feedback ratings

### Document Templates Dataset
- **Location**: `public/templates/`
- **Purpose**: PDF report templates
- **Features**:
  - Medical report templates
  - Prescription templates
  - Lab result templates
  - Emergency contact cards
  - Medical history summaries

