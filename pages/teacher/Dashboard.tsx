import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentsByAssignedClass } from '../../services/dataService';
import { Student } from '../../types';
import { Loader } from '../../components/ui/Loader';
import { Users, BookOpen, Activity, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface TeacherDashboardProps {
  user: any; // The logged-in teacher object
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClassData = async () => {
      if (user?.assignedClass) {
        const data = await getStudentsByAssignedClass(user.assignedClass);
        setStudents(data);
      }
      setLoading(false);
    };
    fetchClassData();
  }, [user]);

  if (loading) return <Loader />;

  if (!user.assignedClass) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="bg-yellow-100 p-4 rounded-full mb-4">
                  <BookOpen size={48} className="text-yellow-600"/>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">No Class Assigned</h2>
              <p className="text-gray-600 mt-2">You have not been assigned a class yet. Please contact the administrator.</p>
          </div>
      );
  }

  // Split students by status
  const assessmentStudents = students.filter(s => s.studentStatus === 'ASSESSMENT');
  const enrolledStudents = students.filter(s => s.studentStatus === 'ENROLLED');

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-coha-900">My Class: {user.assignedClass}</h2>
        <p className="text-gray-600">Manage your students and daily assessments.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="bg-white p-6 shadow-sm border-l-4 border-coha-500">
             <div className="flex justify-between items-center mb-2">
                 <h3 className="font-bold text-gray-700">Total Students</h3>
                 <Users className="text-coha-500" />
             </div>
             <p className="text-3xl font-bold text-coha-900">{students.length}</p>
         </div>
         <div className="bg-white p-6 shadow-sm border-l-4 border-purple-500">
             <div className="flex justify-between items-center mb-2">
                 <h3 className="font-bold text-gray-700">Under Observation</h3>
                 <Activity className="text-purple-500" />
             </div>
             <p className="text-3xl font-bold text-purple-900">{assessmentStudents.length}</p>
         </div>
         <div className="bg-white p-6 shadow-sm border-l-4 border-green-500">
             <div className="flex justify-between items-center mb-2">
                 <h3 className="font-bold text-gray-700">Enrolled</h3>
                 <CheckCircle className="text-green-500" />
             </div>
             <p className="text-3xl font-bold text-green-900">{enrolledStudents.length}</p>
         </div>
      </div>

      {/* Observation List */}
      {assessmentStudents.length > 0 && (
          <div className="bg-white border border-purple-200 shadow-sm mb-8 animate-fade-in">
             <div className="p-4 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
                 <h3 className="text-purple-900 font-bold flex items-center gap-2">
                     <Activity size={20} /> Observation Period (14 Days)
                 </h3>
                 <span className="bg-purple-200 text-purple-800 text-xs font-bold px-2 py-1 rounded-full">{assessmentStudents.length} Pending</span>
             </div>
             <div className="overflow-x-auto">
                 <table className="w-full text-left">
                     <thead className="bg-white text-xs font-bold uppercase text-gray-600">
                         <tr>
                             <th className="px-6 py-4">Student Name</th>
                             <th className="px-6 py-4">Age Level</th>
                             <th className="px-6 py-4">Progress</th>
                             <th className="px-6 py-4 text-right">Action</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                         {assessmentStudents.map(student => {
                             // Calculate rough progress based on completed days
                             const completedDays = student.assessment?.teacherAssessments ? Object.values(student.assessment.teacherAssessments).filter((d:any) => d.completed).length : 0;
                             const progress = (completedDays / 14) * 100;
                             
                             return (
                                 <tr key={student.id} className="hover:bg-purple-50 transition-colors">
                                     <td className="px-6 py-4 font-bold text-gray-900">{student.name}</td>
                                     <td className="px-6 py-4">{student.level}</td>
                                     <td className="px-6 py-4">
                                         <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-xs">
                                             <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                         </div>
                                         <span className="text-xs text-gray-500 mt-1 block">{completedDays} / 14 Days</span>
                                     </td>
                                     <td className="px-6 py-4 text-right">
                                         <Button onClick={() => navigate(`/teacher/assessment/${student.id}`)} className="py-1 px-4 text-sm bg-purple-600 hover:bg-purple-700">
                                             Assess
                                         </Button>
                                     </td>
                                 </tr>
                             );
                         })}
                     </tbody>
                 </table>
             </div>
          </div>
      )}

      {/* Enrolled List */}
      <div className="bg-white border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-gray-800 font-bold flex items-center gap-2">
                  <BookOpen size={20} /> Class Register
              </h3>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                 <thead className="bg-white text-xs font-bold uppercase text-gray-600">
                     <tr>
                         <th className="px-6 py-4">Student Name</th>
                         <th className="px-6 py-4">Status</th>
                         <th className="px-6 py-4">Stage / Grade</th>
                         <th className="px-6 py-4">Parent Contact</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                     {enrolledStudents.map(student => (
                         <tr key={student.id} className="hover:bg-gray-50">
                             <td className="px-6 py-4 font-bold text-gray-900">{student.name}</td>
                             <td className="px-6 py-4">
                                 <span className="bg-green-100 text-green-800 text-xs px-2 py-1 font-bold rounded">Enrolled</span>
                             </td>
                             <td className="px-6 py-4">{student.assignedClass || student.grade}</td>
                             <td className="px-6 py-4 text-sm text-gray-600">{student.fatherPhone || student.motherPhone}</td>
                         </tr>
                     ))}
                     {enrolledStudents.length === 0 && (
                         <tr><td colSpan={4} className="p-8 text-center text-gray-500">No enrolled students in this class yet.</td></tr>
                     )}
                 </tbody>
             </table>
          </div>
      </div>

    </div>
  );
};