import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { getStudents, getSystemSettings, getStudentsByStatus, assessStudent } from '../../services/dataService';
import { Student, SystemSettings } from '../../types';
import { Plus, Search, Eye, Download, CheckSquare } from 'lucide-react';
import { Toast } from '../../components/ui/Toast';
import { printStudentList } from '../../utils/printStudentList';

export const StudentsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'ENROLLED' | 'ASSESSMENT'>('ENROLLED');
  const [students, setStudents] = useState<Student[]>([]);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({show: false, msg: ''});

  const fetchStudents = async () => {
    setLoading(true);
    let data: Student[] = [];
    if (viewMode === 'ENROLLED') {
         // Get both strictly enrolled and legacy/manual adds (which might not have studentStatus set yet)
         const all = await getStudents();
         data = all.filter(s => s.studentStatus === 'ENROLLED' || !s.studentStatus);
    } else {
         data = await getStudentsByStatus('ASSESSMENT');
    }
    setStudents(data);
    const settingsData = await getSystemSettings();
    setSettings(settingsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, [viewMode]);

  const handleAssess = async (studentId: string) => {
      if(window.confirm('Mark this student as assessed and fully enrolled?')) {
          await assessStudent(studentId);
          fetchStudents();
          setToast({show: true, msg: 'Student enrolled successfully'});
      }
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (student.parentName && student.parentName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <Toast message={toast.msg} isVisible={toast.show} onClose={() => setToast({show:false, msg:''})} variant="success" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-coha-900">Students</h2>
          <p className="text-gray-600">Manage enrollment and student records.</p>
        </div>
        {viewMode === 'ENROLLED' && (
             <Button variant="outline" onClick={() => printStudentList(filteredStudents, settings)}>
                <Download size={20} /> Download List
            </Button>
        )}
      </div>

      <div className="flex border-b border-gray-200 mb-6 bg-white shadow-sm">
         <button onClick={() => setViewMode('ENROLLED')} className={`px-6 py-3 font-bold text-sm uppercase border-b-4 ${viewMode === 'ENROLLED' ? 'border-coha-900 text-coha-900' : 'border-transparent text-gray-500'}`}>Registered Students</button>
         <button onClick={() => setViewMode('ASSESSMENT')} className={`px-6 py-3 font-bold text-sm uppercase border-b-4 ${viewMode === 'ASSESSMENT' ? 'border-coha-900 text-coha-900' : 'border-transparent text-gray-500'}`}>Pending Assessment</button>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200 flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:border-coha-500 outline-none rounded-none"
              placeholder="Search students..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Grade</th>
                <th className="px-6 py-4">Parent</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-xs">{student.id}</td>
                  <td className="px-6 py-4 font-bold text-coha-900">{student.name}</td>
                  <td className="px-6 py-4">
                     <span className="bg-coha-100 text-coha-800 px-2 py-1 text-xs font-bold uppercase">{student.grade}</span>
                  </td>
                  <td className="px-6 py-4">{student.parentName}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                        {viewMode === 'ASSESSMENT' ? (
                            <Button onClick={() => handleAssess(student.id)} className="py-1 px-3 text-xs">
                                <CheckSquare size={14} /> Assess & Register
                            </Button>
                        ) : (
                            <button 
                            onClick={() => navigate(`/admin/students/${student.id}`)}
                            className="text-coha-500 hover:text-coha-700 font-bold text-sm flex items-center gap-1"
                            >
                            <Eye size={16} /> View Profile
                            </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
               {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};