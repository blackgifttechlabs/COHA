import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentById, updateStudent, deleteStudent } from '../../services/dataService';
import { Student } from '../../types';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { ArrowLeft, Printer, Trash2, Edit2, Save, X, Key, UserCheck } from 'lucide-react';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Toast } from '../../components/ui/Toast';
import { printStudentProfile } from '../../utils/printStudentProfile';
import { CustomSelect } from '../../components/ui/CustomSelect';

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
  <div className={`bg-white p-6 shadow-sm border border-gray-200 mb-6 ${className}`}>
    <h3 className="text-lg font-bold text-coha-900 mb-4 border-b pb-2 uppercase tracking-wider">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
      {children}
    </div>
  </div>
);

interface InfoRowProps {
  label: string;
  value: any;
  name: string;
  isEditing: boolean;
  editForm: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange?: (name: string, val: string) => void;
  type?: string;
  options?: { label: string, value: string }[];
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, name, isEditing, editForm, onChange, onSelectChange, type = 'text', options }) => (
  <div>
    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">{label}</p>
    {isEditing ? (
      options && onSelectChange ? (
          <CustomSelect 
            value={(editForm as any)[name] || ''}
            onChange={(val) => onSelectChange(name, val)}
            options={options}
            className="mb-0"
          />
      ) : (
        <input 
            type={type}
            name={name}
            value={(editForm as any)[name] || ''}
            onChange={onChange}
            className="w-full border-b border-gray-300 focus:border-coha-500 outline-none py-2 font-medium bg-gray-50 text-coha-900"
        />
      )
    ) : (
      <p className="text-gray-900 font-bold break-words py-1 border-b border-transparent">{value || '-'}</p>
    )}
  </div>
);

export const StudentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Student>>({});
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const data = await getStudentById(id);
        setStudent(data);
        if(data) setEditForm(data);
      }
    };
    fetchData();
  }, [id]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  
  const handleSelectChange = (name: string, val: string) => {
      setEditForm({ ...editForm, [name]: val });
  };

  const handleSave = async () => {
    if (student?.id) {
        setLoading(true);
        const success = await updateStudent(student.id, editForm);
        if (success) {
            setStudent({ ...student, ...editForm } as Student);
            setIsEditing(false);
            setToastVisible(true);
        }
        setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (student?.id) {
        setLoading(true);
        const success = await deleteStudent(student.id);
        if (success) { navigate('/admin/students'); }
        setLoading(false);
    }
  };

  if (!student) return <Loader />;

  const renderRow = (label: string, name: string, value: any, type: string = 'text', options?: { label: string, value: string }[]) => (
    <InfoRow 
      key={name}
      label={label} 
      name={name} 
      value={value} 
      isEditing={isEditing} 
      editForm={editForm} 
      onChange={handleEditChange} 
      onSelectChange={handleSelectChange}
      type={type}
      options={options}
    />
  );

  return (
    <div className="w-full px-4 sm:px-6 pb-20">
        <ConfirmModal 
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleDelete}
            title="Delete Student?"
            message={`Are you sure you want to permanently delete ${student.name}? This action cannot be undone.`}
            isLoading={loading}
        />
        <Toast message="Student profile updated." isVisible={toastVisible} onClose={() => setToastVisible(false)} variant="success" />

        {/* REDESIGNED PROFILE HEADER */}
        <div className="bg-white border-2 border-coha-900 shadow-xl mb-10 overflow-hidden">
            <div className="p-6 sm:p-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-8">
                
                {/* Left Side: Name & ID */}
                <div className="flex items-center gap-5">
                    <button onClick={() => navigate('/admin/students')} className="bg-white p-3 border-2 border-gray-100 hover:bg-gray-50 transition-all text-coha-900">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-3 mb-1">
                            <h2 className="text-2xl sm:text-3xl font-black text-coha-900 uppercase tracking-tighter leading-none truncate">{student.name}</h2>
                            <span className={`px-2 py-0.5 text-[10px] font-black uppercase border ${student.studentStatus === 'ENROLLED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                {student.studentStatus}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-widest">
                            <span className="opacity-40">System ID:</span>
                            <span className="text-coha-500">{student.id}</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Actions */}
                <div className="flex flex-wrap sm:flex-nowrap gap-2 items-stretch">
                    {isEditing ? (
                        <>
                            <button 
                                onClick={() => { setIsEditing(false); setEditForm(student); }}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 text-gray-600 font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all"
                            >
                                <X size={18} /> Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={loading}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-coha-900 text-white font-black uppercase text-[10px] tracking-widest shadow-lg hover:translate-y-[-2px] transition-all"
                            >
                                <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                onClick={() => printStudentProfile(student)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-4 border-2 border-gray-100 text-coha-900 font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-all"
                            >
                                <Printer size={18} /> Print
                            </button>
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-4 border-2 border-coha-900 text-coha-900 font-black uppercase text-[10px] tracking-widest hover:bg-coha-900 hover:text-white transition-all"
                            >
                                <Edit2 size={18} /> Edit Profile
                            </button>
                            <button 
                                onClick={() => setDeleteModalOpen(true)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-4 border-2 border-red-100 text-red-600 font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all"
                            >
                                <Trash2 size={18} /> Delete
                            </button>
                        </>
                    )}
                </div>
            </div>
            
            {/* Quick Stats Strip */}
            <div className="bg-gray-50 border-t-2 border-gray-100 px-8 py-4 flex flex-wrap gap-x-12 gap-y-4">
                <div className="flex items-center gap-3">
                    <UserCheck className="text-coha-500" size={18} />
                    <div>
                        <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Division</span>
                        <span className="font-bold text-sm text-gray-800">{student.division || 'Mainstream'}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Key className="text-coha-500" size={18} />
                    <div>
                        <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Parent Login PIN</span>
                        <span className="font-mono font-black text-lg text-coha-900">{student.parentPin}</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-2">
                <Section title="Demographics">
                    {renderRow("Full Legal Name", "name", student.name)}
                    {renderRow("Academic Grade", "grade", student.grade)}
                    {renderRow("Date of Birth", "dob", student.dob, "date")}
                    {renderRow("Gender", "gender", student.gender, "text", [{label:'Male',value:'Male'}, {label:'Female',value:'Female'}])}
                    {renderRow("Nationality", "citizenship", student.citizenship)}
                    {renderRow("Physical Address", "address", student.address)}
                </Section>
                 <Section title="Academic Background">
                    {renderRow("Previous Institution", "previousSchool", student.previousSchool)}
                    {renderRow("Last Grade Passed", "highestGrade", student.highestGrade)}
                    {renderRow("Primary Language", "langEnglish", student.langEnglish, "text", [{label:'Good',value:'Good'}, {label:'Fair',value:'Fair'}, {label:'Poor',value:'Poor'}])}
                </Section>
            </div>
             
             <div className="lg:col-span-1">
                <div className="bg-coha-900 text-white p-10 shadow-2xl relative overflow-hidden">
                    {/* Background Design Element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -mr-16 -mt-16 rotate-45"></div>
                    
                    <div className="relative z-10">
                        <div className="w-24 h-24 bg-white text-coha-900 rounded-none flex items-center justify-center mx-auto mb-6 font-black text-4xl shadow-xl">
                            {student.name.charAt(0)}
                        </div>
                        <h3 className="text-2xl font-black text-center mb-1 uppercase tracking-tighter">{student.name}</h3>
                        <p className="text-center text-coha-300 font-black uppercase text-[10px] tracking-[0.3em] mb-10">{student.grade || 'Learner'}</p>
                        
                        <div className="space-y-4">
                            <div className="bg-white/10 p-5 border-l-4 border-coha-400">
                                <p className="text-[9px] text-coha-200 uppercase font-black tracking-widest mb-1">Enrolled Date</p>
                                <p className="text-sm font-bold">{student.enrolledAt?.toDate ? student.enrolledAt.toDate().toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div className="bg-white/10 p-5 border-l-4 border-coha-400">
                                <p className="text-[9px] text-coha-200 uppercase font-black tracking-widest mb-1">Parent Category</p>
                                <p className="text-sm font-bold">{student.parentName}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};