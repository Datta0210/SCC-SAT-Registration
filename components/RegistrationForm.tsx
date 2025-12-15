import React, { useState, useEffect, useRef } from 'react';
import { LocationEnum, RegistrationFormData, GoogleSheetResponse, RegisteredStudent } from '../types';
import { GOOGLE_SCRIPT_URL, EXAM_DATE, BRANCHES } from '../constants';
import { Loader2, CheckCircle, AlertCircle, Share2, PartyPopper, Save, Mail, Printer, MessageCircle, AlertTriangle, Copy, Check, MapPin, Clock, X, User, Gift, Download, Users, XCircle } from 'lucide-react';

export default function RegistrationForm() {
  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: '',
    classStd: '10th',
    parentName: '',
    mobile: '',
    email: '',
    schoolName: '',
    location: '',
    fieldOfInterest: '',
    whatsapp: '',
    notes: '',
    referralCode: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [response, setResponse] = useState<GoogleSheetResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [draftMessage, setDraftMessage] = useState<string | null>(null);
  const [wasValidated, setWasValidated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refCopied, setRefCopied] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Referral Validation State
  const [referralStatus, setReferralStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [validCodes, setValidCodes] = useState<Set<string>>(new Set());

  // Refs for Auto-save logic
  const formDataRef = useRef(formData);

  // Keep ref in sync with state for the interval closure
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Auto-save interval (every 30 seconds)
  useEffect(() => {
    if (submitted) return; // Stop auto-save if submitted

    const autoSaveInterval = setInterval(() => {
      // Don't auto-save if form is essentially empty (check a required field like fullName)
      if (formDataRef.current.fullName.trim() === '') return;

      try {
        localStorage.setItem('scc_registration_draft', JSON.stringify(formDataRef.current));
        setDraftMessage('Auto-saved');
        setTimeout(() => setDraftMessage(null), 2000);
      } catch (e) {
        console.warn('Auto-save failed', e);
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [submitted]);

  // Load draft and valid codes
  useEffect(() => {
    try {
      // Load Draft
      const savedDraft = localStorage.getItem('scc_registration_draft');
      if (savedDraft) {
        const parsedData = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...parsedData, classStd: '10th' }));
        setDraftMessage('Draft found & loaded.');
        setTimeout(() => setDraftMessage(null), 3000);
      }

      // Load Valid Codes (Predefined + Existing)
      const codes = new Set(['SCC2025', 'TEACHER1', 'EARLYBIRD', 'TOPPER']);
      const storedRegs = localStorage.getItem('scc_all_registrations');
      if (storedRegs) {
          const students: RegisteredStudent[] = JSON.parse(storedRegs);
          students.forEach(s => {
              if (s.ownReferralCode) codes.add(s.ownReferralCode);
          });
      }
      setValidCodes(codes);
    } catch (err) {
      console.warn('LocalStorage access warning:', err);
    }
  }, []);

  const formatPhoneNumber = (value: string) => {
    // Remove all characters except digits and plus
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // Ensure plus is only at the beginning
    const hasPlus = cleaned.startsWith('+');
    cleaned = cleaned.replace(/\+/g, '');
    if (hasPlus) {
      cleaned = '+' + cleaned;
    }

    // Limit length (max 15 digits according to E.164 + 1 for plus)
    if (cleaned.length > 16) {
      cleaned = cleaned.slice(0, 16);
    }

    // Apply formatting only for local 10-digit numbers (no plus)
    if (!hasPlus && cleaned.length <= 10) {
         if (cleaned.length > 5) {
           return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
         }
    }
    
    return cleaned;
  };

  const validateReferralCode = (code: string) => {
    if (!code) {
        setReferralStatus('idle');
        return;
    }
    
    // 1. Check if it's in our known valid list
    if (validCodes.has(code)) {
        setReferralStatus('valid');
        return;
    }

    // 2. Check if it matches the generated pattern (REF + 3 letters + 4 digits)
    const pattern = /^REF-[A-Z]{3}\d{4}$/;
    if (pattern.test(code)) {
        setReferralStatus('valid');
    } else {
        setReferralStatus('invalid');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (generalError) setGeneralError(null);

    if (name === 'mobile' || name === 'whatsapp') {
      setFormData(prev => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else if (name === 'referralCode') {
      // Force uppercase for referral codes
      const code = value.toUpperCase();
      setFormData(prev => ({ ...prev, [name]: code }));
      validateReferralCode(code);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem('scc_registration_draft', JSON.stringify(formData));
      setDraftMessage('Progress Saved!');
      setTimeout(() => setDraftMessage(null), 2000);
    } catch (e) {
      setDraftMessage('Unable to save.');
    }
  };

  const generateSeatNumber = () => {
    const year = EXAM_DATE.split(' ').pop() || new Date().getFullYear().toString();
    try {
        let count = parseInt(localStorage.getItem('scc_demo_seq_count') || '1284');
        count++;
        localStorage.setItem('scc_demo_seq_count', count.toString());
        return `SCC-${year}-${count}`;
    } catch {
        return `SCC-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
  };

  const generateReferralCode = (name: string) => {
     // Format: REF + First 3 chars of name + Random 4 digits
     const prefix = name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'SCC';
     const suffix = Math.floor(1000 + Math.random() * 9000);
     return `REF-${prefix}${suffix}`;
  };

  const saveToAdminStore = (data: RegistrationFormData, seatNumber: string, ownReferralCode: string) => {
    try {
      const newStudent: RegisteredStudent = {
        ...data,
        seatNumber,
        ownReferralCode,
        timestamp: new Date().toISOString()
      };
      const existing = localStorage.getItem('scc_all_registrations');
      const allStudents = existing ? JSON.parse(existing) : [];
      allStudents.push(newStudent);
      localStorage.setItem('scc_all_registrations', JSON.stringify(allStudents));
    } catch (e) {
      console.error("Failed to save to admin store", e);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Check referral code validity specifically
    if (formData.referralCode && referralStatus === 'invalid') {
        setGeneralError("Please enter a valid Referral Code or leave it blank.");
        const refInput = form.querySelector('[name="referralCode"]') as HTMLElement;
        refInput?.focus();
        return;
    }

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setWasValidated(true);
      setGeneralError("Please complete all required fields.");
      
      const firstInvalid = form.querySelector(':invalid') as HTMLElement;
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setGeneralError(null);
    setShowConfirmModal(true);
  };

  const finalizeRegistration = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    setError(null);

    const newSeatNumber = generateSeatNumber();
    const newReferralCode = generateReferralCode(formData.fullName);
    
    const submissionPayload = {
      ...formData,
      seatNumber: newSeatNumber,
      ownReferralCode: newReferralCode,
      timestamp: new Date().toISOString()
    };

    saveToAdminStore(formData, newSeatNumber, newReferralCode);

    // DEMO MODE HANDLER
    if (GOOGLE_SCRIPT_URL.includes('PLACEHOLDER')) {
      setTimeout(() => {
        setSubmitted(true);
        setResponse({
          result: 'success',
          seatNumber: newSeatNumber,
          ownReferralCode: newReferralCode,
          message: 'Registration successful (Demo Mode)'
        });
        try { localStorage.removeItem('scc_registration_draft'); } catch (e) {}
        setLoading(false);
      }, 1500);
      return;
    }

    // REAL BACKEND HANDLER
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(submissionPayload),
      });

      const data: GoogleSheetResponse = await res.json();

      if (data.result === 'success') {
        try { localStorage.removeItem('scc_registration_draft'); } catch (e) {}
        setSubmitted(true);
        setResponse({
          ...data,
          seatNumber: data.seatNumber || newSeatNumber,
          ownReferralCode: data.ownReferralCode || newReferralCode
        });
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please check internet.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    setShareLoading(true);
    const shareText = submitted && response?.ownReferralCode
      ? `Register for SCC SAT 2025 using my code ${response.ownReferralCode} and get a Free Study Guide! Free for 10th Std.`
      : "Don't miss the SCC SAT Scholarship Exam 2025! Top 30 students get 12th Standard FREE.";
      
    const url = window.location.href;
    
    try {
      if (navigator.share) {
        await navigator.share({ title: 'SCC SAT 2025', text: shareText, url });
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + url)}`, '_blank');
      }
    } catch (err) {
      console.log('Error sharing:', err);
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopySeatNumber = async () => {
    if (response?.seatNumber) {
      try {
        await navigator.clipboard.writeText(response.seatNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };
  
  const handleCopyReferralCode = async () => {
    if (response?.ownReferralCode) {
      try {
        await navigator.clipboard.writeText(response.ownReferralCode);
        setRefCopied(true);
        setTimeout(() => setRefCopied(false), 3000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  const handleDownloadStudyGuide = () => {
     alert("Downloading SCC 10th Standard Study Guide...");
     // In a real app, this would trigger a file download
  };

  const handleWhatsAppReceipt = () => {
    if (!response) return;
    const msg = `*My SCC SAT Registration Details* 🎓
    
Seat No: ${response.seatNumber}
Name: ${formData.fullName}
Exam Date: ${EXAM_DATE}
Location: ${formData.location}

Saved for my reference.`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleEmailReceipt = () => {
    if (!response) return;
    const subject = "SCC SAT Registration Confirmation";
    const body = `Hello ${formData.fullName},\n\nSeat Number: ${response.seatNumber}\nExam Date: ${EXAM_DATE}\nLocation: ${formData.location}\n\nBest regards,\nSCC`;
    window.open(`mailto:${formData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const inputClasses = "w-full px-4 py-3 text-base rounded-lg border border-gray-300 bg-gray-50/50 shadow-sm focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 placeholder-gray-400";
  const validationClasses = wasValidated 
    ? "invalid:border-red-500 invalid:bg-red-50 invalid:text-red-900 focus:invalid:border-red-500 focus:invalid:ring-red-100" 
    : "";

  const finalInputClasses = `${inputClasses} ${validationClasses}`;

  if (submitted && response) {
    return (
      <div className="relative">
        {/* Confetti Animation Layer */}
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 rounded-sm ${
                ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-400', 'bg-purple-500'][i % 5]
              }`}
              style={{
                top: '-20px',
                left: `${Math.random() * 100}vw`,
                animation: `confetti ${Math.random() * 2 + 3}s linear forwards`,
                animationDelay: `${Math.random() * 1.5}s`
              }}
            />
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 text-center max-w-2xl mx-auto mt-8 border-t-4 border-green-500 animate-in fade-in zoom-in duration-500 relative z-10 transform hover:scale-[1.01] transition-transform">
          <div className="flex justify-center mb-4 relative">
            <div className="absolute animate-ping opacity-75">
               <PartyPopper className="w-16 h-16 text-yellow-500" />
            </div>
            <CheckCircle className="w-16 h-16 text-green-500 relative z-10" />
          </div>
          <h2 className="text-3xl font-bold font-serif mb-2 text-black animate-in slide-in-from-bottom-2 fade-in duration-700">Congratulations! 🎉</h2>
          <p className="text-lg font-medium text-green-600 mb-6">Registration Successful</p>
          
          <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl border border-blue-100 mb-6 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-bold">Your Seat Number</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2">
              <p className="text-4xl sm:text-5xl font-mono font-bold text-blue-700 tracking-wider select-all drop-shadow-sm">{response.seatNumber}</p>
            </div>
            <div className="mt-4 flex justify-center">
              <button 
                onClick={handleCopySeatNumber}
                className={`flex items-center px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 shadow-sm transform active:scale-95 ${
                  copied 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:shadow-md'
                }`}
              >
                {copied ? <><Check className="w-4 h-4 mr-2" /> Copied!</> : <><Copy className="w-4 h-4 mr-2" /> Copy Seat No</>}
              </button>
            </div>
          </div>

          {/* Referral Section */}
          <div className="mb-6 p-5 rounded-xl border-2 border-dashed border-purple-200 bg-purple-50">
             <div className="flex items-center justify-center mb-3">
                 <Users className="w-5 h-5 text-purple-600 mr-2" />
                 <h3 className="font-bold text-purple-800 uppercase tracking-wide text-sm">Refer & Earn</h3>
             </div>
             
             {formData.referralCode && (
                 <div className="mb-4 bg-white p-3 rounded-lg shadow-sm border border-green-100 flex items-center justify-between">
                     <div className="flex items-center text-left">
                        <Gift className="w-8 h-8 text-pink-500 mr-3" />
                        <div>
                            <p className="text-xs font-bold text-green-600 uppercase">Referral Applied!</p>
                            <p className="text-sm font-medium text-gray-800">You unlocked the Study Guide.</p>
                        </div>
                     </div>
                     <button onClick={handleDownloadStudyGuide} className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-800 transition flex items-center">
                         <Download className="w-3 h-3 mr-1" /> PDF
                     </button>
                 </div>
             )}

             <p className="text-sm text-purple-700 mb-3">Share your unique code with friends. Both of you will get a <strong>FREE Study Guide</strong> when they register!</p>
             
             <div className="flex items-center justify-center gap-2 mb-3">
                 <code className="bg-white px-4 py-2 rounded-lg border border-purple-200 font-mono font-bold text-lg text-purple-900 select-all">
                     {response.ownReferralCode}
                 </code>
                 <button 
                    onClick={handleCopyReferralCode}
                    className="p-2.5 bg-white border border-purple-200 rounded-lg text-purple-600 hover:bg-purple-100 transition"
                    title="Copy Code"
                 >
                    {refCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                 </button>
             </div>
             
             <button 
                onClick={handleShare}
                className="text-xs font-bold text-purple-600 hover:text-purple-800 underline"
             >
                 Share via WhatsApp
             </button>
          </div>

          <div className="grid grid-cols-1 gap-3 mb-6">
             <button 
              onClick={handleWhatsAppReceipt}
              className="w-full bg-[#25D366] text-white px-6 py-3.5 rounded-lg hover:bg-[#128c7e] transition shadow-md hover:shadow-lg flex items-center justify-center font-bold text-lg group"
            >
              <MessageCircle className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
              Get Details on WhatsApp
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button onClick={handleEmailReceipt} className="w-full sm:w-auto bg-blue-50 text-blue-700 px-6 py-2.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition flex items-center justify-center font-medium">
              <Mail className="w-4 h-4 mr-2" /> Email Receipt
            </button>
            <button onClick={() => window.print()} className="w-full sm:w-auto bg-gray-50 text-gray-700 px-6 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition flex items-center justify-center font-medium">
               <Printer className="w-4 h-4 mr-2" /> Print Ticket
            </button>
          </div>
          
          <button onClick={() => window.location.reload()} className="text-gray-400 hover:text-black hover:underline text-sm py-2 mt-6 block mx-auto transition-colors">
              Register Another Student
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] p-6 md:p-8 border-t-[6px] border-[#1a3689] animate-in slide-in-from-bottom-8 fade-in duration-500 relative overflow-hidden ring-1 ring-gray-100">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/60 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-50/60 rounded-full blur-3xl -ml-40 -mb-40 pointer-events-none"></div>

        <div className="relative z-10">
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4 mt-1">
            <div>
                <h2 className="text-2xl md:text-3xl font-bold font-serif text-gray-900 tracking-tight">Student Registration</h2>
                <p className="text-sm text-gray-500 mt-1 font-medium">Fill in the details carefully</p>
            </div>
            <button 
                onClick={handleShare}
                disabled={shareLoading}
                type="button"
                className="text-blue-700 hover:text-white flex items-center text-sm font-bold transition-all bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-600 disabled:opacity-70 disabled:cursor-not-allowed border border-blue-100 hover:border-blue-600 group"
            >
                {shareLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4 mr-1.5 group-hover:text-white" />}
                <span className="group-hover:text-white">Share</span>
            </button>
            </div>
            
            {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg text-sm flex items-start shadow-sm">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
            </div>
            )}

            {generalError && (
            <div className="mb-6 bg-orange-50 border-l-4 border-orange-500 text-orange-800 p-4 rounded-r-lg text-sm flex items-start shadow-sm">
                <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{generalError}</span>
            </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5" noValidate>
            
            {/* Full Name */}
            <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Student Full Name <span className="text-red-500">*</span></label>
                <div className="relative">
                    <input 
                    type="text" name="fullName" required autoComplete="name"
                    value={formData.fullName} onChange={handleChange}
                    className={finalInputClasses} placeholder="First Middle Last"
                    />
                    <User className="absolute right-3 top-3.5 w-5 h-5 text-gray-300 pointer-events-none" />
                </div>
            </div>

            {/* Parent Name */}
            <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Parent Name <span className="text-red-500">*</span></label>
                <div className="relative">
                    <input 
                    type="text" name="parentName" required autoComplete="name"
                    value={formData.parentName} onChange={handleChange}
                    className={finalInputClasses} placeholder="Parent's Full Name"
                    />
                    <User className="absolute right-3 top-3.5 w-5 h-5 text-gray-300 pointer-events-none" />
                </div>
            </div>

            {/* Contact */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Mobile <span className="text-red-500">*</span></label>
                <input 
                type="tel" name="mobile" required autoComplete="tel"
                maxLength={16} value={formData.mobile} onChange={handleChange}
                className={finalInputClasses} placeholder="+91 98765 43210"
                pattern="^[\+]?[\d\s]{10,16}$"
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">WhatsApp</label>
                <input 
                type="tel" name="whatsapp" autoComplete="tel"
                maxLength={16} value={formData.whatsapp} onChange={handleChange}
                className={finalInputClasses} placeholder="+91 98765 43210"
                pattern="^[\+]?[\d\s]{10,16}$"
                />
            </div>

            {/* Email */}
            <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Email <span className="text-red-500">*</span></label>
                <div className="relative">
                    <input 
                    type="email" name="email" required autoComplete="email"
                    value={formData.email} onChange={handleChange}
                    className={finalInputClasses} placeholder="student@example.com"
                    />
                    <Mail className="absolute right-3 top-3.5 w-5 h-5 text-gray-300 pointer-events-none" />
                </div>
            </div>

            {/* School */}
            <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">School Name <span className="text-red-500">*</span></label>
                <input 
                type="text" name="schoolName" required
                value={formData.schoolName} onChange={handleChange}
                className={finalInputClasses} placeholder="Current School"
                />
            </div>

            {/* Interest */}
            <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Field of Interest <span className="text-red-500">*</span></label>
                <div className="relative">
                    <select 
                    name="fieldOfInterest" required
                    value={formData.fieldOfInterest} onChange={handleChange}
                    className={`${finalInputClasses} appearance-none bg-white cursor-pointer`}
                    >
                    <option value="" disabled>Select Interest</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="B.Sc Agri">B.Sc Agri</option>
                    <option value="Doctor">Doctor</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>

            {/* Location */}
            <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Preferred Center <span className="text-red-500">*</span></label>
                <div className="relative">
                    <select 
                    name="location" required
                    value={formData.location} onChange={handleChange}
                    className={`${finalInputClasses} appearance-none bg-white cursor-pointer`}
                    >
                    <option value="" disabled>Select Branch</option>
                    <option value={LocationEnum.SATPUR}>Satpur Branch (Main)</option>
                    <option value={LocationEnum.MERI}>Meri Branch</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
                {formData.location && (
                <p className="text-xs text-blue-600 mt-2 ml-1 flex items-center font-medium animate-fade-in-down">
                    <MapPin className="w-3.5 h-3.5 mr-1 inline" />
                    {formData.location === LocationEnum.SATPUR ? 'Ashok Nagar, Satpur' : 'RTO Corner, Meri'}
                </p>
                )}
            </div>

            {/* Referral Code (Optional) */}
            <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Referral Code <span className="text-gray-400 font-normal">(Optional)</span></label>
                <div className="relative">
                    <input 
                    type="text" name="referralCode"
                    value={formData.referralCode} onChange={handleChange}
                    className={`${finalInputClasses} pr-10 ${
                        referralStatus === 'valid' ? 'border-green-500 bg-green-50 focus:border-green-600 focus:ring-green-100' : 
                        referralStatus === 'invalid' ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-red-100' : ''
                    }`} 
                    placeholder="Have a friend's code?"
                    />
                    <div className="absolute right-3 top-3.5 pointer-events-none">
                        {referralStatus === 'valid' ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : referralStatus === 'invalid' ? (
                            <XCircle className="w-5 h-5 text-red-500" />
                        ) : (
                            <Gift className="w-5 h-5 text-gray-300" />
                        )}
                    </div>
                </div>
                
                {referralStatus === 'valid' && (
                    <p className="text-[10px] text-green-600 mt-1 ml-1 font-bold animate-fade-in-down">
                        Code applied! Free Study Guide unlocked.
                    </p>
                )}
                {referralStatus === 'invalid' && (
                    <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold animate-fade-in-down">
                        Invalid format. Example: REF-ABC1234 or verify your code.
                    </p>
                )}
                {referralStatus === 'idle' && (
                    <p className="text-[10px] text-gray-500 mt-1 ml-1">Enter a code to unlock a free study guide.</p>
                )}
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Notes (Optional)</label>
                <textarea 
                name="notes" value={formData.notes} onChange={handleChange}
                rows={2} className={finalInputClasses} placeholder="Any specific queries..."
                />
            </div>

            {/* Actions */}
            <div className="md:col-span-2 space-y-4 mt-4">
                <button 
                type="submit" disabled={loading}
                className={`w-full font-bold text-lg py-4 rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.15)] transition-all duration-300 flex items-center justify-center relative overflow-hidden group
                    ${loading ? 'bg-gray-800 text-gray-200 cursor-wait' : 'bg-[#1a1a1a] text-white hover:bg-black hover:shadow-[0_15px_30px_rgba(0,0,0,0.25)] hover:-translate-y-1'}
                `}
                >
                <span className="relative z-10 flex items-center">
                    {loading ? <><Loader2 className="animate-spin mr-2" /> Processing...</> : 'REGISTER NOW'}
                </span>
                {!loading && <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-shine"></div>}
                </button>

                <div className="flex justify-center">
                    <button 
                    type="button" onClick={handleSaveDraft}
                    className="flex items-center text-gray-500 hover:text-blue-600 text-xs font-bold uppercase tracking-wider transition-all py-2 px-4 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-100 group"
                    >
                    <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" /> 
                    {draftMessage || 'Save Draft'}
                    </button>
                </div>
            </div>
            </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-scale-up duration-300 border border-gray-100">
            <div className="bg-gradient-to-r from-gray-50 to-white px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold font-serif text-gray-900">Verify Details</h3>
              <button onClick={() => setShowConfirmModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-3">
              <div className="bg-blue-50/50 p-4 rounded-xl space-y-3 border border-blue-100 text-sm">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-1.5 rounded-lg mr-3">
                     <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block mb-0.5">Student</span>
                    <span className="font-bold text-gray-900 text-base">{formData.fullName}</span>
                  </div>
                </div>
                
                <div className="flex items-start">
                   <div className="bg-blue-100 p-1.5 rounded-lg mr-3">
                     <Clock className="w-4 h-4 text-blue-600" />
                   </div>
                  <div>
                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block mb-0.5">Exam Date</span>
                    <span className="font-bold text-gray-900 text-base">{EXAM_DATE}</span>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-100 p-1.5 rounded-lg mr-3">
                     <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block mb-0.5">Center</span>
                    <span className="font-bold text-gray-900 text-base">
                      {formData.location ? BRANCHES[formData.location]?.name : 'Not Selected'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-bold text-sm transition-colors shadow-sm"
              >
                Edit
              </button>
              <button 
                onClick={finalizeRegistration}
                className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 font-bold shadow-md text-sm transition-all transform hover:-translate-y-0.5"
              >
                Confirm Registration
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}