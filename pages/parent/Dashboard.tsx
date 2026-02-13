import React, { useEffect, useState } from 'react';
import { getStudentById, getSystemSettings, getTeacherByClass, getReceipts } from '../../services/dataService';
import { Student, Teacher, SystemSettings } from '../../types';
import { Loader } from '../../components/ui/Loader';
import { User, BookOpen, Calendar, DollarSign, CheckCircle, Clock } from 'lucide-react';

interface ParentDashboardProps {
  user: any;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ user }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [financials, setFinancials] = useState({ totalFees: 0, paid: 0, balance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        const stud = await getStudentById(user.id);
        const setts = await getSystemSettings();
        setStudent(stud);
        setSettings(setts);

        if (stud) {
           // Fetch Teacher if class assigned
           if (stud.assignedClass) {
               const t = await getTeacherByClass(stud.assignedClass);
               setTeacher(t);
           }

           // Calculate Fees (Simplified Logic)
           // In a real app, this would be more complex based on months enrolled
           if (setts && setts.fees) {
               let monthlyFee = 0;
               // Determine fee based on division or grade
               const feeItem = setts.fees.find(f => f.category.includes('Tuition'));
               if (feeItem) monthlyFee = parseFloat(feeItem.amount) || 0;

               // Calculate paid from Receipts
               // We only have the initial receipt in student record for now, 
               // ideally we'd query receipts collection by usedByStudentId.
               // For this demo, let's assume the initial receipt + dummy calculation
               // Fetch all receipts to check total paid
               const allReceipts = await getReceipts();
               const studentReceipts = allReceipts.filter(r => r.usedByStudentId === stud.id);
               
               const totalPaid = studentReceipts.reduce((acc, r) => acc + parseFloat(r.amount), 0);
               
               // Assume 12 months for year
               const totalYearly = monthlyFee * 12;
               
               setFinancials({
                   totalFees: totalYearly,
                   paid: totalPaid,
                   balance: totalYearly - totalPaid
               });
           }
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) return <Loader />;
  if (!student) return <div className="p-8">Student not found.</div>;

  const isEnrolled = student.studentStatus === 'ENROLLED';
  const isAssessment = student.studentStatus === 'ASSESSMENT';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header / Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 shadow-sm border-l-8 border-coha-900">
        <div>
           <h2 className="text-2xl font-bold text-gray-900">Welcome, {student.parentName}</h2>
           <p className="text-gray-600">Parent Dashboard for <span className="font-bold text-coha-900">{student.name}</span></p>
        </div>
        <div className="flex items-center gap-2">
            <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase flex items-center gap-2 border
                ${isEnrolled ? 'bg-green-100 text-green-700 border-green-200' : 'bg-purple-100 text-purple-700 border-purple-200'}
            `}>
                {isEnrolled ? <CheckCircle size={18}/> : <Clock size={18}/>}
                {student.studentStatus}
            </span>
        </div>
      </div>

      {/* Notification for Completed Assessment */}
      {isEnrolled && student.assessment?.isComplete && (
          <div className="bg-green-50 border border-green-200 p-6 rounded-lg flex items-start gap-4 animate-fade-in">
              <div className="bg-green-100 p-3 rounded-full text-green-600 shrink-0">
                  <CheckCircle size={24} />
              </div>
              <div>
                  <h3 className="text-lg font-bold text-green-800">Assessment Complete!</h3>
                  <p className="text-green-700 mb-2">
                      Great news! The 14-day observation period has been successfully completed. 
                      Based on the assessment results, your child has been placed in:
                  </p>
                  <div className="text-2xl font-bold text-coha-900 bg-white inline-block px-4 py-2 border border-green-200 rounded shadow-sm">
                      {student.assignedClass}
                  </div>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Class Info */}
          <div className="bg-white p-6 shadow-sm border-t-4 border-coha-500">
             <div className="flex items-center gap-3 mb-4 text-gray-700 border-b pb-2">
                 <BookOpen className="text-coha-500" size={20} />
                 <h3 className="font-bold">Class Details</h3>
             </div>
             <div className="space-y-3">
                 <div>
                     <p className="text-xs text-gray-500 uppercase font-bold">Assigned Class</p>
                     <p className="text-xl font-bold text-gray-900">{student.assignedClass || 'Pending Placement'}</p>
                 </div>
                 <div>
                     <p className="text-xs text-gray-500 uppercase font-bold">Division</p>
                     <p className="text-gray-900">{student.division}</p>
                 </div>
                 <div>
                     <p className="text-xs text-gray-500 uppercase font-bold">Term</p>
                     <p className="text-gray-900">Term 1, 2026</p>
                 </div>
             </div>
          </div>

          {/* Card 2: Teacher Info */}
          <div className="bg-white p-6 shadow-sm border-t-4 border-purple-500">
             <div className="flex items-center gap-3 mb-4 text-gray-700 border-b pb-2">
                 <User className="text-purple-500" size={20} />
                 <h3 className="font-bold">Class Teacher</h3>
             </div>
             {teacher ? (
                 <div className="space-y-3">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Name</p>
                        <p className="text-xl font-bold text-gray-900">{teacher.name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Email</p>
                        <p className="text-gray-900">{teacher.email || 'Not available'}</p>
                    </div>
                    <button className="text-sm text-purple-600 font-bold hover:underline mt-2">Send Message</button>
                 </div>
             ) : (
                 <p className="text-gray-500 italic">No teacher assigned yet.</p>
             )}
          </div>

          {/* Card 3: Financials */}
          <div className="bg-white p-6 shadow-sm border-t-4 border-green-500">
             <div className="flex items-center gap-3 mb-4 text-gray-700 border-b pb-2">
                 <DollarSign className="text-green-500" size={20} />
                 <h3 className="font-bold">Fee Status</h3>
             </div>
             <div className="space-y-4">
                 <div className="flex justify-between items-center">
                     <span className="text-gray-600">Total Fees (Year)</span>
                     <span className="font-bold text-gray-900">N$ {financials.totalFees.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-green-700">
                     <span className="font-bold">Total Paid</span>
                     <span className="font-bold">N$ {financials.paid.toLocaleString()}</span>
                 </div>
                 <div className="border-t pt-2 flex justify-between items-center">
                     <span className="text-red-600 font-bold uppercase text-sm">Balance Due</span>
                     <span className="font-bold text-xl text-red-600">N$ {financials.balance.toLocaleString()}</span>
                 </div>
                 <button className="w-full py-2 bg-coha-900 text-white text-sm font-bold hover:bg-coha-800 transition-colors">
                     View Receipts
                 </button>
             </div>
          </div>
      </div>

    </div>
  );
};