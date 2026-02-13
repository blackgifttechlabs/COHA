import React, { useState, useEffect } from 'react';
import { Student } from '../../types';
import { submitPaymentReceipt, getStudentById } from '../../services/dataService';
import { Loader } from '../../components/ui/Loader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';

interface ParentDashboardProps {
  user: any; // Logged in user (Student record)
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ user }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Refresh student data to get latest status
    if (user?.id) {
        getStudentById(user.id).then(setStudent);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!receiptNumber || !student) return;
      
      setLoading(true);
      const success = await submitPaymentReceipt(student.id, receiptNumber);
      if (success) {
          setSubmitted(true);
          // Optimistically update local state
          setStudent({...student, studentStatus: 'PAYMENT_VERIFICATION', paymentRejected: false});
      }
      setLoading(false);
  };

  if (!student) return <Loader />;

  // STATUS: WAITING_PAYMENT
  if (student.studentStatus === 'WAITING_PAYMENT') {
      return (
          <div className="max-w-md mx-auto mt-10 animate-fade-in">
              {/* Rejection Notice */}
              {student.paymentRejected && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 shadow-sm">
                      <div className="flex items-start gap-3">
                          <AlertCircle className="text-red-600 shrink-0" size={24} />
                          <div>
                              <h3 className="text-red-800 font-bold">Payment Verification Failed</h3>
                              <p className="text-red-700 text-sm mt-1">The receipt number you provided was invalid or already used. Please check your receipt and try again.</p>
                          </div>
                      </div>
                  </div>
              )}

              <div className="p-6 bg-white shadow-lg border-t-8 border-coha-900">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Enrollment</h2>
                    <p className="text-gray-600">Your application has been conditionally approved. Please confirm your application fee payment to proceed.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input 
                        label="Enter Receipt Number" 
                        placeholder="e.g. R-99382" 
                        value={receiptNumber} 
                        onChange={(e) => setReceiptNumber(e.target.value)} 
                        required
                    />
                    <Button fullWidth disabled={loading}>
                        {loading ? 'Submitting...' : 'Verify Payment'}
                    </Button>
                </form>
              </div>
          </div>
      );
  }

  // STATUS: PAYMENT_VERIFICATION
  if (student.studentStatus === 'PAYMENT_VERIFICATION') {
      return (
          <div className="max-w-md mx-auto mt-10 p-8 bg-white shadow-lg text-center animate-fade-in">
               <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Clock size={32} />
               </div>
               <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
               <p className="text-gray-600">We have received your receipt number. The administration is currently verifying the payment. This usually takes 24 hours.</p>
          </div>
      );
  }

  // STATUS: ASSESSMENT
  if (student.studentStatus === 'ASSESSMENT') {
      return (
          <div className="max-w-md mx-auto mt-10 p-8 bg-white shadow-lg text-center animate-fade-in">
               <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={32} />
               </div>
               <h2 className="text-2xl font-bold text-gray-900 mb-2">Pending Assessment</h2>
               <p className="text-gray-600">Payment verified! The student is now awaiting academic assessment. You will be contacted shortly.</p>
          </div>
      );
  }

  // STATUS: ENROLLED (Standard View)
  return (
      <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 shadow-sm border-l-4 border-green-500 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Welcome, {student.parentName}</h2>
              <p className="text-gray-600">Student: {student.name} ({student.grade})</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-lg mb-4 border-b pb-2">Student Profile</h3>
                  <div className="space-y-2">
                      <p><span className="text-gray-500 font-bold text-xs uppercase">Full Name:</span> <br/>{student.name}</p>
                      <p><span className="text-gray-500 font-bold text-xs uppercase">Student ID:</span> <br/>{student.id}</p>
                      <p><span className="text-gray-500 font-bold text-xs uppercase">Grade:</span> <br/>{student.grade}</p>
                  </div>
              </div>
              
              <div className="bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-lg mb-4 border-b pb-2">Financial Status</h3>
                  <div className="flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded">
                      <CheckCircle size={24} />
                      <div>
                          <p className="font-bold">Enrolled</p>
                          <p className="text-sm">Account is active.</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );
};