
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentById, updateStudent, deleteStudent, getSystemSettings, getReceipts } from '../../services/dataService';
import { Student, SystemSettings, Receipt } from '../../types';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
// Added missing Heart icon to imports from lucide-react
import { ArrowLeft, Printer, Trash2, Edit2, Save, X, Key, UserCheck, Eye, EyeOff, DollarSign, FileText, User, LayoutDashboard, CheckCircle, CreditCard, Heart } from 'lucide-react';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Toast } from '../../components/ui/Toast';
import { printStudentProfile } from '../../utils/printStudentProfile';
import { CustomSelect } from '../../components/ui/CustomSelect';

const calculateAge = (dobString: string): string => {
  if (!dobString) return 'N/A';
  const today = new Date();
  const birthDate = new Date(dobString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return `${age} Years Old`;
};

export const StudentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [allReceipts, setAllReceipts] = useState<Receipt[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'PARENT' | 'FINANCE'>('PERSONAL');
  const [showPin, setShowPin] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Student>>({});
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const data = await getStudentById(id);
        const setts = await getSystemSettings();
        const rects = await getReceipts();
        setStudent(data);
        setSettings(setts);
        setAllReceipts(rects.filter(r => r.usedByStudentId === id));
        if(data) setEditForm(data);
      }
    };
    fetchData();
  }, [id]);

  const financeStats = useMemo(() => {
    if (!settings || !student) return { total: 0, paid: 0, balance: 0 };
    let total = 0;
    settings.fees.forEach(f => {
      const amt = parseFloat(f.amount) || 0;
      let mult = 1;
      if (f.frequency === 'Monthly') mult = 12;
      else if (f.frequency === 'Termly') mult = 3;
      total += (amt * mult);
    });
    const paid = allReceipts.reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0);
    return { total, paid, balance: total - paid };
  }, [settings, student, allReceipts]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        await deleteStudent(student.id);
        navigate('/admin/students');
    }
  };

  if (!student) return <Loader />;

  const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <h3 className="text-xs font-black uppercase text-coha-900 tracking-[0.2em] mb-6 flex items-center gap-2 border-b pb-2 border-gray-100">
      <Icon size={16} /> {title}
    </h3>
  );

  const FormRow = ({ label, name, value, type = 'text', options }: any) => (
    <div className="mb-4">
      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">{label}</p>
      {isEditing ? (
        options ? (
          <CustomSelect value={String((editForm as any)[name] || '')} options={options} onChange={(val) => handleSelectChange(name, val)} className="mb-0" />
        ) : type === 'textarea' ? (
          <textarea name={name} value={String((editForm as any)[name] || '')} onChange={handleEditChange} className="w-full p-2 border-b-2 border-coha-500 outline-none font-bold text-sm bg-gray-50" rows={3} />
        ) : (
          <input type={type} name={name} value={String((editForm as any)[name] || '')} onChange={handleEditChange} className="w-full p-2 border-b-2 border-coha-500 outline-none font-bold text-sm bg-gray-50" />
        )
      ) : (
        <p className="font-bold text-gray-900 border-b border-gray-50 pb-1">{value || '-'}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-20">
        <ConfirmModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDelete} title="Delete Student Profile?" message={`Permanently remove ${student.name} from school records?`} isLoading={loading} />
        <Toast message="Profile Updated Successfully." isVisible={toastVisible} onClose={() => setToastVisible(false)} variant="success" />

        {/* HIGH IMPACT HEADER */}
        <div className="bg-coha-900 text-white shadow-2xl relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 -mr-32 -mt-32 rounded-full"></div>
            <div className="p-8 sm:p-12 relative z-10">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/admin/students')} className="p-3 bg-white/10 hover:bg-white/20 transition-all text-white border border-white/20">
                            <ArrowLeft size={24} />
                        </button>
                        <div className="min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-none">{student.name}</h2>
                                {student.studentStatus === 'ENROLLED' && <CheckCircle size={24} className="text-green-400" />}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-bold text-[11px] uppercase tracking-widest text-coha-300">
                                <span>ID: <span className="text-white font-mono">{student.id}</span></span>
                                <span>{calculateAge(student.dob || '')}</span>
                                <span>Status: <span className="text-coha-400">{student.studentStatus.replace('_', ' ')}</span></span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md p-6 border-l-4 border-coha-400 min-w-[240px]">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-coha-200 mb-2">Class Assignment</p>
                        <p className="text-2xl font-black uppercase tracking-tighter text-white">
                            {student.assignedClass || student.grade || student.level || 'Placement Pending'}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* ACTION BAR */}
        <div className="flex flex-wrap gap-3 mb-8">
            {isEditing ? (
                <>
                    <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700 border-none px-8 py-4 shadow-lg hover:translate-y-[-2px] transition-transform">
                        <Save size={20} /> Save All Changes
                    </Button>
                    <button onClick={() => { setIsEditing(false); setEditForm(student); }} className="px-8 py-4 bg-gray-200 text-gray-700 font-black uppercase text-[10px] tracking-widest hover:bg-gray-300 transition-colors">
                        Cancel
                    </button>
                </>
            ) : (
                <>
                    <Button onClick={() => printStudentProfile(student)} className="bg-coha-500 hover:bg-coha-400 border-none px-8 py-4 shadow-lg hover:translate-y-[-2px] transition-transform">
                        <Printer size={20} /> Print Student Profile
                    </Button>
                    <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 border-none px-8 py-4 shadow-lg hover:translate-y-[-2px] transition-transform">
                        <Edit2 size={20} /> Edit Details
                    </Button>
                    <Button onClick={() => setDeleteModalOpen(true)} className="bg-red-600 hover:bg-red-700 border-none px-8 py-4 shadow-lg hover:translate-y-[-2px] transition-transform">
                        <Trash2 size={20} /> Remove Student
                    </Button>
                </>
            )}
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex border-b-2 border-gray-200 mb-8 overflow-x-auto bg-white shadow-sm">
            <button onClick={() => setActiveTab('PERSONAL')} className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all ${activeTab === 'PERSONAL' ? 'bg-coha-900 text-white shadow-inner' : 'text-gray-400 hover:bg-gray-50 hover:text-coha-900'}`}>
                <User size={18} /> Personal Details
            </button>
            <button onClick={() => setActiveTab('PARENT')} className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all ${activeTab === 'PARENT' ? 'bg-coha-900 text-white shadow-inner' : 'text-gray-400 hover:bg-gray-50 hover:text-coha-900'}`}>
                <Heart size={18} /> Parent Info
            </button>
            <button onClick={() => setActiveTab('FINANCE')} className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all ${activeTab === 'FINANCE' ? 'bg-coha-900 text-white shadow-inner' : 'text-gray-400 hover:bg-gray-50 hover:text-coha-900'}`}>
                <DollarSign size={18} /> Fees & Finance
            </button>
        </div>

        {/* TAB CONTENT */}
        <div className="bg-white p-8 border border-gray-200 shadow-sm animate-fade-in">
            {activeTab === 'PERSONAL' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div>
                        <SectionTitle icon={User} title="Student Basics" />
                        <FormRow label="Full Name" name="name" value={student.name} />
                        <FormRow label="Date of Birth" name="dob" value={student.dob} type="date" />
                        <FormRow label="Gender" name="gender" value={student.gender} options={[{label:'Male',value:'Male'},{label:'Female',value:'Female'}]} />
                        <FormRow label="Citizenship" name="citizenship" value={student.citizenship} />
                    </div>
                    <div>
                        <SectionTitle icon={LayoutDashboard} title="Academic Path" />
                        <FormRow label="Division" name="division" value={student.division} options={[{label:'Mainstream',value:'Mainstream'},{label:'Special Needs',value:'Special Needs'}]} />
                        <FormRow label="Initial Grade" name="grade" value={student.grade} />
                        <FormRow label="Physical Address" name="address" value={student.address} type="textarea" />
                    </div>
                </div>
            )}

            {activeTab === 'PARENT' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div>
                        <SectionTitle icon={User} title="Father / Guardian" />
                        <FormRow label="Name" name="fatherName" value={student.fatherName} />
                        <FormRow label="Phone" name="fatherPhone" value={student.fatherPhone} />
                        <FormRow label="Email" name="fatherEmail" value={student.fatherEmail} />
                    </div>
                    <div>
                        <SectionTitle icon={User} title="Mother / Guardian" />
                        <FormRow label="Name" name="motherName" value={student.motherName} />
                        <FormRow label="Phone" name="motherPhone" value={student.motherPhone} />
                        <FormRow label="Email" name="motherEmail" value={student.motherEmail} />
                    </div>
                    <div className="md:col-span-2 bg-gray-50 p-6 border-l-8 border-coha-500">
                        <SectionTitle icon={Key} title="Parent Portal Access" />
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Login PIN:</span>
                            <div className="bg-white border-2 border-gray-200 p-3 flex items-center gap-3">
                                <span className="font-mono text-3xl font-black text-coha-900">{showPin ? student.parentPin : '****'}</span>
                                <button onClick={() => setShowPin(!showPin)} className="text-coha-500 hover:text-coha-900 transition-colors">
                                    {showPin ? <EyeOff size={24} /> : <Eye size={24} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'FINANCE' && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 border-2 border-gray-200 shadow-sm text-center">
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Expected Yearly Fees</p>
                            <p className="text-3xl font-black text-coha-900 uppercase tracking-tighter">N$ {financeStats.total.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-6 border-2 border-green-200 shadow-sm text-center">
                            <p className="text-[10px] font-black uppercase text-green-600 tracking-widest mb-1">Amount Paid To Date</p>
                            <p className="text-3xl font-black text-green-800 uppercase tracking-tighter">N$ {financeStats.paid.toLocaleString()}</p>
                        </div>
                        <div className={`p-6 border-2 shadow-sm text-center ${financeStats.balance <= 0 ? 'bg-green-900 text-white border-green-900' : 'bg-white border-red-200'}`}>
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${financeStats.balance <= 0 ? 'text-green-300' : 'text-red-500'}`}>
                                {financeStats.balance <= 0 ? 'Paid in Advance' : 'Outstanding Balance'}
                            </p>
                            <p className="text-3xl font-black uppercase tracking-tighter">
                                N$ {Math.abs(financeStats.balance).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div>
                        <SectionTitle icon={CreditCard} title="Verified Payments History" />
                        <div className="bg-white border border-gray-100">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Receipt Number</th>
                                        <th className="px-6 py-4">Amount (N$)</th>
                                        <th className="px-6 py-4">Verification Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {allReceipts.map(r => (
                                        <tr key={r.id}>
                                            <td className="px-6 py-4 font-mono font-bold text-coha-900">{r.number}</td>
                                            <td className="px-6 py-4 font-black text-gray-900">N$ {parseFloat(r.amount).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-xs font-bold text-gray-500">{new Date(r.date).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    {allReceipts.length === 0 && (
                                        <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest italic text-xs">No verified payments found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
