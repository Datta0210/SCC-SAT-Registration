import React, { useState, useEffect, Suspense } from 'react';
import Header from './components/Header';
import RegistrationForm from './components/RegistrationForm';
import InfoSection from './components/InfoSection';
import { EXAM_DATE } from './constants';
import { Lock, Crown, Zap, Clock, Loader2 } from 'lucide-react';

// Lazy load heavy components to improve startup performance
const AdminPanel = React.lazy(() => import('./components/AdminPanel'));
const AIChat = React.lazy(() => import('./components/AIChat'));

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculate = () => {
      const difference = +new Date(EXAM_DATE) - +new Date();
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculate());
    const timer = setInterval(() => {
      setTimeLeft(calculate());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center mb-10 animate-fade-in-up delay-300 opacity-0 [animation-fill-mode:forwards]">
      <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-widest mb-3 opacity-80">
        <Clock className="w-3 h-3" /> Time Remaining
      </div>
      <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Minutes', value: timeLeft.minutes },
          { label: 'Seconds', value: timeLeft.seconds }
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center group">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] group-hover:bg-white/20 transition-all duration-300 group-hover:-translate-y-1">
              <span className="text-xl sm:text-2xl font-black text-white font-mono drop-shadow-md">
                {String(item.value).padStart(2, '0')}
              </span>
            </div>
            <span className="text-[10px] sm:text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-2 group-hover:text-white transition-colors">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  const [isAdminView, setIsAdminView] = useState(false);
  const [studentCount, setStudentCount] = useState(43);

  // Live counter for hero section
  useEffect(() => {
     // Initialize from local storage + base
     const updateCount = () => {
         const storedRegs = localStorage.getItem('scc_all_registrations');
         let base = 43; // Base count
         if (storedRegs) {
           try {
             const parsed = JSON.parse(storedRegs);
             if (Array.isArray(parsed)) {
                 base += parsed.length;
             }
           } catch(e) {
               console.error("Error parsing registrations", e);
           }
         }
         setStudentCount(base);
     };

     updateCount();

     // Randomly increment to simulate live activity
     const interval = setInterval(() => {
        if (Math.random() > 0.6) {
            setStudentCount(prev => prev + 1);
        }
     }, 5000);
     
     return () => clearInterval(interval);
  }, []);

  const scrollToForm = () => {
    const element = document.getElementById('registration-form');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isAdminView) {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      }>
        <AdminPanel onBack={() => setIsAdminView(false)} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-[#1a3689] text-white pt-8 pb-16 px-4 text-center relative overflow-hidden">
        {/* Background Gradients & Effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-700 via-[#1a3689] to-[#111827]"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-[100px] opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500 rounded-full blur-[100px] opacity-20 animate-pulse-slow"></div>

        <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto">
          
          {/* Live Counter Pill */}
          <div className="animate-fade-in-down mb-6">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-blue-400/30 bg-blue-900/40 backdrop-blur-md shadow-lg transform transition-transform hover:scale-105">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium tracking-wide text-blue-100">
                    <span className="font-bold text-white text-lg mr-1.5 tabular-nums">{studentCount.toLocaleString()}</span>
                    Students Registered
                </span>
            </div>
          </div>

          {/* Yellow Badge */}
          <div className="animate-fade-in-up delay-100 mb-5 opacity-0 [animation-fill-mode:forwards]">
              <div className="bg-[#FFD700] text-black text-[10px] md:text-xs font-black uppercase px-4 py-1.5 rounded-md flex items-center shadow-[0_0_15px_rgba(255,215,0,0.4)] transform hover:scale-105 transition-transform duration-300">
                 <Crown className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
                 Nashik's Top Talent Search
              </div>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl md:text-4xl font-bold font-serif mb-8 tracking-tight leading-tight drop-shadow-xl animate-fade-in-up delay-200 opacity-0 [animation-fill-mode:forwards]">
            SCC SAT <span className="text-[#FFD700]">Scholarship</span> 2025
          </h1>
          
          {/* Countdown Timer */}
          <CountdownTimer />
          
          {/* FOMO Card */}
          <div className="w-full relative group perspective-1000 animate-fade-in-up delay-500 opacity-0 [animation-fill-mode:forwards]">
             {/* Glow effect behind card */}
             <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-pink-600 rounded-[2rem] blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
             
             <div className="relative bg-[#1e3a8a]/40 backdrop-blur-xl border-2 border-orange-400/50 rounded-[1.8rem] p-6 md:p-8 shadow-[0_0_40px_rgba(234,88,12,0.15)] overflow-hidden">
                {/* Inner Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-orange-400/50 blur-[20px]"></div>

                {/* Limited Time Badge */}
                <div className="inline-block bg-[#be123c] text-white text-[10px] font-bold px-3 py-1 rounded-full mb-5 shadow-lg animate-pulse tracking-widest uppercase border border-white/10">
                    Limited Time Offer
                </div>

                <div className="flex flex-col items-center justify-center space-y-1 mb-6">
                    <p className="text-lg text-gray-200 font-medium tracking-widest uppercase">
                        PAY FOR 11<sup className="text-xs">th</sup>
                    </p>
                    <p className="text-2xl md:text-3xl font-black text-[#FFD700] drop-shadow-sm uppercase">
                        & GET 12<sup className="text-base">th</sup> FREE
                    </p>
                </div>

                {/* Scholarship Pill */}
                <div className="inline-flex items-center gap-1.5 bg-[#065f46]/40 border border-[#10b981]/50 text-[#34d399] px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold shadow-inner uppercase tracking-wide">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    100% Scholarship for Top 30
                </div>
             </div>
          </div>

          {/* Register Button */}
          <button 
             onClick={scrollToForm}
             className="mt-8 bg-white text-[#1a3689] font-black text-base md:text-lg px-10 py-3.5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_10px_40px_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center group relative overflow-hidden animate-fade-in-up delay-700 opacity-0 [animation-fill-mode:forwards]"
          >
             <span className="relative z-10">REGISTER NOW</span>
             {/* Button shine effect */}
             <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 group-hover:animate-shine"></div>
          </button>

        </div>
      </div>

      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-8 -mt-6 relative z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Form Section */}
            <div id="registration-form" className="md:col-span-7">
              <RegistrationForm />
            </div>

            {/* Info Section */}
            <div className="md:col-span-5">
              <InfoSection />
            </div>
          </div>

        </div>
      </main>

      {/* AI Chat Widget - Lazy Loaded with Supense to prevent blocking main thread */}
      <Suspense fallback={null}>
        <AIChat />
      </Suspense>

      <footer className="bg-white border-t py-8 text-center text-gray-500 text-sm">
        <p>&copy; 2025 Shiv Chhatrapati Classes (SCC). All rights reserved.</p>
        <p className="mt-2 text-xs">Designed for Excellence.</p>
        
        <button 
          onClick={() => setIsAdminView(true)} 
          className="mt-6 inline-flex items-center text-xs text-gray-300 hover:text-gray-600 transition-colors"
          title="Admin Login"
        >
          <Lock className="w-3 h-3 mr-1" /> Admin Login
        </button>
      </footer>
    </div>
  );
}

export default App;