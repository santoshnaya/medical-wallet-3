'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Heart, FileText, Users, User, Stethoscope, MapPin, Activity, LayoutDashboard, FileSearch, ScanText, ShieldAlert } from 'lucide-react'
import Image from 'next/image'
import { 
  Brain,
  Trophy,
  Star,
  Calendar
} from 'lucide-react'
import PatientForm from '@/components/PatientForm'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-6 py-16 relative">
          <nav className="flex justify-between items-center mb-16">
          <motion.div 
           initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
>
  <Heart className="h-12 w-12 text-white" /> {/* Icon made larger */}
  <span className="text-3xl font-extrabold text-white">MedicalWallet</span> {/* Text made larger */}
</motion.div>
 
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              
              <div className="flex flex-col items-center">
              <Link href="/emergency" className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all">
                  <User className="h-5 w-5" />
                  Emergency
                </Link>
                <div className="text-xs text-white/80 mt-1">
                  Demo: user@demo.com / user123
                </div>
              </div>
              <div className="flex flex-col items-center">
                <Link href="/login?role=user" className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all">
                  <User className="h-5 w-5" />
                  Login as User
                </Link>
                <div className="text-xs text-white/80 mt-1">
                  Demo: user@demo.com / user123
                </div>
              </div>
              <div className="flex flex-col items-center">
                <Link href="/login?role=doctor" className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all">
                  <Stethoscope className="h-5 w-5" />
                  Login as Doctor
                </Link>
                <div className="text-xs text-white/80 mt-1">
                  Demo: doctor@demo.com / doctor123
                </div>
              </div>
            </motion.div>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Your Partner in Health and Wellness
              </h1>
              <p className="text-lg text-blue-100 mb-8">
                Experience seamless healthcare management with our comprehensive medical record system.
              </p>
              <div className="flex gap-4">
                <Link href="/register" className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-semibold">
                  Get Started
                </Link>
                <Link href="/about" className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all">
                  Learn More
                </Link>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative h-[400px]"
            >
              <Image
                src="/image/hero.avif"
                alt="Medical professionals"
                fill
                className="object-cover rounded-lg shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Our Products</h2>
            <p className="text-black max-w-2xl mx-auto">
              Discover our comprehensive suite of healthcare management tools designed to improve your medical experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: LayoutDashboard, 
                title: 'Medical Dashboard', 
                description: 'Centralized hub for all your medical information and health metrics.',
                href: '/dashboard'
              },
              { 
                icon: Users, 
                title: 'Patient Management', 
                description: 'Efficiently manage patient records and medical histories.',
                href: '/patients'
              },
              { 
                icon: Heart, 
                title: 'Heart Health Prediction', 
                description: 'AI-powered analysis to predict heart health conditions.',
                href: '/heart-prediction'
              },
              { 
                icon: Activity, 
                title: 'Lung Health Analysis', 
                description: 'Advanced diagnostics for respiratory health assessment.',
                href: '/lung-prediction'
              },
              { 
                icon: Activity, 
                title: 'Anemia Detection', 
                description: 'Early detection and monitoring of anemia symptoms.',
                href: '/anemia-prediction'
              },
              { 
                icon: MapPin, 
                title: 'Nearby Healthcare', 
                description: 'Find hospitals, clinics, and pharmacies in your vicinity.',
                href: '/nearby'
              },
              { 
                icon: FileText, 
                title: 'Skin Disease Detection', 
                description: 'AI-powered analysis for identifying skin conditions.',
                href: '/skin-disease'
              },
              { 
                icon: FileSearch, 
                title: 'PDF Medical Reader', 
                description: 'Extract and organize information from medical documents.',
                href: '/pdf-reader'
              },
              { 
                icon: ScanText, 
                title: 'OCR Medical Scanner', 
                description: 'Convert medical images and documents into searchable text.',
                href: '/ocr-reader'
              },
              { 
                icon: ShieldAlert, 
                title: 'Crash Detection', 
                description: 'Emergency alert system for accidents and medical emergencies.',
                href: '/crash-detection'
              },
              { 
                icon: Heart, 
                title: 'Blood Pressure Prediction', 
                description: 'Predict and monitor blood pressure trends over time.',
                href: '/blood-pressure-prediction'
              }
            ].map((product, index) => (
              <Link 
                href={product.href}
                key={product.title}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-50 rounded-lg shadow-sm p-6 hover:shadow-md transition-all cursor-pointer h-full"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <product.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{product.title}</h3>
                  </div>
                  <p className="text-gray-600">{product.description}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[400px]"
            >
              <Image
                src="/image/medical.webp"
                alt="Medical team"
                fill
                className="object-cover rounded-lg shadow-xl"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-black mb-6">About Us</h2>
              <p className="text-black mb-6">
                We are dedicated to providing the highest quality healthcare services while ensuring your medical information is secure and accessible when you need it.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: Heart, text: '24/7 Patient Support' },
                  { icon: Users, text: 'Expert Medical Team' },
                  { icon: Brain, text: 'Advanced Technology' }
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <item.icon className="h-6 w-6 text-blue-600" />
                    <span className="text-black">{item.text}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Patient Form Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Add Your Medical Information</h2>
            <p className="text-black max-w-2xl mx-auto">
              Fill in your medical details to get started with our comprehensive healthcare management system.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <PatientForm 
              redirectPath="/dashboard"
              showTitle={false}
              className="shadow-lg"
            />
          </div>
        </div>
      </section>

{/* Services Section */}
<section className="py-16 bg-white">
  <div className="container mx-auto px-6">
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-3xl font-bold text-center text-black mb-12"
    >
      Our Services
    </motion.h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[
        { icon: '🩺', title: 'Online Consultation', desc: 'Connect with doctors anytime, anywhere.' },
        { icon: '💊', title: 'Medicine Delivery', desc: 'Fast and reliable delivery at your doorstep.' },
        { icon: '📈', title: 'Health Analytics', desc: 'Track your health data & progress securely.' },
        { icon: '📝', title: 'Digital Records', desc: 'Store and access your reports seamlessly.' },
        { icon: '👩‍⚕️', title: 'Expert Panel', desc: 'Top certified specialists across domains.' },
        { icon: '📆', title: 'Appointment Booking', desc: 'Hassle-free slot booking and reminders.' }
      ].map((service, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1 }}
          className="bg-blue-50 p-6 rounded-xl shadow hover:shadow-lg transition"
        >
          <div className="text-4xl mb-4">{service.icon}</div>
          <h3 className="text-xl font-semibold mb-2 text-blue-700">{service.title}</h3>
          <p className="text-gray-600">{service.desc}</p>
        </motion.div>
      ))}
    </div>
  </div>
</section>

      {/* Departments Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center text-black mb-12"
          >
            Departments
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { icon: '🫀', name: 'Cardiology' },
              { icon: '🧠', name: 'Neurology' },
              { icon: '🦷', name: 'Dental' },
              { icon: '👶', name: 'Pediatrics' },
              { icon: '🦴', name: 'Orthopedics' },
              { icon: '👁️', name: 'Ophthalmology' }
            ].map((dept, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors hover:shadow-md"
              >
                <div className="text-4xl mb-3">{dept.icon}</div>
                <h3 className="font-medium text-black">{dept.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center text-black mb-12"
          >
            Awards
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { year: '2023', title: 'Best Hospital', desc: 'Healthcare Excellence' },
              { year: '2022', title: 'Innovation Award', desc: 'Digital Healthcare' },
              { year: '2021', title: 'Patient Care', desc: 'Service Excellence' },
              { year: '2020', title: 'Quality Award', desc: 'Medical Standards' }
            ].map((award, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <Trophy className="h-8 w-8 text-blue-600 mb-4" />
                <div className="text-sm text-blue-600 mb-2">{award.year}</div>
                <h3 className="font-semibold mb-2 text-black">{award.title}</h3>
                <p className="text-black text-sm">{award.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center text-black mb-12"
          >
            Some Reviews
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                name: 'Santosh', 
                role: 'Patient', 
                text: 'The medical team was incredibly professional and caring. They took the time to explain everything in detail and made me feel comfortable throughout my treatment. The follow-up care was exceptional!' 
              },
              { 
                name: 'Biswa', 
                role: 'Patient', 
                text: 'I was impressed by the state-of-the-art facilities and the efficiency of the staff. The doctors were knowledgeable and the nurses were very attentive. The digital health records system made everything so convenient.' 
              },
              { 
                name: 'Rinku', 
                role: 'Patient', 
                text: 'From the moment I walked in, I felt welcomed and cared for. The doctors were thorough in their diagnosis and the treatment plan was well-explained. The recovery process was smooth thanks to their excellent care.' 
              }
            ].map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-1 text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="text-black mb-4">{review.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="font-medium text-black">{review.name}</div>
                    <div className="text-sm text-gray-500">{review.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Appointment Section */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-white mb-6">Book an Appointment</h2>
              <p className="text-blue-100 mb-8">
                Schedule your visit with our expert medical team. We&apos;re here to help you stay healthy.
              </p>
              <Link href="/appointment" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all">
                <Calendar className="h-5 w-5" />
                Book Now
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[300px]"
            >
              <Image
                src="/image/appointment.png"
                alt="Book appointment"
                fill
                className="object-cover rounded-lg shadow-xl"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
