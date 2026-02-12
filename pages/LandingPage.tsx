import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { BookOpen, Award, Users, ArrowRight, Monitor, Phone, Info, Mail, MapPin, Facebook, Instagram, Quote } from 'lucide-react';

// Animation Helper Component
const ScrollReveal: React.FC<{ children: React.ReactNode; direction: 'left' | 'right'; className?: string }> = ({ children, direction, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); 
        }
      },
      { threshold: 0.15 } 
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const translateClass = direction === 'left' ? '-translate-x-20' : 'translate-x-20';

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-x-0' : `opacity-0 ${translateClass}`
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      {/* Navbar - Full Width */}
      <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center gap-4">
            <img src="https://i.ibb.co/LzYXwYfX/logo.png" alt="COHA Logo" className="h-12 w-auto" />
            <div className="flex flex-col justify-center">
              <h1 className="text-xl font-bold text-coha-900 leading-tight uppercase tracking-tight hidden sm:block">Circle of Hope Academy</h1>
              <h1 className="text-lg font-bold text-coha-900 leading-tight uppercase tracking-tight sm:hidden">COHA</h1>
              <p className="text-xs text-coha-500 font-bold uppercase tracking-widest">Accessible Education for All</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-600 hover:text-coha-900 transition-colors">
              Home
            </button>
             <button onClick={() => navigate('/apply')} className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-600 hover:text-coha-900 transition-colors">
              Apply
            </button>
            <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-600 hover:text-coha-900 transition-colors">
              About Us
            </button>
            <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-600 hover:text-coha-900 transition-colors">
              Contact Us
            </button>
            <Button variant="primary" onClick={() => navigate('/login')} className="ml-4">
              Portal Login
            </Button>
          </div>
          
          {/* Mobile Menu Button Placeholder */}
          <div className="md:hidden">
             <Button variant="primary" onClick={() => navigate('/login')} className="text-xs px-4 py-2">
              Login
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full h-[80vh] sm:h-screen flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://i.ibb.co/zWNcsGPP/login-wallpaper.jpg" 
            alt="School Campus" 
            className="w-full h-full object-cover"
          />
          {/* Black Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="max-w-2xl">
            {/* Adjusted typography size: text-3xl on mobile, text-7xl on lg screens */}
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-4 sm:mb-6">
              Building Future <span className="text-coha-400">Leaders</span>
            </h1>
            <p className="text-base sm:text-xl text-gray-200 leading-relaxed mb-8 sm:mb-10 max-w-lg">
              Welcome to Circle of Hope Academy. We provide world-class education with a focus on character, innovation, and academic excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => navigate('/login')} 
                className="bg-coha-400 hover:bg-coha-500 text-white border-none text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
              >
                View Portal <ArrowRight size={20} />
              </Button>
              <button 
                onClick={() => navigate('/apply')}
                className="px-6 sm:px-8 py-3 sm:py-4 font-medium transition-colors duration-200 flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white hover:text-coha-900 text-base sm:text-lg"
              >
                Apply Online
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1 (Odd): Disability Inclusive Intro -> Slide Left */}
      <ScrollReveal direction="left" className="bg-white py-20 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-block p-3 bg-coha-50 rounded-full mb-6">
            <Award className="text-coha-900 w-8 h-8" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-coha-900 mb-6 leading-tight">
            Best Disability Inclusive Basic Education Institution
          </h2>
          <p className="text-sm font-bold text-coha-500 uppercase tracking-widest mb-8">
            by National Disability Council of Namibia
          </p>
          <div className="w-24 h-1 bg-coha-900 mx-auto mb-8"></div>
          <p className="text-lg text-gray-600 leading-relaxed">
            Circle Of Hope Private Academy – COHA is an inclusive school registered with the Ministry of Education, Arts and Culture (Registration No. 7826) situated at Elcin Centre Old Ongwediva, Oshana region, Namibia. 
            Our school uses English as a medium of instruction with Ministry of Education NiED, Junior Primary and Intellectual Impaired Curriculum. Currently, our enrolment is Kindergarten, Pre-Primary, Grade 1-3, Special Needs Classes (Autism spectrum disorder, Down Syndrome, and other intellectual disorders).
          </p>
        </div>
      </ScrollReveal>

      {/* SECTION 2 (Even): Founder Profile -> Slide Right */}
      <ScrollReveal direction="right" className="bg-gray-50 py-20 border-b border-gray-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
           <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              {/* Image Left */}
              <div className="w-full lg:w-1/2 relative">
                  <div className="absolute inset-0 bg-coha-900 transform translate-x-4 translate-y-4 hidden lg:block"></div>
                  <img 
                    src="https://i.ibb.co/My2rxxYJ/founder.png" 
                    alt="Victoria Joel - Founder" 
                    className="relative z-10 w-full h-auto object-cover shadow-xl border-4 border-white"
                  />
              </div>
              
              {/* Text Right */}
              <div className="w-full lg:w-1/2">
                 <h4 className="text-coha-500 font-bold uppercase tracking-widest mb-2">Meet Our Founder</h4>
                 <h2 className="text-3xl sm:text-4xl font-bold text-coha-900 mb-6">Victoria Joel</h2>
                 <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                    Victoria Joel is a 31-year-old social entrepreneur and an Olafika SMEs and Mentorship graduate, awarded the 2020 Most Diligent Entrepreneur of the Year. 
                 </p>
                 <p className="text-gray-600 leading-relaxed mb-6">
                    She is a devoted, trained special needs teacher with seven years of teaching experience in four different schools. Trained by SES Experts from Germany, she has passionately advocated for children with Autism Spectrum Disorder and other intellectual disabilities for the past ten years, serving as an expert and mentor.
                 </p>
                 <div className="flex items-center gap-4 mt-8">
                    <Quote className="text-coha-300 w-10 h-10" />
                    <p className="text-sm text-gray-500 italic font-medium">"Every child deserves a champion – an adult who will never give up on them."</p>
                 </div>
              </div>
           </div>
        </div>
      </ScrollReveal>

      {/* SECTION 3 (Odd): Mission & Vision -> Slide Left */}
      <ScrollReveal direction="left" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
           <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
              {/* Text Left */}
              <div className="w-full lg:w-1/2 space-y-10">
                 <div>
                    <h3 className="text-2xl font-bold text-coha-900 mb-3 flex items-center gap-3">
                        <div className="w-2 h-8 bg-coha-500"></div> Our Mission
                    </h3>
                    <p className="text-gray-600 leading-relaxed pl-5">
                       To educate and empower all children, including those with special needs, with skills in their different ways of abilities and to polish their skills to contribute to the development of society.
                    </p>
                 </div>

                 <div>
                    <h3 className="text-2xl font-bold text-coha-900 mb-3 flex items-center gap-3">
                        <div className="w-2 h-8 bg-coha-900"></div> Our Vision
                    </h3>
                    <p className="text-gray-600 leading-relaxed pl-5">
                       To provide inclusive quality education as per each child's different learning style, preparing them for future employment throughout Namibia.
                    </p>
                 </div>

                 <div>
                    <h3 className="text-2xl font-bold text-coha-900 mb-3 flex items-center gap-3">
                        <div className="w-2 h-8 bg-coha-400"></div> Core Values
                    </h3>
                    <p className="text-gray-600 leading-relaxed pl-5">
                       COHA's core value is to educate learners based on their interests and abilities, as we believe they are all differently able. We also create a school environment that allows our learners to express themselves freely.
                    </p>
                 </div>
              </div>

              {/* Image Right */}
              <div className="w-full lg:w-1/2 relative">
                  <div className="absolute inset-0 bg-gray-100 transform -translate-x-4 -translate-y-4 hidden lg:block"></div>
                  <img 
                    src="https://i.ibb.co/VpCGrnbz/the-boys.jpg" 
                    alt="Students at COHA" 
                    className="relative z-10 w-full h-auto object-cover shadow-xl grayscale hover:grayscale-0 transition-all duration-500"
                  />
              </div>
           </div>
        </div>
      </ScrollReveal>

      {/* Features */}
      <section className="bg-gray-50 py-16 sm:py-24 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-coha-900 uppercase tracking-wide">Why Choose COHA?</h2>
            <div className="w-24 h-1 bg-coha-500 mx-auto mt-4"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 sm:p-10 border-b-4 border-coha-900 hover:-translate-y-2 transition-transform duration-300 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 flex items-center justify-center shadow-sm mb-6">
                 <BookOpen className="text-coha-500" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-coha-900">Modern Curriculum</h3>
              <p className="text-gray-600 leading-relaxed">Standardized yet innovative learning paths designed to challenge and inspire every student.</p>
            </div>
            <div className="bg-white p-8 sm:p-10 border-b-4 border-coha-900 hover:-translate-y-2 transition-transform duration-300 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 flex items-center justify-center shadow-sm mb-6">
                <Users className="text-coha-500" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-coha-900">Expert Teachers</h3>
              <p className="text-gray-600 leading-relaxed">Dedicated professionals committed to student success, mentoring, and personal growth.</p>
            </div>
            <div className="bg-white p-8 sm:p-10 border-b-4 border-coha-900 hover:-translate-y-2 transition-transform duration-300 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 flex items-center justify-center shadow-sm mb-6">
                <Award className="text-coha-500" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-coha-900">Academic Excellence</h3>
              <p className="text-gray-600 leading-relaxed">A proven track record of high academic achievement and preparation for higher education.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info Strip */}
      <section className="bg-coha-900 text-white py-12 border-b border-coha-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start group">
               <div className="p-3 bg-coha-800 rounded-full mb-4 group-hover:bg-coha-500 transition-colors">
                 <Phone className="text-white" size={24} />
               </div>
               <h4 className="text-lg font-bold mb-1">Talk to Us</h4>
               <p className="text-coha-200 text-sm font-medium">+264 81 666 4074</p>
               <p className="text-coha-200 text-sm font-medium">circleofhopeacademy@yahoo.com</p>
            </div>
            <div className="flex flex-col items-center md:items-start group">
               <div className="p-3 bg-coha-800 rounded-full mb-4 group-hover:bg-coha-500 transition-colors">
                 <Monitor className="text-white" size={24} />
               </div>
               <h4 className="text-lg font-bold mb-1">Admissions</h4>
               <p className="text-coha-200 text-sm">Open for 2026 Academic Year</p>
               <p className="text-coha-200 text-sm">Apply online or visit campus</p>
            </div>
             <div className="flex flex-col items-center md:items-start group">
               <div className="p-3 bg-coha-800 rounded-full mb-4 group-hover:bg-coha-500 transition-colors">
                 <MapPin className="text-white" size={24} />
               </div>
               <h4 className="text-lg font-bold mb-1">Visit Campus</h4>
               <p className="text-coha-200 text-sm">P.O. Box 3675</p>
               <p className="text-coha-200 text-sm">Ondangwa, Namibia</p>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#00154a] text-gray-300 py-12 border-t border-coha-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                 <img src="https://i.ibb.co/LzYXwYfX/logo.png" alt="COHA Logo" className="h-12 w-auto" />
                 <div>
                    <span className="text-lg font-bold text-white uppercase tracking-wider block leading-none">Circle of Hope Academy</span>
                    <span className="text-[10px] text-coha-400 uppercase tracking-[0.2em] font-bold">Accessible Education for All</span>
                 </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-sm mb-6">
                Circle of Hope Academy provides accessible, high-quality education fostering character, innovation, and academic excellence for the future leaders of Namibia.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-8 h-8 rounded-full bg-coha-800 flex items-center justify-center hover:bg-coha-500 transition-colors text-white">
                  <Facebook size={16} />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-coha-800 flex items-center justify-center hover:bg-coha-500 transition-colors text-white">
                  <Instagram size={16} />
                </a>
                 <a href="mailto:circleofhopeacademy@yahoo.com" className="w-8 h-8 rounded-full bg-coha-800 flex items-center justify-center hover:bg-coha-500 transition-colors text-white">
                  <Mail size={16} />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-bold uppercase tracking-wider mb-6 text-xs">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-coha-400 transition-colors flex items-center gap-2"><div className="w-1 h-1 bg-coha-500 rounded-full"></div> About Us</a></li>
                <li><a href="#" className="hover:text-coha-400 transition-colors flex items-center gap-2"><div className="w-1 h-1 bg-coha-500 rounded-full"></div> Admissions</a></li>
                <li><a href="#" className="hover:text-coha-400 transition-colors flex items-center gap-2"><div className="w-1 h-1 bg-coha-500 rounded-full"></div> Academic Calendar</a></li>
                <li><a href="#" className="hover:text-coha-400 transition-colors flex items-center gap-2"><div className="w-1 h-1 bg-coha-500 rounded-full"></div> Student Portal</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold uppercase tracking-wider mb-6 text-xs">Get In Touch</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-coha-400 shrink-0 mt-0.5" />
                  <span className="text-gray-400">P.O. Box 3675<br/>Ondangwa, Namibia</span>
                </li>
                 <li className="flex items-center gap-3">
                  <Phone size={18} className="text-coha-400 shrink-0" />
                  <span className="text-gray-400">+264 81 666 4074</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-coha-400 shrink-0" />
                  <span className="text-gray-400">circleofhopeacademy@yahoo.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} Circle of Hope Academy. All rights reserved.</p>
            <div className="flex gap-6">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};