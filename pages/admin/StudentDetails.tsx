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

// Move components outside to maintain focus stability
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
  type?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, name, isEditing, editForm, onChange, type = 'text' }) => (
  <div>
    <p className="text-xs text-gray-500 uppercase font-bold">{label}</p>
    {isEditing ? (
      <input 
          type={type}
          name={name}
          value={(editForm as any)[name] || ''}
          onChange={onChange}
          className="w-full border-b border-gray-300 focus:border-coha-500 outline-none py-1 font-medium bg-gray-50 text-coha-900"
      />
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
  
  // Delete State
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
        if (success) {
            navigate('/admin/students');
        }
        setLoading(false);
    }
  };

  if (!student) return <Loader />;

  // Helper to render InfoRow with common props
  const renderRow = (label: string, name: string, value: any, type: string = 'text') => (
    <InfoRow 
      key={name}
      label={label} 
      name={name} 
      value={value} 
      isEditing={isEditing} 
      editForm={editForm} 
      onChange={handleEditChange} 
      type={type}
    />
  );

  return (
    <div className="w-full px-5 pb-10">
        <ConfirmModal 
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleDelete}
            title="Delete Student?"
            message={`Are you sure you want to permanently delete ${student.name} and all their records? This action cannot be undone.`}
            isLoading={loading}
        />

        <Toast message="Student profile updated successfully." isVisible={toastVisible} onClose={() => setToastVisible(false)} variant="success" />

        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/students')} className="bg-white p-2 border hover:bg-gray-50">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-coha-900">{student.name}</h2>
                    <p className="text-gray-600">Student ID: {student.id}</p>
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
                    {renderRow("Gender", "gender", student.gender)}
                    {renderRow("Citizenship", "citizenship", student.citizenship)}
                    {renderRow("Address", "address", student.address)}
                    {renderRow("Special Needs", "specialNeedsType", student.isSpecialNeeds ? `Yes - ${student.specialNeedsType}` : 'No')}
                </Section>

                <Section title="Parent / Guardian Info">
                    {renderRow("Father Name", "fatherName", student.fatherName)}
                    {renderRow("Father Phone", "fatherPhone", student.fatherPhone)}
                    {renderRow("Father Email", "fatherEmail", student.fatherEmail)}
                    <div className="md:col-span-2 border-t pt-2 mt-2"></div>
                    {renderRow("Mother Name", "motherName", student.motherName)}
                    {renderRow("Mother Phone", "motherPhone", student.motherPhone)}
                </Section>

                <Section title="Emergency Contact" className="border-l-4 border-red-500">
                    {renderRow("Contact Name", "emergencyName", student.emergencyName)}
                    {renderRow("Relationship", "emergencyRelationship", student.emergencyRelationship)}
                    {renderRow("Cell Number", "emergencyCell", student.emergencyCell)}
                    {renderRow("Work Contact", "emergencyWork", student.emergencyWork)}
                    {renderRow("Email", "emergencyEmail", student.emergencyEmail)}
                </Section>

                <Section title="Education & Languages">
                    {renderRow("Previous School", "previousSchool", student.hasPreviousSchool ? student.previousSchool : 'None')}
                    {renderRow("Highest Grade", "highestGrade", student.hasPreviousSchool ? student.highestGrade : 'N/A')}
                    <div className="md:col-span-2 mt-2">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-2">Language Proficiency</p>
                        <div className="bg-gray-50 p-2 text-sm">
                            <div className="grid grid-cols-2 border-b border-gray-200 pb-1">
                                <span>English</span> <span className="font-bold">{student.langEnglish}</span>
                            </div>
                            {student.langOther1Name && (
                                <div className="grid grid-cols-2 border-b border-gray-200 py-1">
                                    <span>{student.langOther1Name}</span> <span className="font-bold">{student.langOther1Rating}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </Section>

                <Section title="Medical Information">
                     <div className="md:col-span-2">
                        {renderRow("Known Conditions / Allergies", "medicalConditions", student.medicalConditions)}
                    </div>
                    
                    <div className="md:col-span-2 border-t my-2 pt-2">
                        <h4 className="font-bold text-gray-700 text-sm mb-2">Professionals</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderRow("Doctor Name", "doctorName", student.doctorName)}
                            {renderRow("Doctor Contact", "doctorContact", student.doctorContact)}
                        </div>
                    </div>

                    <div className="md:col-span-2 border-t my-2 pt-2">
                         <h4 className="font-bold text-gray-700 text-sm mb-2">Medical Aid</h4>
                         {student.hasMedicalAid ? (
                            <div className="grid grid-cols-2 gap-4">
                                {renderRow("Fund Name", "medicalAidName", student.medicalAidName)}
                                {renderRow("Option", "medicalAidOption", student.medicalAidOption)}
                                {renderRow("Member Name", "medicalAidMemberName", student.medicalAidMemberName)}
                                {renderRow("Member ID", "medicalAidMemberID", student.medicalAidMemberID)}
                            </div>
                         ) : (
                             <p className="text-gray-500 text-sm italic">No Medical Aid</p>
                         )}
                    </div>
                </Section>
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
                        {isEditing ? (
                             <input 
                                name="parentPin"
                                value={editForm.parentPin || ''}
                                onChange={handleEditChange}
                                className="w-full bg-coha-700 border-none text-white font-mono font-bold tracking-widest p-1"
                            />
                        ) : (
                            <p className="text-2xl font-mono font-bold tracking-widest">{student.parentPin}</p>
                        )}
                    </div>

                    <div className="space-y-3">
                         <div className="flex items-center gap-3">
                             <div className={`w-3 h-3 rounded-full ${student.medicalConsent ? 'bg-green-400' : 'bg-red-500'}`}></div>
                             <span className="text-sm">Medical Consent: {student.medicalConsent ? 'Yes' : 'No'}</span>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};