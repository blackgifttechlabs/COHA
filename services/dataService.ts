import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, getDoc, query, where, doc, updateDoc, deleteDoc, orderBy, Timestamp, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Teacher, Student, UserRole, Application, SystemSettings } from '../types';

// Collections
const TEACHERS_COLLECTION = 'teachers';
const STUDENTS_COLLECTION = 'students';
const APPLICATIONS_COLLECTION = 'applications';
const SETTINGS_COLLECTION = 'settings';

// Admin Auth Configuration
const ADMIN_EMAIL = "admin@coha.com";
const ADMIN_AUTH_PASSWORD = "111111"; 

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
          { id: '3', category: 'Mainstream Kindergarten', amount: '550', frequency: 'Monthly', notes: '' },
          { id: '4', category: 'Mainstream Pre-Primary', amount: '650', frequency: 'Monthly', notes: '' },
          { id: '5', category: 'Mainstream Grade 1-3', amount: '1300', frequency: 'Monthly', notes: '' },
          { id: '6', category: 'Mainstream Grade 4-7', amount: '1700', frequency: 'Monthly', notes: '' },
          { id: '7', category: 'Registration Fee', amount: '300', frequency: 'Once-off', notes: 'New students only' },
          { id: '8', category: 'Hostel Fees', amount: '1400', frequency: 'Monthly', notes: 'Includes laundry' },
          { id: '9', category: 'Hostel Food', amount: '3500', frequency: 'Termly', notes: '3 meals a day' },
        ],
        uniforms: [
          { id: '1', name: 'White School Shirt with Logo', isRequired: true },
          { id: '2', name: 'Blue School Trousers / Skirt', isRequired: true },
          { id: '3', name: 'Black School Shoes', isRequired: true },
          { id: '4', name: 'Grey Socks', isRequired: true },
          { id: '5', name: 'School Tie', isRequired: false },
          { id: '6', name: 'School Blazer', isRequired: false },
        ],
        stationery: [
          { id: '1', name: 'HB Pencils (Pack of 12)', isRequired: true },
          { id: '2', name: 'Blue Pens', isRequired: true },
          { id: '3', name: 'Eraser & Sharpener', isRequired: true },
          { id: '4', name: '30cm Ruler', isRequired: true },
          { id: '5', name: 'A4 Hardcover Notebooks (x6)', isRequired: true },
          { id: '6', name: 'Coloring Pencils', isRequired: false },
          { id: '7', name: 'Calculator (Scientific)', isRequired: false },
        ]
      });
    }
  } catch (error: any) {
    if (error.code !== 'auth/email-already-in-use') {
      console.error("Error seeding admin user:", error);
    }
  }
};

// Teachers
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

// Students
export const addStudent = async (studentData: Partial<Student>) => {
  try {
    // Generate a display name combining Names
    const displayName = `${studentData.firstName} ${studentData.surname}`;
    const primaryParent = studentData.fatherName || studentData.motherName || 'Unknown Parent';
    
    await addDoc(collection(db, STUDENTS_COLLECTION), {
      ...studentData,
      name: displayName, // Computed field for search consistency
      parentName: primaryParent, // Computed field for list view
      role: UserRole.PARENT,
      enrolledAt: Timestamp.now(), 
      createdAt: new Date()
    });
    return true;
  } catch (error) {
    console.error("Error adding student: ", error);
    return false;
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

export const enrollStudent = async (app: Application): Promise<string | null> => {
  try {
    // Generate a random 4-digit PIN for the parent
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Construct student data from application data
    // We explicitly set fields needed for search/login
    const studentData = {
        ...app, // Spread all application data (medical, history etc)
        name: `${app.firstName} ${app.surname}`, // Display Name for search
        parentName: app.fatherName || app.motherName, // Display Name for parent column
        parentPin: pin,
        role: UserRole.PARENT,
        enrolledAt: Timestamp.now()
    };
    
    // Remove the application ID if it exists in the spread to avoid ID collision logic
    const { id, ...dataToSave } = studentData as any;

    await addDoc(collection(db, STUDENTS_COLLECTION), dataToSave);
    return pin;
  } catch (error) {
    console.error("Error enrolling student:", error);
    return null;
  }
};

export const getStudents = async (): Promise<Student[]> => {
  const q = query(collection(db, STUDENTS_COLLECTION));
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

// Admin Auth
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

// Applications
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

// Dashboard Stats & Finance Logic
export const getDashboardStats = async () => {
  try {
    const studentsSnap = await getDocs(collection(db, STUDENTS_COLLECTION));
    const teachersSnap = await getDocs(collection(db, TEACHERS_COLLECTION));
    const applicationsSnap = await getDocs(collection(db, APPLICATIONS_COLLECTION));
    const settings = await getSystemSettings();

    const totalStudents = studentsSnap.size;
    const totalTeachers = teachersSnap.size;
    
    // Revenue Calculation
    let expectedRevenue = 0;
    
    if (settings && settings.fees) {
      settings.fees.forEach(fee => {
        const amount = parseFloat(fee.amount) || 0;
        let multiplier = 1;
        
        if (fee.frequency === 'Monthly') multiplier = 12; // Annualized
        else if (fee.frequency === 'Termly') multiplier = 3; // 3 Terms
        else if (fee.frequency === 'Once-off') multiplier = 1;
        
        // Assume all students pay basic fees for estimation
        expectedRevenue += (amount * multiplier * totalStudents);
      });
    }

    // "Defaulters" logic: 
    // Since we don't have a payment ledger, we will simulate that 0 revenue has been collected
    // and thus "Outstanding" equals "Expected".
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

    // Calculate Monthly Enrollments for Graph
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

    // Get Recent Activities (Last 5 Applications)
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

// System Settings
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