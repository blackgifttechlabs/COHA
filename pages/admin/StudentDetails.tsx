import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentById, updateStudent, deleteStudent } from '../../services/dataService';
import { Student } from '../../types';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { ArrowLeft, Printer, Trash2, Edit2, Save, X } from 'lucide-react';
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

// Expanded Interface for Row
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
    <p className="text-xs text-gray-500 uppercase font-bold">{label}</p>
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
            className="w-full border-b border-gray-300 focus:border-coha-500 outline-none py-1 font-medium bg-gray-50 text-coha-900"
        />
      )
    ) : (
      <p className="text-gray-900 font-medium break-words py-1 border-b border-transparent">{value || '-'}</p>
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
    <div className="w-full px-5 pb-10">
        <ConfirmModal 
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleDelete}
            title="Delete Student?"
            message={`Are you sure you want to permanently delete ${student.name}? This action cannot be undone.`}
            isLoading={loading}
        />
        <Toast message="Student profile updated." isVisible={toastVisible} onClose={() => setToastVisible(false)} variant="success" />

        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/students')} className="bg-white p-2 border hover:bg-gray-50">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-coha-900">{student.name}</h2>
                    <p className="text-gray-600">ID: {student.id}</p>
                </div>
            </div>
            <div className="flex gap-2">
                {isEditing ? (
                    <>
                        <Button variant="outline" onClick={() => { setIsEditing(false); setEditForm(student); }}>
                            <X size={18} /> Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={loading}>
                            <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </>
                ) : (
                    <>
                         <Button variant="outline" onClick={() => printStudentProfile(student)}>
                            <Printer size={18} /> Print
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                            <Edit2 size={18} /> Edit Profile
                        </Button>
                        <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
                            <Trash2 size={18} /> Delete
                        </Button>
                    </>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Section title="Learner Profile">
                    {renderRow("Full Name", "name", student.name)}
                    {renderRow("Grade", "grade", student.grade)}
                    {renderRow("Date of Birth", "dob", student.dob, "date")}
                    {renderRow("Gender", "gender", student.gender, "text", [{label:'Male',value:'Male'}, {label:'Female',value:'Female'}])}
                    {renderRow("Citizenship", "citizenship", student.citizenship)}
                    {renderRow("Address", "address", student.address)}
                </Section>
                {/* ... other sections mostly text inputs, except english proficiency ... */}
                 <Section title="Education & Languages">
                    {renderRow("Previous School", "previousSchool", student.previousSchool)}
                    {renderRow("Highest Grade", "highestGrade", student.highestGrade)}
                    {renderRow("English Proficiency", "langEnglish", student.langEnglish, "text", [{label:'Good',value:'Good'}, {label:'Fair',value:'Fair'}, {label:'Poor',value:'Poor'}])}
                </Section>
                {/* ... remaining sections ... */}
            </div>
             <div className="lg:col-span-1">
                <div className="bg-coha-900 text-white p-6 shadow-lg mb-6">
                    <div className="w-20 h-20 bg-white text-coha-900 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-3xl">
                        {student.name.charAt(0)}
                    </div>
                    <h3 className="text-xl font-bold text-center mb-1">{student.name}</h3>
                    <p className="text-center text-coha-300 font-bold mb-6">{student.grade}</p>
                    <div className="bg-coha-800 p-4 mb-4">
                        <p className="text-xs text-coha-300 uppercase font-bold mb-1">Parent Login PIN</p>
                        <p className="text-2xl font-mono font-bold tracking-widest">{student.parentPin}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};