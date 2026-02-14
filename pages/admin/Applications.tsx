import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApplications, getStudentsByStatus, verifyPayment, rejectPayment, getReceipts, addReceipt, deleteReceipt, deleteStudent, getPendingActionCounts } from '../../services/dataService';
import { Application, Student, Receipt } from '../../types';
import { Eye, Clock, Search, Filter, Check, X, Plus, Trash2, Key, Mail } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Toast } from '../../components/ui/Toast';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

type ViewMode = 'APPLICATIONS' | 'PENDING_PAYMENT' | 'VERIFICATION' | 'RECEIPTS';

export const ApplicationsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('APPLICATIONS');
  const [applications, setApplications] = useState<Application[]>([]);
  const [pendingPaymentList, setPendingPaymentList] = useState<Student[]>([]);
  const [verificationList, setVerificationList] = useState<Student[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'REJECTED'>('PENDING');
  const navigate = useNavigate();
  
  // Counts for Badges
  const [counts, setCounts] = useState({ pendingApps: 0, pendingVerifications: 0, total: 0 });

  // Receipts State
  const [newReceiptNumber, setNewReceiptNumber] = useState('');
  const [newReceiptAmount, setNewReceiptAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: '', show: false, type: 'success' as 'success' | 'error' });

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Email/Verify Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{success: boolean, student: Student | null, message: string}>({success: false, student: null, message: ''});

  useEffect(() => {
    loadData();
    getPendingActionCounts().then(setCounts);
  }, [viewMode]);

  const loadData = async () => {
    if (viewMode === 'APPLICATIONS') {
        const data = await getApplications();
        // Only show Pending and Rejected here. Approved are in Pending Payment.
        setApplications(data);
    } else if (viewMode === 'PENDING_PAYMENT') {
        const data = await getStudentsByStatus('WAITING_PAYMENT');
        setPendingPaymentList(data);
    } else if (viewMode === 'VERIFICATION') {
        const data = await getStudentsByStatus('PAYMENT_VERIFICATION');
        setVerificationList(data);
    } else if (viewMode === 'RECEIPTS') {
        const data = await getReceipts();
        setReceipts(data);
    }
  };

  const handleVerifyClick = async (student: Student) => {
    if (!student.receiptNumber) return;
    setLoading(true);
    // Check validity ONLY
    const result = await verifyPayment(student.id, student.receiptNumber);
    setLoading(false);
    
    // Open Modal to decide on Email
    setVerifyResult({
        success: result.success,
        student: student,
        message: result.success ? 'Payment Verified Successfully.' : 'Invalid Receipt Number.'
    });
    setEmailModalOpen(true);
  };

  const finalizeVerification = async (sendEmail: boolean) => {
     if (!verifyResult.student) return;
     const student = verifyResult.student;
     
     if (verifyResult.success) {
         // Success Logic handled by verifyPayment in dataService (it updates status)
         // We just need to handle email if requested
         if (sendEmail) {
             const subject = "Enrollment Update: Payment Verified";
             const body = `Dear ${student.parentName},\n\nWe have successfully verified your payment receipt (${student.receiptNumber}).\n\nThe student ${student.name} is now queued for assessment.\n\nRegards,\nCircle of Hope Academy`;
             window.location.href = `mailto:${student.fatherEmail || student.motherEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
         }
         setToast({ msg: 'Student moved to Assessment.', show: true, type: 'success' });
     } else {
         // Failure Logic: Must mark as rejected
         await rejectPayment(student.id);
         if (sendEmail) {
             const subject = "Enrollment Update: Payment Verification Failed";
             const body = `Dear ${student.parentName},\n\nThe receipt number (${student.receiptNumber}) provided for ${student.name} could not be verified.\n\nPlease check the number and try again on the parent portal.\n\nRegards,\nCircle of Hope Academy`;
             window.location.href = `mailto:${student.fatherEmail || student.motherEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
         }
         setToast({ msg: 'Payment Rejected. Parent notified on dashboard.', show: true, type: 'error' });
     }
     
     setEmailModalOpen(false);
     loadData();
     getPendingActionCounts().then(setCounts);
  };

  const confirmDelete = (student: Student) => {
      setStudentToDelete(student);
      setDeleteModalOpen(true);
  };

  const handleDeleteStudent = async () => {
      if (studentToDelete) {
          await deleteStudent(studentToDelete.id);
          setDeleteModalOpen(false);
          setStudentToDelete(null);
          loadData();
          setToast({ msg: 'Record deleted successfully', show: true, type: 'success' });
      }
  };

  const handleAddReceipt = async () => {
      if (!newReceiptNumber || !newReceiptAmount) return;
      setLoading(true);
      const success = await addReceipt(newReceiptNumber, newReceiptAmount, new Date().toISOString());
      if (success) {
          setNewReceiptNumber('');
          setNewReceiptAmount('');
          loadData();
          setToast({ msg: 'Receipt added successfully', show: true, type: 'success' });
      }
      setLoading(false);
  };

  const handleDeleteReceipt = async (id: string) => {
      if(window.confirm('Delete this receipt?')) {
          await deleteReceipt(id);
          loadData();
      }
  };

  const filteredApps = applications.filter(app => {
      const matchesSearch = (() => {
        const fullName = `${app.firstName} ${app.surname}`.toLowerCase();
        const parent = (app.fatherName || app.motherName || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        return fullName.includes(term) || parent.includes(term) || (app.grade || '').toLowerCase().includes(term);
      })();
      return matchesSearch && app.status === statusFilter;
  });

  return (
    <div>
      <Toast message={toast.msg} isVisible={toast.show} onClose={() => setToast({...toast, show: false})} variant={toast.type} />
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteStudent}
        title="Delete Record?"
        message={`Are you sure you want to delete ${studentToDelete?.name}? This will permanently remove them from the admission process.`}
      />

      {/* Email / Finalize Modal */}
      {emailModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className={`bg-white w-full max-w-md shadow-2xl border-t-8 ${verifyResult.success ? 'border-green-500' : 'border-red-500'} animate-fade-in`}>
                <div className="p-6">
                    <h3 className={`text-xl font-bold mb-2 ${verifyResult.success ? 'text-green-700' : 'text-red-700'}`}>
                        {verifyResult.success ? 'Verification Successful' : 'Verification Failed'}
                    </h3>
                    <p className="text-gray-600 mb-6">{verifyResult.message} Would you like to send an email notification to the parent?</p>
                    <div className="flex flex-col gap-3">
                        <Button fullWidth onClick={() => finalizeVerification(true)}>
                            <Mail size={18} /> Update & Send Email
                        </Button>
                        <Button fullWidth variant="outline" onClick={() => finalizeVerification(false)}>
                            Update Only (Skip Email)
                        </Button>
                        <button onClick={() => setEmailModalOpen(false)} className="text-sm text-gray-500 hover:text-gray-900 mt-2">Cancel</button>
                    </div>
                </div>
            </div>
          </div>
      )}

      <div className="mb-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-coha-900">Admissions Management</h2>
            <p className="text-gray-600">Manage applications, verify payments, and issue receipts.</p>
        </div>
        <div className="flex flex-wrap bg-white shadow-sm border border-gray-200">
            <button 
                onClick={() => setViewMode('APPLICATIONS')} 
                className={`px-4 py-2 text-sm font-bold uppercase flex items-center gap-2 ${viewMode === 'APPLICATIONS' ? 'bg-coha-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                Applications
                {counts.pendingApps > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{counts.pendingApps}</span>}
            </button>
            <button 
                onClick={() => setViewMode('PENDING_PAYMENT')} 
                className={`px-4 py-2 text-sm font-bold uppercase flex items-center gap-2 ${viewMode === 'PENDING_PAYMENT' ? 'bg-coha-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                Pending Payment
            </button>
            <button 
                onClick={() => setViewMode('VERIFICATION')} 
                className={`px-4 py-2 text-sm font-bold uppercase flex items-center gap-2 ${viewMode === 'VERIFICATION' ? 'bg-coha-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                Payment Verification
                {counts.pendingVerifications > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{counts.pendingVerifications}</span>}
            </button>
            <button onClick={() => setViewMode('RECEIPTS')} className={`px-4 py-2 text-sm font-bold uppercase ${viewMode === 'RECEIPTS' ? 'bg-coha-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Available Receipts</button>
        </div>
      </div>

      {/* MODE: APPLICATIONS (New / Rejected) */}
      {viewMode === 'APPLICATIONS' && (
          <div className="animate-fade-in">
             <div className="flex border-b border-gray-200 mb-6 bg-white shadow-sm overflow-x-auto">
                <button onClick={() => setStatusFilter('PENDING')} className={`px-6 py-3 font-bold text-sm uppercase border-b-4 flex items-center gap-2 ${statusFilter === 'PENDING' ? 'border-coha-900 text-coha-900' : 'border-transparent text-gray-500'}`}>
                    Pending
                    {counts.pendingApps > 0 && <span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded-full">{counts.pendingApps}</span>}
                </button>
                <button onClick={() => setStatusFilter('REJECTED')} className={`px-6 py-3 font-bold text-sm uppercase border-b-4 ${statusFilter === 'REJECTED' ? 'border-coha-900 text-coha-900' : 'border-transparent text-gray-500'}`}>Rejected</button>
             </div>
             
             <div className="bg-white border border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-200">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input className="w-full pl-10 pr-4 py-2 border border-gray-300 outline-none" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-600">
                            <tr>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Grade</th>
                                <th className="px-6 py-4">Parent</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredApps.map((app) => (
                                <tr key={app.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-bold border ${app.status === 'REJECTED' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>{app.status}</span></td>
                                    <td className="px-6 py-4 font-bold text-coha-900">{app.surname}, {app.firstName}</td>
                                    <td className="px-6 py-4">{app.grade}</td>
                                    <td className="px-6 py-4">{app.fatherName || app.motherName}</td>
                                    <td className="px-6 py-4 text-xs">{app.submissionDate?.toDate().toLocaleDateString()}</td>
                                    <td className="px-6 py-4"><button onClick={() => navigate(`/admin/applications/${app.id}`)} className="text-coha-500 font-bold text-sm flex gap-1 items-center"><Eye size={16}/> View</button></td>
                                </tr>
                            ))}
                            {filteredApps.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-500">No applications found.</td></tr>}
                        </tbody>
                    </table>
                </div>
             </div>
          </div>
      )}

      {/* MODE: PENDING PAYMENT (Waiting Payment) */}
      {viewMode === 'PENDING_PAYMENT' && (
          <div className="animate-fade-in bg-white border border-gray-200 shadow-sm">
             <div className="p-4 border-b border-gray-200 bg-blue-50">
                 <h3 className="text-blue-800 font-bold flex items-center gap-2"><Clock size={20}/> Conditional Admissions</h3>
                 <p className="text-blue-700 text-sm">Students approved but waiting for parents to submit payment receipt.</p>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-600">
                        <tr>
                            <th className="px-6 py-4">Student</th>
                            <th className="px-6 py-4">Parent</th>
                            <th className="px-6 py-4">Login Details</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {pendingPaymentList.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-coha-900">{student.name}</p>
                                    <p className="text-xs text-gray-500">Grade: {student.grade}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p>{student.parentName}</p>
                                    <p className="text-xs text-gray-500">{student.fatherPhone || student.motherPhone}</p>
                                </td>
                                <td className="px-6 py-4 bg-gray-50">
                                    <div className="flex items-center gap-2 text-xs">
                                        <Key size={14} className="text-gray-400" />
                                        <span className="text-gray-500">PIN:</span> 
                                        <span className="font-mono font-bold text-coha-700 text-lg">{student.parentPin}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                     {student.paymentRejected ? (
                                        <span className="bg-red-100 text-red-800 border border-red-200 px-2 py-1 text-xs font-bold uppercase">Rejected - Retrying</span>
                                     ) : (
                                        <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-1 text-xs font-bold uppercase">Waiting Entry</span>
                                     )}
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => confirmDelete(student)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {pendingPaymentList.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-500">No students waiting for payment.</td></tr>}
                    </tbody>
                </table>
             </div>
          </div>
      )}

      {/* MODE: VERIFICATION */}
      {viewMode === 'VERIFICATION' && (
          <div className="animate-fade-in bg-white border border-gray-200 shadow-sm">
             <div className="p-4 border-b border-gray-200 bg-yellow-50">
                 <h3 className="text-yellow-800 font-bold flex items-center gap-2"><Clock size={20}/> Payment Verification</h3>
                 <p className="text-yellow-700 text-sm">Review receipts and approve for assessment.</p>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-600">
                        <tr>
                            <th className="px-6 py-4">Student</th>
                            <th className="px-6 py-4">Submitted Receipt #</th>
                            <th className="px-6 py-4">Date Submitted</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {verificationList.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-coha-900">{student.name}</p>
                                    <p className="text-xs text-gray-500">ID: {student.id}</p>
                                </td>
                                <td className="px-6 py-4 font-mono font-bold text-lg text-coha-900">{student.receiptNumber}</td>
                                <td className="px-6 py-4 text-xs text-gray-500">{student.receiptSubmissionDate?.toDate().toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <Button onClick={() => handleVerifyClick(student)} disabled={loading} className="py-1 px-3 text-sm">
                                        Verify Payment
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {verificationList.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-gray-500">No pending verifications.</td></tr>}
                    </tbody>
                </table>
             </div>
          </div>
      )}

      {/* MODE: RECEIPTS */}
      {viewMode === 'RECEIPTS' && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white p-6 shadow-sm border border-gray-200 h-fit">
                  <h3 className="font-bold text-lg mb-4">Add New Receipt</h3>
                  <div className="space-y-4">
                      <Input label="Receipt Number" value={newReceiptNumber} onChange={(e) => setNewReceiptNumber(e.target.value)} placeholder="e.g. R-10029" />
                      <Input label="Amount (N$)" value={newReceiptAmount} onChange={(e) => setNewReceiptAmount(e.target.value)} placeholder="300.00" />
                      <Button fullWidth onClick={handleAddReceipt} disabled={loading}>
                          <Plus size={20} /> Add Receipt
                      </Button>
                  </div>
              </div>
              
              <div className="lg:col-span-2 bg-white shadow-sm border border-gray-200">
                  <div className="p-4 border-b bg-gray-50 font-bold text-gray-700">Available Receipts</div>
                  <div className="overflow-x-auto max-h-[600px]">
                    <table className="w-full text-left">
                        <thead className="bg-white text-xs font-bold uppercase text-gray-600 sticky top-0">
                            <tr>
                                <th className="px-6 py-4">Receipt #</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {receipts.map((receipt) => (
                                <tr key={receipt.id} className={receipt.isUsed ? 'bg-gray-100 opacity-70' : ''}>
                                    <td className="px-6 py-4 font-mono font-bold">{receipt.number}</td>
                                    <td className="px-6 py-4">N$ {receipt.amount}</td>
                                    <td className="px-6 py-4">
                                        {receipt.isUsed ? (
                                            <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1">USED ({receipt.usedByStudentId})</span>
                                        ) : (
                                            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1">AVAILABLE</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {!receipt.isUsed && (
                                            <button onClick={() => handleDeleteReceipt(receipt.id!)} className="text-red-400 hover:text-red-600">
                                                <Trash2 size={16}/>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {receipts.length === 0 && <tr><td colSpan={4} className="text-center py-8">No receipts added.</td></tr>}
                        </tbody>
                    </table>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};