export enum LocationEnum {
  MERI = 'MERI',
  SATPUR = 'SATPUR'
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Pending';

export interface RegistrationFormData {
  fullName: string;
  classStd: string; // Fixed to 10th
  parentName: string;
  mobile: string;
  email: string;
  schoolName: string;
  location: LocationEnum | '';
  fieldOfInterest: string;
  whatsapp: string;
  notes: string;
  referralCode: string; // Code entered by the student if referred
}

export interface RegisteredStudent extends RegistrationFormData {
  seatNumber: string;
  timestamp: string;
  attendance?: AttendanceStatus;
  ownReferralCode?: string; // Code generated for the student to share
}

export interface GoogleSheetResponse {
  result: 'success' | 'error';
  seatNumber?: string;
  message?: string;
  error?: string;
  ownReferralCode?: string;
}

export interface BranchContact {
  name: string;
  phones: string[];
  address: string;
  mapLink: string;
}