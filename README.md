# Medical Wallet Application

A comprehensive medical records management system built with modern web technologies.

![Logo](public/images/logo.png)  <!-- Insert your logo here -->

## Demo Video

[![Medical Wallet Application Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

Click the image above to watch the demo video.

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

medical-wallet/
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # Reusable React components
│   ├── lib/                 # Utility functions and configs
│   ├── types/              # TypeScript type definitions
│   └── styles/             # Global styles
├── public/                 # Static assets
└── config/                 # Configuration files


