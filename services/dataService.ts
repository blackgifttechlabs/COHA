import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, getDoc, query, where, doc, updateDoc, deleteDoc, orderBy, Timestamp, setDoc, runTransaction } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Teacher, Student, UserRole, Application, SystemSettings, Receipt } from '../types';

// Collections
const TEACHERS_COLLECTION = 'teachers';
const STUDENTS_COLLECTION = 'students';
const APPLICATIONS_COLLECTION = 'applications';
const SETTINGS_COLLECTION = 'settings';
const RECEIPTS_COLLECTION = 'receipts';

// Admin Auth Configuration
const ADMIN_EMAIL = "admin@coha.com";
const ADMIN_AUTH_PASSWORD = "111111"; 

// ... (Existing Admin Seed, Teachers code remains same) ...
// Seed Admin User
export const seedAdminUser = async () => {
  try {
    await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_AUTH_PASSWORD);
    
    // Ensure default settings exist
    const settings = await getSystemSettings();
    if (!settings) {
      await saveSystemSettings({
        adminName: 'Victoria Joel',
        adminPin: '1111',
        termStartDate: '2026-01-14',
        termStartTime: '07:30',
        grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'],
        fees: [
          { id: '1', category: 'Tuition (Special Classes)', amount: '2300', frequency: 'Monthly', notes: 'Due by 5th' },
          { id: '2', category: 'Tuition (Termly)', amount: '7100', frequency: 'Termly', notes: 'Discounted rate' },
          // ... (others truncated for brevity, same as before)
        ],
        uniforms: [], // ...
        stationery: [], // ...
        lastStudentId: 0
      });
    }
  } catch (error: any) {
    if (error.code !== 'auth/email-already-in-use') {
      console.error("Error seeding admin user:", error);
    }
  }
};

export const addTeacher = async (name: string, subject: string) => {
  try {
    await addDoc(collection(db, TEACHERS_COLLECTION), {
      name,
      subject,
      role: UserRole.TEACHER,
      pin: '1234',
      createdAt: new Date()
    });
    return true;
  } catch (error) {
    console.error("Error adding teacher: ", error);
    return false;
  }
};

export const updateTeacher = async (id: string, data: Partial<Teacher>) => {
  try {
    const docRef = doc(db, TEACHERS_COLLECTION, id);
    await updateDoc(docRef, data as any);
    return true;
  } catch (error) {
    console.error("Error updating teacher:", error);
    return false;
  }
};

export const deleteTeacher = async (id: string) => {
  try {
    await deleteDoc(doc(db, TEACHERS_COLLECTION, id));
    return true;
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return false;
  }
};

export const getTeachers = async (): Promise<Teacher[]> => {
  const q = query(collection(db, TEACHERS_COLLECTION));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher));
};

export const searchTeachers = async (searchTerm: string): Promise<Teacher[]> => {
  if (!searchTerm) return [];
  const all = await getTeachers();
  return all.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
};


// --- STUDENT LOGIC WITH C-XXXX ID ---

const generateStudentId = async (): Promise<string> => {
  const settingsRef = doc(db, SETTINGS_COLLECTION, 'general');
  
  try {
    const newId = await runTransaction(db, async (transaction) => {
      const settingsDoc = await transaction.get(settingsRef);
      if (!settingsDoc.exists()) {
        throw "Settings document does not exist!";
      }
      
      const currentCount = settingsDoc.data().lastStudentId || 0;
      const nextCount = currentCount + 1;
      
      transaction.update(settingsRef, { lastStudentId: nextCount });
      
      return nextCount;
    });

    // Format to C-0001
    return `C-${newId.toString().padStart(4, '0')}`;
  } catch (e) {
    console.error("Transaction failed: ", e);
    // Fallback if transaction fails (basic timestamp approach, not ideal for requested format but fallback)
    return `C-${Date.now().toString().slice(-4)}`; 
  }
};

export const addStudent = async (studentData: Partial<Student>) => {
  // This is for MANUAL adding.
  try {
    const customId = await generateStudentId();
    const displayName = `${studentData.firstName} ${studentData.surname}`;
    const primaryParent = studentData.fatherName || studentData.motherName || 'Unknown Parent';
    
    // Set Document ID manually
    await setDoc(doc(db, STUDENTS_COLLECTION, customId), {
      ...studentData,
      id: customId,
      name: displayName,
      parentName: primaryParent,
      role: UserRole.PARENT,
      studentStatus: 'ENROLLED', // Manual adds are enrolled
      enrolledAt: Timestamp.now(), 
      createdAt: new Date()
    });
    return true;
  } catch (error) {
    console.error("Error adding student: ", error);
    return false;
  }
};

// Workflow: Application Approved -> Create Student (Status: WAITING_PAYMENT)
export const approveApplicationInitial = async (app: Application): Promise<{pin: string, studentId: string} | null> => {
  try {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const customId = await generateStudentId();

    const studentData = {
        ...app,
        name: `${app.firstName} ${app.surname}`,
        parentName: app.fatherName || app.motherName,
        parentPin: pin,
        role: UserRole.PARENT,
        studentStatus: 'WAITING_PAYMENT', // Workflow Start
        enrolledAt: Timestamp.now()
    };
    
    const { id, ...dataToSave } = studentData as any;

    await setDoc(doc(db, STUDENTS_COLLECTION, customId), {
        ...dataToSave,
        id: customId // Store ID inside field too
    });
    
    return { pin, studentId: customId };
  } catch (error) {
    console.error("Error enrolling student:", error);
    return null;
  }
};

export const updateStudent = async (id: string, data: Partial<Student>) => {
  try {
    const docRef = doc(db, STUDENTS_COLLECTION, id);
    await updateDoc(docRef, data as any);
    return true;
  } catch (error) {
    console.error("Error updating student:", error);
    return false;
  }
};

export const deleteStudent = async (id: string) => {
  try {
    await deleteDoc(doc(db, STUDENTS_COLLECTION, id));
    return true;
  } catch (error) {
    console.error("Error deleting student:", error);
    return false;
  }
};

export const getStudents = async (): Promise<Student[]> => {
  const q = query(collection(db, STUDENTS_COLLECTION));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
};

export const getStudentsByStatus = async (status: string): Promise<Student[]> => {
    const q = query(collection(db, STUDENTS_COLLECTION), where("studentStatus", "==", status));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
};

export const getStudentById = async (id: string): Promise<Student | null> => {
  const docRef = doc(db, STUDENTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Student;
  }
  return null;
};

export const searchStudents = async (searchTerm: string): Promise<Student[]> => {
  if (!searchTerm) return [];
  const all = await getStudents();
  return all.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
};

// --- RECEIPT LOGIC ---

export const getReceipts = async (): Promise<Receipt[]> => {
    const q = query(collection(db, RECEIPTS_COLLECTION), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Receipt));
};

export const addReceipt = async (number: string, amount: string, date: string) => {
    try {
        await addDoc(collection(db, RECEIPTS_COLLECTION), {
            number: number.trim(),
            amount,
            date,
            isUsed: false,
            createdAt: Timestamp.now()
        });
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

export const deleteReceipt = async (id: string) => {
    await deleteDoc(doc(db, RECEIPTS_COLLECTION, id));
    return true;
};

// Parent submits receipt number
export const submitPaymentReceipt = async (studentId: string, receiptNumber: string) => {
    try {
        await updateStudent(studentId, {
            receiptNumber: receiptNumber,
            receiptSubmissionDate: Timestamp.now(),
            studentStatus: 'PAYMENT_VERIFICATION', // Move to next stage
            paymentRejected: false // Reset rejection flag if it existed
        });
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

// Admin verifies receipt
export const verifyPayment = async (studentId: string, receiptNumber: string): Promise<{success: boolean, message: string}> => {
    try {
        // 1. Check if receipt exists and is unused
        const q = query(collection(db, RECEIPTS_COLLECTION), where("number", "==", receiptNumber), where("isUsed", "==", false));
        const snap = await getDocs(q);

        if (snap.empty) {
            // Receipt not found or already used
            return { success: false, message: 'Receipt not found or already used.' };
        }

        const receiptDoc = snap.docs[0];
        
        // 2. Mark receipt as used
        await updateDoc(doc(db, RECEIPTS_COLLECTION, receiptDoc.id), {
            isUsed: true,
            usedByStudentId: studentId
        });

        // 3. Update Student Status
        await updateStudent(studentId, {
            studentStatus: 'ASSESSMENT' // Move to assessment
        });

        return { success: true, message: 'Payment verified.' };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'System error.' };
    }
};

export const rejectPayment = async (studentId: string) => {
    // Reset to waiting payment AND mark as rejected so parent sees notice
    await updateStudent(studentId, {
        studentStatus: 'WAITING_PAYMENT',
        receiptNumber: '',
        paymentRejected: true
    });
};

export const assessStudent = async (studentId: string) => {
    // Final Enrollment
    await updateStudent(studentId, {
        studentStatus: 'ENROLLED'
    });
};


// --- EXISTING UTILS ---

export const verifyAdminPin = async (pin: string): Promise<boolean> => {
  const settings = await getSystemSettings();
  const validPin = settings ? settings.adminPin : '1111';

  if (pin !== validPin) return false;

  try {
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_AUTH_PASSWORD);
    return true;
  } catch (error) {
    console.error("Admin login failed:", error);
    return false;
  }
};

export const getAdminProfile = async () => {
  const settings = await getSystemSettings();
  return { 
    name: settings?.adminName || 'Victoria Joel', 
    id: 'admin' 
  };
};

export const submitApplication = async (applicationData: Partial<Application>) => {
  try {
    await addDoc(collection(db, APPLICATIONS_COLLECTION), {
      ...applicationData,
      status: 'PENDING',
      submissionDate: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error("Error submitting application:", error);
    return false;
  }
};

export const getApplications = async (): Promise<Application[]> => {
  const q = query(collection(db, APPLICATIONS_COLLECTION), orderBy('submissionDate', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
};

export const getApplicationById = async (id: string): Promise<Application | null> => {
  const docRef = doc(db, APPLICATIONS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Application;
  }
  return null;
};

export const updateApplication = async (id: string, data: Partial<Application>) => {
  try {
    const docRef = doc(db, APPLICATIONS_COLLECTION, id);
    await updateDoc(docRef, data);
    return true;
  } catch (error) {
    console.error("Error updating application:", error);
    return false;
  }
};

// New function to get counts for sidebar badges
export const getPendingActionCounts = async () => {
    try {
        const appsQuery = query(collection(db, APPLICATIONS_COLLECTION), where("status", "==", "PENDING"));
        const appsSnap = await getDocs(appsQuery);
        
        const verifyQuery = query(collection(db, STUDENTS_COLLECTION), where("studentStatus", "==", "PAYMENT_VERIFICATION"));
        const verifySnap = await getDocs(verifyQuery);
        
        return {
            pendingApps: appsSnap.size,
            pendingVerifications: verifySnap.size,
            total: appsSnap.size + verifySnap.size
        };
    } catch (e) {
        console.error("Error fetching counts", e);
        return { pendingApps: 0, pendingVerifications: 0, total: 0 };
    }
};

export const getDashboardStats = async () => {
  try {
    const studentsSnap = await getDocs(collection(db, STUDENTS_COLLECTION));
    const teachersSnap = await getDocs(collection(db, TEACHERS_COLLECTION));
    const applicationsSnap = await getDocs(collection(db, APPLICATIONS_COLLECTION));
    const settings = await getSystemSettings();

    const totalStudents = studentsSnap.size;
    const totalTeachers = teachersSnap.size;
    
    let expectedRevenue = 0;
    
    if (settings && settings.fees) {
      settings.fees.forEach(fee => {
        const amount = parseFloat(fee.amount) || 0;
        let multiplier = 1;
        if (fee.frequency === 'Monthly') multiplier = 12; 
        else if (fee.frequency === 'Termly') multiplier = 3; 
        else if (fee.frequency === 'Once-off') multiplier = 1;
        expectedRevenue += (amount * multiplier * totalStudents);
      });
    }

    const defaulters = studentsSnap.docs.map(doc => {
        const d = doc.data();
        return {
            id: doc.id,
            name: d.name,
            grade: d.grade,
            parentName: d.parentName,
            parentPhone: d.fatherPhone || d.motherPhone || 'N/A'
        };
    });

    const monthCounts = new Array(12).fill(0);
    studentsSnap.forEach(doc => {
      const data = doc.data();
      if (data.enrolledAt) {
        const date = data.enrolledAt.toDate();
        monthCounts[date.getMonth()]++;
      }
    });

    const graphData = [
      { name: 'Jan', students: monthCounts[0] },
      { name: 'Feb', students: monthCounts[1] },
      { name: 'Mar', students: monthCounts[2] },
      { name: 'Apr', students: monthCounts[3] },
      { name: 'May', students: monthCounts[4] },
      { name: 'Jun', students: monthCounts[5] },
      { name: 'Jul', students: monthCounts[6] },
      { name: 'Aug', students: monthCounts[7] },
      { name: 'Sep', students: monthCounts[8] },
      { name: 'Oct', students: monthCounts[9] },
      { name: 'Nov', students: monthCounts[10] },
      { name: 'Dec', students: monthCounts[11] },
    ];

    const recentActivities = applicationsSnap.docs
      .sort((a, b) => b.data().submissionDate - a.data().submissionDate)
      .slice(0, 5)
      .map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          title: 'New Application',
          desc: `${d.firstName} ${d.surname} applied for ${d.grade}`,
          time: d.submissionDate?.toDate().toLocaleDateString()
        };
      });

    return {
      totalStudents,
      totalTeachers,
      totalApps: applicationsSnap.size,
      expectedRevenue,
      collectedRevenue: 0, 
      outstandingRevenue: expectedRevenue,
      defaulters,
      graphData,
      recentActivities
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return null;
  }
};

export const getSystemSettings = async (): Promise<SystemSettings | null> => {
  const docRef = doc(db, SETTINGS_COLLECTION, 'general');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as SystemSettings;
  }
  return null;
};

export const saveSystemSettings = async (settings: Partial<SystemSettings>) => {
  try {
    await setDoc(doc(db, SETTINGS_COLLECTION, 'general'), settings, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving settings:", error);
    return false;
  }
};