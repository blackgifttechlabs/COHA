import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { addStudent, getStudents, getSystemSettings } from '../../services/dataService';
import { Student, SystemSettings } from '../../types';
import { Plus, Search, Eye, X, Download } from 'lucide-react';
import { Toast } from '../../components/ui/Toast';
import { printStudentList } from '../../utils/printStudentList';

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [gradesList, setGradesList] = useState<string[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  // Comprehensive Form State
  const initialFormState: Partial<Student> = {
    surname: '', firstName: '', dob: '', citizenship: '', gender: 'Male', 
    address: '', grade: '', isSpecialNeeds: false, specialNeedsType: '',
    fatherName: '', fatherPhone: '', fatherEmail: '',
    motherName: '', motherPhone: '',
    emergencyName: '', emergencyRelationship: '', emergencyWork: '', emergencyCell: '', emergencyEmail: '',
    hasPreviousSchool: true, previousSchool: '', highestGrade: '',
    langEnglish: 'Good', 
    medicalConditions: '', doctorName: '', doctorContact: '',
    hasMedicalAid: false, medicalAidName: '', medicalAidOption: '', medicalAidMemberName: '', medicalAidMemberID: '',
    medicalConsent: true,
    parentPin: '' // Manual PIN assignment
  };
  
  const [formData, setFormData] = useState(initialFormState);

  const fetchStudents = async () => {
    const data = await getStudents();
    setStudents(data);
    const settingsData = await getSystemSettings();
    setSettings(settingsData);
    if (settingsData && settingsData.grades) setGradesList(settingsData.grades);
    else setGradesList(['Grade 1', 'Grade 2']);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await addStudent(formData);
    if (success) {
      setFormData(initialFormState);
      setShowForm(false);
      fetchStudents();
      setToastVisible(true);
    }
    setLoading(false);
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (student.parentName && student.parentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (student.grade && student.grade.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <Toast message="Student enrolled successfully!" isVisible={toastVisible} onClose={() => setToastVisible(false)} variant="success" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-coha-900">Students</h2>
          <p className="text-gray-600">Manage student enrollment.</p>
        </div>
        <div className="flex gap-2">
            {!showForm && (
                <>
                    <Button variant="outline" onClick={() => printStudentList(filteredStudents, settings)}>
                        <Download size={20} /> Download List
                    </Button>
                    <Button onClick={() => setShowForm(true)}>
                        <Plus size={20} /> Enroll New Student
                    </Button>
                </>
            )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-coha-900 text-white p-4 flex justify-between items-center sticky top-0 z-10 shadow-md">
                <h2 className="text-xl font-bold uppercase tracking-wider">Enroll New Student</h2>
                <button onClick={() => setShowForm(false)} className="hover:text-red-300">
                    <X size={24} />
                </button>
            </div>

            <div className="max-w-4xl mx-auto p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Section 1: Learner */}
                    <div className="bg-gray-50 p-6 border-l-4 border-coha-500">
                        <h3 className="text-lg font-bold text-coha-900 mb-4 uppercase">Learner Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input name="surname" label="Surname" value={formData.surname} onChange={handleChange} required />
                            <Input name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} required />
                            <Input name="dob" label="Date of Birth" type="date" value={formData.dob} onChange={handleChange} required />
                            <div>
                                <label className="block text-coha-900 text-sm font-semibold mb-1 uppercase tracking-wider">Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 border-2 border-gray-300 focus:border-coha-500 outline-none bg-white rounded-none">
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-coha-900 text-sm font-semibold mb-1 uppercase tracking-wider">Grade</label>
                                <select name="grade" value={formData.grade} onChange={handleChange} className="w-full p-3 border-2 border-gray-300 focus:border-coha-500 outline-none bg-white rounded-none" required>
                                    <option value="">Select Grade</option>
                                    {gradesList.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                             <Input name="citizenship" label="Citizenship" value={formData.citizenship} onChange={handleChange} />
                             <Input name="address" label="Residential Address" value={formData.address} onChange={handleChange} className="md:col-span-2" />
                             <div className="md:col-span-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="isSpecialNeeds" checked={formData.isSpecialNeeds} onChange={handleChange} className="w-4 h-4" />
                                    <span className="font-bold text-gray-700">Special Needs?</span>
                                </label>
                                {formData.isSpecialNeeds && (
                                    <Input name="specialNeedsType" placeholder="Specify type (e.g. Autism)" value={formData.specialNeedsType} onChange={handleChange} className="mt-2" />
                                )}
                             </div>
                        </div>
                    </div>

                    {/* Section 2: Parents */}
                    <div className="bg-gray-50 p-6 border-l-4 border-coha-500">
                        <h3 className="text-lg font-bold text-coha-900 mb-4 uppercase">Parents / Guardians</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input name="fatherName" label="Father/Guardian Name" value={formData.fatherName} onChange={handleChange} required />
                            <Input name="fatherPhone" label="Father Phone" value={formData.fatherPhone} onChange={handleChange} required />
                            <Input name="fatherEmail" label="Father Email" value={formData.fatherEmail} onChange={handleChange} />
                            
                            <div className="md:col-span-2 border-t pt-2"></div>
                            
                            <Input name="motherName" label="Mother Name" value={formData.motherName} onChange={handleChange} />
                            <Input name="motherPhone" label="Mother Phone" value={formData.motherPhone} onChange={handleChange} />
                        </div>
                    </div>

                     {/* Section 3: Emergency */}
                     <div className="bg-gray-50 p-6 border-l-4 border-red-500">
                        <h3 className="text-lg font-bold text-red-900 mb-4 uppercase">Emergency Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input name="emergencyName" label="Contact Name" value={formData.emergencyName} onChange={handleChange} required />
                            <Input name="emergencyRelationship" label="Relationship" value={formData.emergencyRelationship} onChange={handleChange} required />
                            <Input name="emergencyCell" label="Cell Number" value={formData.emergencyCell} onChange={handleChange} required />
                        </div>
                    </div>

                     {/* Section 4: Access Control */}
                     <div className="bg-coha-900 text-white p-6 shadow-lg">
                        <h3 className="text-lg font-bold text-white mb-4 uppercase">Portal Access</h3>
                        <p className="text-sm text-gray-300 mb-4">Assign a 4-digit PIN for the parent to log in to the portal.</p>
                         <Input 
                            name="parentPin" 
                            label="Assign Parent PIN" 
                            value={formData.parentPin} 
                            onChange={handleChange} 
                            maxLength={4} 
                            placeholder="e.g. 1234"
                            className="text-black"
                            required
                        />
                     </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                        <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Enrolling...' : 'Save & Enroll Student'}</Button>
                    </div>
                </form>
            </div>
        </div>
      )}

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
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Grade</th>
                <th className="px-6 py-4">Parent</th>
                <th className="px-6 py-4">Parent PIN</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-coha-900">{student.name}</td>
                  <td className="px-6 py-4">
                     <span className="bg-coha-100 text-coha-800 px-2 py-1 text-xs font-bold uppercase">{student.grade}</span>
                  </td>
                  <td className="px-6 py-4">{student.parentName}</td>
                  <td className="px-6 py-4 font-mono text-gray-500">{student.parentPin || '****'}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => navigate(`/admin/students/${student.id}`)}
                      className="text-coha-500 hover:text-coha-700 font-bold text-sm flex items-center gap-1"
                    >
                      <Eye size={16} /> View Profile
                    </button>
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