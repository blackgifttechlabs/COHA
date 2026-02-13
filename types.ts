import React from 'react';

export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  pin: string;
}

export interface Teacher extends User {
  subject?: string;
  email?: string;
}

export interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export interface FeeItem {
  id: string;
  category: string;
  amount: string; // Stored as string to handle decimals, but input is number
  frequency: string;
  notes?: string;
}

export interface SupplyItem {
  id: string;
  name: string;
  isRequired: boolean;
}

export interface SystemSettings {
  id?: string;
  adminName: string;
  adminPin: string;
  
  // Structured Data
  fees: FeeItem[];
  uniforms: SupplyItem[];
  stationery: SupplyItem[];
  grades: string[];
  
  termStartDate: string;
  termStartTime: string;
  
  // Counters
  lastStudentId?: number; 
}

export interface Application {
  id?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submissionDate: any; // Firestore Timestamp
  
  // Learner Details
  surname: string;
  firstName: string;
  dob: string;
  citizenship: string;
  gender: 'Male' | 'Female';
  address: string;
  region: string;
  grade: string;
  isSpecialNeeds: boolean;
  specialNeedsType?: string; // Slow learner, Down Syndrome, Autism, etc.
  
  // Parent Details
  fatherName: string;
  fatherPhone: string;
  fatherEmail: string;
  motherName: string;
  motherPhone: string;
  motherEmail?: string;

  // Emergency Contact
  emergencyName: string;
  emergencyRelationship: string;
  emergencyWork: string;
  emergencyCell: string;
  emergencyEmail: string;
  
  // Medical & History
  hasPreviousSchool: boolean;
  previousSchool: string;
  highestGrade: string;
  medicalConditions: string;
  
  // Professionals
  doctorName?: string;
  doctorContact?: string;
  audiologistName?: string;
  audiologistContact?: string;
  therapistName?: string;
  therapistContact?: string;

  // Medical Aid
  hasMedicalAid: boolean;
  medicalAidName?: string;
  medicalAidMemberName?: string;
  medicalAidMemberID?: string;
  medicalAidOption?: string;

  // Languages
  langEnglish: 'Good' | 'Fair' | 'Poor';
  langOther1Name?: string;
  langOther1Rating?: 'Good' | 'Fair' | 'Poor';
  langOther2Name?: string;
  langOther2Rating?: 'Good' | 'Fair' | 'Poor';

  // Consents
  medicalConsent: boolean;
  agreed: boolean;
  
  // Office Use
  officeReviewDate?: string;
  officeReviewer?: string;
  officeStatus?: string;
  officeResponseDate?: string;
  officeResponseMethod?: string;
}

export type StudentStatus = 'WAITING_PAYMENT' | 'PAYMENT_VERIFICATION' | 'ASSESSMENT' | 'ENROLLED';

// Student extends Application to allow full profile view
export interface Student extends Partial<Application> {
  id: string;
  name: string; // Display Name (First + Surname)
  grade: string;
  parentPin: string;
  parentName: string;
  enrolledAt?: any;
  studentStatus: StudentStatus;
  
  // Payment Verification
  receiptNumber?: string;
  receiptSubmissionDate?: any;
  paymentRejected?: boolean; // New flag for parent dashboard
}

export interface Receipt {
  id?: string;
  number: string;
  amount: string;
  date: string;
  isUsed: boolean;
  usedByStudentId?: string;
  createdAt?: any;
}