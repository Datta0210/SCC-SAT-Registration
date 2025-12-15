import React, { useState, useEffect } from 'react';
import { RegisteredStudent, LocationEnum, AttendanceStatus } from '../types';
import { Lock, LogOut, Download, Search, Trash2, User, MapPin, ArrowUpDown, PlusCircle, X, Check, Copy, CheckCircle, XCircle, Clock, Filter, Users, Gift } from 'lucide-react';
import { EXAM_DATE } from '../constants';

interface AdminPanelProps {
  onBack: () => void;
}

// Custom WhatsApp Icon Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [students, setStudents] = useState<RegisteredStudent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [whatsAppStudent, setWhatsAppStudent] = useState<RegisteredStudent | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof RegisteredStudent; direction: 'asc' | 'desc' } | null>(null);
  const [attendanceFilter, setAttendanceFilter] = useState<AttendanceStatus | 'All'>('All');
  
  // Manual Seat Generation State
  const [generatedSeat, setGeneratedSeat] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('scc_all_registrations');
      if (storedData) {
        setStudents(JSON.parse(storedData));
      }
    } catch (e) {
      console.error("Failed to load registrations", e);
    }
  }, []);

  // Create a map for quick lookup of referrer names based on their unique code
  const referrerMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    students.forEach(s => {
        if (s.ownReferralCode) {
            map[s.ownReferralCode] = s.fullName;
        }
    });
    return map;
  }, [students]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    onBack();
  };

  const handleDelete = (seatNumber: string) => {
    if (window.confirm(`Are you sure you want to delete registration ${seatNumber}?`)) {
      const updatedStudents = students.filter(s => s.seatNumber !== seatNumber);
      setStudents(updatedStudents);
      localStorage.setItem('scc_all_registrations', JSON.stringify(updatedStudents));
    }
  };

  const updateAttendance = (seatNumber: string, status: AttendanceStatus) => {
    const updatedStudents = students.map(s => 
      s.seatNumber === seatNumber ? { ...s, attendance: status } : s
    );
    setStudents(updatedStudents);
    localStorage.setItem('scc_all_registrations', JSON.stringify(updatedStudents));
  };

  const handleSort = (key: keyof RegisteredStudent) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const generateManualSeat = () => {
    const year = EXAM_DATE.split(' ').pop() || new Date().getFullYear().toString();
    try {
        let count = parseInt(localStorage.getItem('scc_demo_seq_count') || '1284');
        count++;
        localStorage.setItem('scc_demo_seq_count', count.toString());
        setGeneratedSeat(`SCC-${year}-${count}`);
    } catch {
        setGeneratedSeat(`SCC-${year}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  };

  const copyGeneratedSeat = async () => {
    if (generatedSeat) {
        try {
            await navigator.clipboard.writeText(generatedSeat);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    }
  };

  const handleExport = () => {
    if (students.length === 0) return;
    
    // Added Referred By columns
    const headers = ['Seat Number', 'Name', 'Mobile', 'WhatsApp', 'Parent Name', 'Email', 'School', 'Class', 'Field', 'Location', 'My Referral Code', 'Referred By Code', 'Referred By Name', 'Attendance', 'Notes', 'Date'];
    
    // Helper to escape CSV values correctly
    const escape = (val: string | undefined | null) => {
        if (!val) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const csvContent = [
      headers.join(','),
      ...students.map(s => {
        const referrerName = s.referralCode ? (referrerMap[s.referralCode] || 'Unknown') : '';
        return [
            escape(s.seatNumber), 
            escape(s.fullName), 
            escape(s.mobile),
            escape(s.whatsapp), 
            escape(s.parentName), 
            escape(s.email),
            escape(s.schoolName),
            escape(s.classStd),
            escape(s.fieldOfInterest),
            escape(s.location), 
            escape(s.ownReferralCode),
            escape(s.referralCode), // Code used
            escape(referrerName), // Name of referrer
            escape(s.attendance || 'Pending'),
            escape(s.notes),
            escape(new Date(s.timestamp).toLocaleDateString())
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `scc_registrations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWhatsAppClick = (student: RegisteredStudent) => {
    setWhatsAppStudent(student);
  };

  const confirmSendWhatsApp = () => {
    if (!whatsAppStudent) return;
    
    const student = whatsAppStudent;
    const msg = `*SCC SAT Registration Confirmed* ✅

Hello ${student.fullName},
Your registration for the Scholarship Exam is successful!

📌 *Seat Number:* ${student.seatNumber}
📅 *Exam Date:* ${EXAM_DATE}
📍 *Location:* ${student.location} Branch

Please present this message at the exam center.
- Shiv Chhatrapati Classes`;

    // Ensure clean number with country code
    let mobile = student.whatsapp || student.mobile;
    mobile = mobile.replace(/\D/g, '');
    if (mobile.length === 10) mobile = '91' + mobile;
    
    window.open(`https://wa.me/${mobile}?text=${encodeURIComponent(msg)}`, '_blank');
    setWhatsAppStudent(null);
  };

  const filtered = students.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.seatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.mobile.includes(searchTerm);
    
    const status = s.attendance || 'Pending';
    const matchesFilter = attendanceFilter === 'All' || status === attendanceFilter;

    return matchesSearch && matchesFilter;
  });

  // Apply sorting
  if (sortConfig !== null) {
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  const satpurCount = students.filter(s => s.location === LocationEnum.SATPUR).length;
  const meriCount = students.filter(s => s.location === LocationEnum.MERI).length;
  
  // Attendance Stats
  const presentCount = students.filter(s => s.attendance === 'Present').length;
  const absentCount = students.filter(s => s.attendance === 'Absent').length;
  const pendingCount = students.filter(s => !s.attendance || s.attendance === 'Pending').length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-sm border border-gray-100">
          <div className="text-center mb-6">
            <div className="bg-red-50 p-3 rounded-full inline-flex mb-3">
              <Lock className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold font-serif text-gray-900">Admin Login</h2>
            <p className="text-sm text-gray-500 mt-1">SCC Registration System</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm font-medium animate-pulse">{error}</p>}
            <button type="submit" className="w-full bg-black text-white py-2.5 rounded-md hover:bg-gray-800 transition font-medium">Login</button>
            <button type="button" onClick={onBack} className="w-full text-gray-500 text-sm mt-2 hover:text-black hover:underline">Back to Home</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold font-serif text-gray-900 flex items-center">
              <User className="w-6 h-6 mr-2 text-blue-600" />
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1 ml-8">Manage registrations for SCC SAT 2025</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 text-center">
               <span className="block text-xs font-bold text-gray-500 uppercase">Total</span>
               <span className="text-xl font-bold text-blue-700">{students.length}</span>
             </div>
             <button 
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 rounded-lg transition-colors text-sm font-medium"
             >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
             </button>
          </div>
        </div>

        {/* Location Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Satpur Branch</p>
                <h3 className="text-2xl font-bold text-gray-900">{satpurCount}</h3>
              </div>
            </div>
            <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center text-xs font-bold text-gray-400">
              {students.length > 0 ? Math.round((satpurCount / students.length) * 100) : 0}%
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
             <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-50 text-purple-600 mr-4">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Meri Branch</p>
                <h3 className="text-2xl font-bold text-gray-900">{meriCount}</h3>
              </div>
            </div>
            <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center text-xs font-bold text-gray-400">
              {students.length > 0 ? Math.round((meriCount / students.length) * 100) : 0}%
            </div>
          </div>
        </div>
        
        {/* Attendance Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
             <div className="bg-green-50 p-3 rounded-lg border border-green-100 flex flex-col items-center">
                 <span className="text-xs font-bold text-green-600 uppercase">Present</span>
                 <span className="text-xl font-bold text-green-800">{presentCount}</span>
             </div>
             <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex flex-col items-center">
                 <span className="text-xs font-bold text-red-600 uppercase">Absent</span>
                 <span className="text-xl font-bold text-red-800">{absentCount}</span>
             </div>
             <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 flex flex-col items-center">
                 <span className="text-xs font-bold text-gray-500 uppercase">Pending</span>
                 <span className="text-xl font-bold text-gray-700">{pendingCount}</span>
             </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col xl:flex-row justify-between gap-4 items-center">
             <div className="flex-1 w-full relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                type="text" 
                placeholder="Search by name, seat number, or mobile..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto items-center">
                 {/* Attendance Filter */}
                 <div className="relative w-full sm:w-auto">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                        value={attendanceFilter}
                        onChange={(e) => setAttendanceFilter(e.target.value as AttendanceStatus | 'All')}
                        className="w-full sm:w-auto pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white cursor-pointer text-sm font-medium"
                    >
                        <option value="All">All Status</option>
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                        <option value="Pending">Pending</option>
                    </select>
                 </div>

                 {/* Seat Generator Button and Display */}
                 <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1 w-full sm:w-auto justify-center sm:justify-start">
                    <button 
                        onClick={generateManualSeat}
                        className="flex items-center px-3 py-1.5 bg-white text-blue-700 border border-gray-200 rounded-md hover:bg-blue-50 transition-colors text-sm font-bold shadow-sm whitespace-nowrap"
                        title="Generate a new seat number for manual registration"
                    >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        New Seat No
                    </button>
                    {generatedSeat && (
                        <div className="flex items-center ml-2 mr-1 animate-fade-in-down">
                            <span className="font-mono text-sm font-bold text-gray-800 bg-gray-200 px-2 py-1 rounded">{generatedSeat}</span>
                            <button 
                                onClick={copyGeneratedSeat}
                                className="ml-2 p-1 text-gray-500 hover:text-green-600 transition-colors"
                                title="Copy"
                            >
                                {copySuccess ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    )}
                 </div>

                <button 
                    onClick={handleExport}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm whitespace-nowrap w-full sm:w-auto justify-center"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </button>
            </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('seatNumber')}>
                    <div className="flex items-center">Seat No <ArrowUpDown className="w-3 h-3 ml-1" /></div>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('fullName')}>
                     <div className="flex items-center">Name <ArrowUpDown className="w-3 h-3 ml-1" /></div>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">School/Loc</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">My Code</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Referred By</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Attendance</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No registrations found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((student) => (
                    <tr key={student.seatNumber} className={`transition-colors ${student.attendance === 'Present' ? 'bg-green-50/30' : 'hover:bg-blue-50/30'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">{student.seatNumber}</span>
                        <div className="text-[10px] text-gray-400 mt-1">{new Date(student.timestamp).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">{student.fullName}</div>
                        <div className="text-xs text-gray-500">{student.parentName} (Parent)</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">{student.mobile}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[150px]">{student.email}</div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="text-sm text-gray-900 font-medium truncate max-w-[180px]" title={student.schoolName}>{student.schoolName}</div>
                         <div className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-600">
                           {student.location === LocationEnum.SATPUR ? 'Satpur' : 'Meri'}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded inline-block">
                           {student.ownReferralCode || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {student.referralCode ? (
                            <div>
                                <div className="inline-flex items-center text-green-700 font-bold text-[10px] bg-green-50 px-2 py-0.5 rounded-full mb-1">
                                    <Gift className="w-3 h-3 mr-1" />
                                    {student.referralCode}
                                </div>
                                {referrerMap[student.referralCode] ? (
                                    <div className="text-xs text-gray-600 font-medium flex items-center">
                                        <User className="w-3 h-3 mr-1 text-gray-400" />
                                        {referrerMap[student.referralCode]}
                                    </div>
                                ) : (
                                    <div className="text-[10px] text-red-400 italic">Unknown Code</div>
                                )}
                            </div>
                        ) : (
                            <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      
                      {/* Attendance Controls */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-1.5">
                            <button 
                            onClick={() => updateAttendance(student.seatNumber, 'Present')}
                            className={`p-1.5 rounded-lg transition-all ${student.attendance === 'Present' ? 'bg-green-100 text-green-700 shadow-sm ring-1 ring-green-400' : 'text-gray-300 hover:bg-green-50 hover:text-green-600'}`}
                            title="Mark Present"
                            >
                            <CheckCircle className="w-5 h-5" />
                            </button>
                            <button 
                            onClick={() => updateAttendance(student.seatNumber, 'Absent')}
                            className={`p-1.5 rounded-lg transition-all ${student.attendance === 'Absent' ? 'bg-red-100 text-red-700 shadow-sm ring-1 ring-red-400' : 'text-gray-300 hover:bg-red-50 hover:text-red-600'}`}
                            title="Mark Absent"
                            >
                            <XCircle className="w-5 h-5" />
                            </button>
                            <button 
                            onClick={() => updateAttendance(student.seatNumber, 'Late')}
                            className={`p-1.5 rounded-lg transition-all ${student.attendance === 'Late' ? 'bg-yellow-100 text-yellow-700 shadow-sm ring-1 ring-yellow-400' : 'text-gray-300 hover:bg-yellow-50 hover:text-yellow-600'}`}
                            title="Mark Late"
                            >
                            <Clock className="w-5 h-5" />
                            </button>
                        </div>
                        <div className={`text-[10px] font-bold uppercase mt-1.5 text-center tracking-wider
                            ${!student.attendance || student.attendance === 'Pending' ? 'text-gray-400' : ''}
                            ${student.attendance === 'Present' ? 'text-green-600' : ''}
                            ${student.attendance === 'Absent' ? 'text-red-600' : ''}
                            ${student.attendance === 'Late' ? 'text-yellow-600' : ''}
                        `}>
                            {student.attendance || 'Pending'}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                           <button 
                            onClick={() => handleWhatsAppClick(student)}
                            className="p-1.5 text-white bg-[#25D366] hover:bg-[#128c7e] rounded-full transition-colors shadow-sm"
                            title="Send WhatsApp Confirmation"
                           >
                             <WhatsAppIcon className="w-5 h-5" />
                           </button>
                           <button 
                            onClick={() => handleDelete(student.seatNumber)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                           >
                             <Trash2 className="w-5 h-5" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
             <span>Showing {filtered.length} of {students.length} entries</span>
          </div>
        </div>
      </div>

      {/* WhatsApp Modal */}
      {whatsAppStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
              <div className="bg-[#25D366] p-4 flex items-center justify-between">
                 <h3 className="text-white font-bold flex items-center">
                   <WhatsAppIcon className="w-6 h-6 mr-2" /> Send Confirmation
                 </h3>
                 <button onClick={() => setWhatsAppStudent(null)} className="text-white/80 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              
              <div className="p-5">
                <p className="text-sm text-gray-600 mb-4">
                  Send registration confirmation via WhatsApp to <span className="font-bold text-gray-900">{whatsAppStudent.fullName}</span>?
                </p>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs text-gray-500 mb-4 font-mono">
                   *SCC SAT Registration Confirmed* ✅...
                </div>
                <div className="flex gap-3">
                    <button 
                      onClick={() => setWhatsAppStudent(null)}
                      className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={confirmSendWhatsApp}
                      className="flex-1 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#128c7e] font-bold shadow-md transition-colors flex items-center justify-center"
                    >
                      <WhatsAppIcon className="w-4 h-4 mr-2" />
                      Send Message
                    </button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}