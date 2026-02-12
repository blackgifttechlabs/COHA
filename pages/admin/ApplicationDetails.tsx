import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApplicationById, updateApplication, getSystemSettings, enrollStudent } from '../../services/dataService';
import { Application, SystemSettings } from '../../types';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { Input } from '../../components/ui/Input';
import { ArrowLeft, Mail, Check, X, Printer, Phone } from 'lucide-react';

export const ApplicationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [app, setApp] = useState<Application | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Office Use State
  const [officeData, setOfficeData] = useState({
    officeReviewer: '',
    officeReviewDate: new Date().toISOString().split('T')[0],
    officeStatus: 'Successful',
    officeResponseMethod: 'Email',
    officeResponseDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const appData = await getApplicationById(id);
        const settingsData = await getSystemSettings();
        setApp(appData);
        setSettings(settingsData);
        
        // Pre-fill reviewer name if available
        if (settingsData?.adminName) {
            setOfficeData(prev => ({...prev, officeReviewer: settingsData.adminName}));
        }
        
        if (appData?.officeReviewer) {
            setOfficeData({
                officeReviewer: appData.officeReviewer || '',
                officeReviewDate: appData.officeReviewDate || '',
                officeStatus: appData.officeStatus || 'Successful',
                officeResponseMethod: appData.officeResponseMethod || 'Email',
                officeResponseDate: appData.officeResponseDate || ''
            });
        }
      }
    };
    fetchData();
  }, [id]);

  const handleOfficeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setOfficeData({ ...officeData, [e.target.name]: e.target.value });
  };

  const handleApprove = async () => {
    if (!app || !id) return;
    setIsProcessing(true);
    
    try {
        // 1. Update Application in DB
        const updatedData = {
            status: 'APPROVED' as any,
            ...officeData
        };
        
        await updateApplication(id, updatedData);
        setApp({ ...app, ...updatedData });

        // 2. Automatically Enroll Student
        const parentPin = await enrollStudent(app);

        // 3. Generate Email Mailto Link
        if (settings && parentPin) {
            const parentEmail = app.fatherEmail; // Primary email
            const subject = `Admission Status: ${app.firstName} ${app.surname} - Circle of Hope Academy`;
            
            // Format Lists
            const feesList = settings.fees 
                ? settings.fees.map(f => `- ${f.category}: ${f.amount} (${f.frequency})`).join('\n')
                : 'As per schedule';

            const uniformsList = settings.uniforms
                ? settings.uniforms.map(u => `- ${u.name} ${u.isRequired ? '' : '(Optional)'}`).join('\n')
                : 'As per schedule';

            const stationeryList = settings.stationery
                ? settings.stationery.map(s => `- ${s.name} ${s.isRequired ? '' : '(Optional)'}`).join('\n')
                : 'As per schedule';

            const body = `Dear Parent/Guardian,

We are pleased to inform you that the application for ${app.firstName} ${app.surname} for ${app.grade} at Circle of Hope Academy has been SUCCESSFUL.

IMPORTANT LOGIN DETAILS:
To access the parent portal and view your child's profile, please use the following:
Student Name: ${app.firstName} ${app.surname}
Parent PIN: ${parentPin}

Here are the details for the upcoming term:

START DATE: ${settings.termStartDate || 'TBA'}
START TIME: ${settings.termStartTime || '07:30'}

SCHOOL FEES STRUCTURE:
${feesList}

UNIFORM REQUIREMENTS:
${uniformsList}

STATIONERY LIST:
${stationeryList}

Please ensure all registration fees are paid before the start date.

Regards,
${settings.adminName}
Circle of Hope Academy
`;
            
            window.location.href = `mailto:${parentEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }
    } catch (error) {
        console.error("Error approving:", error);
    }
    setIsProcessing(false);
  };

  if (!app) return <Loader />;

  const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-white p-6 shadow-sm border border-gray-200 mb-6 ${className}`}>
      <h3 className="text-lg font-bold text-coha-900 mb-4 border-b pb-2 uppercase tracking-wider">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {children}
      </div>
    </div>
  );

  const InfoRow: React.FC<{ label: string; value: any }> = ({ label, value }) => (
    <div>
      <p className="text-xs text-gray-500 uppercase font-bold">{label}</p>
      <p className="text-gray-900 font-medium break-words">{value || '-'}</p>
    </div>
  );

  return (
    <div className="w-full px-5 pb-10">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/applications')} className="bg-white p-2 border hover:bg-gray-50">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-coha-900">{app.surname}, {app.firstName}</h2>
                    <p className="text-gray-600">Application ID: {app.id}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.print()}>
                    <Printer size={18} /> Print
                </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Section title="Learner Details">
                    <InfoRow label="Full Name" value={`${app.firstName} ${app.surname}`} />
                    <InfoRow label="Date of Birth" value={app.dob} />
                    <InfoRow label="Gender" value={app.gender} />
                    <InfoRow label="Citizenship" value={app.citizenship} />
                    <InfoRow label="Grade Applied" value={app.grade} />
                    <InfoRow label="Address" value={app.address} />
                    <InfoRow label="Special Needs" value={app.isSpecialNeeds ? `Yes - ${app.specialNeedsType}` : 'No'} />
                </Section>

                <Section title="Parent / Guardian Info">
                    <InfoRow label="Father Name" value={app.fatherName} />
                    <InfoRow label="Father Phone" value={app.fatherPhone} />
                    <InfoRow label="Father Email" value={app.fatherEmail} />
                    <div className="md:col-span-2 border-t pt-2 mt-2"></div>
                    <InfoRow label="Mother Name" value={app.motherName} />
                    <InfoRow label="Mother Phone" value={app.motherPhone} />
                </Section>

                <Section title="Emergency Contact" className="border-l-4 border-red-500">
                    <InfoRow label="Contact Name" value={app.emergencyName} />
                    <InfoRow label="Relationship" value={app.emergencyRelationship} />
                    <InfoRow label="Cell Number" value={app.emergencyCell} />
                    <InfoRow label="Work Contact" value={app.emergencyWork} />
                    <InfoRow label="Email" value={app.emergencyEmail} />
                </Section>

                <Section title="Education & Languages">
                    <InfoRow label="Previous School" value={app.hasPreviousSchool ? app.previousSchool : 'None'} />
                    <InfoRow label="Highest Grade" value={app.hasPreviousSchool ? app.highestGrade : 'N/A'} />
                    <div className="md:col-span-2 mt-2">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-2">Language Proficiency</p>
                        <div className="bg-gray-50 p-2 text-sm">
                            <div className="grid grid-cols-2 border-b border-gray-200 pb-1">
                                <span>English</span> <span className="font-bold">{app.langEnglish}</span>
                            </div>
                            {app.langOther1Name && (
                                <div className="grid grid-cols-2 border-b border-gray-200 py-1">
                                    <span>{app.langOther1Name}</span> <span className="font-bold">{app.langOther1Rating}</span>
                                </div>
                            )}
                            {app.langOther2Name && (
                                <div className="grid grid-cols-2 pt-1">
                                    <span>{app.langOther2Name}</span> <span className="font-bold">{app.langOther2Rating}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </Section>

                <Section title="Medical Information">
                     <div className="md:col-span-2">
                        <InfoRow label="Known Conditions / Allergies" value={app.medicalConditions} />
                    </div>
                    
                    <div className="md:col-span-2 border-t my-2 pt-2">
                        <h4 className="font-bold text-gray-700 text-sm mb-2">Professionals</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoRow label="Doctor" value={`${app.doctorName || 'None'} (${app.doctorContact || '-'})`} />
                            <InfoRow label="Audiologist" value={`${app.audiologistName || 'None'} (${app.audiologistContact || '-'})`} />
                            <InfoRow label="Therapist" value={`${app.therapistName || 'None'} (${app.therapistContact || '-'})`} />
                        </div>
                    </div>

                    <div className="md:col-span-2 border-t my-2 pt-2">
                         <h4 className="font-bold text-gray-700 text-sm mb-2">Medical Aid</h4>
                         {app.hasMedicalAid ? (
                            <div className="grid grid-cols-2 gap-4">
                                <InfoRow label="Fund Name" value={app.medicalAidName} />
                                <InfoRow label="Option" value={app.medicalAidOption} />
                                <InfoRow label="Member Name" value={app.medicalAidMemberName} />
                                <InfoRow label="Member ID" value={app.medicalAidMemberID} />
                            </div>
                         ) : (
                             <p className="text-gray-500 text-sm italic">No Medical Aid</p>
                         )}
                    </div>
                </Section>
                
                 <div className="bg-white p-6 shadow-sm border border-gray-200 mb-6 flex items-center gap-4">
                     <div className={`p-2 rounded-full ${app.medicalConsent ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                         {app.medicalConsent ? <Check size={24} /> : <X size={24} />}
                     </div>
                     <div>
                         <h4 className="font-bold text-coha-900">Emergency Medical Consent</h4>
                         <p className="text-sm text-gray-600">Parent has {app.medicalConsent ? 'consented' : 'NOT consented'} to emergency medical treatment.</p>
                     </div>
                 </div>
            </div>

            <div className="lg:col-span-1">
                {/* Office Use Section */}
                <div className="bg-coha-50 p-6 border-l-4 border-coha-900 sticky top-24">
                    <h3 className="text-lg font-bold text-coha-900 mb-6 uppercase tracking-wider">Office Use Only</h3>
                    
                    {app.status === 'APPROVED' ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check size={32} />
                            </div>
                            <h3 className="font-bold text-green-800 text-xl">Approved</h3>
                            <p className="text-green-600">Student Enrolled</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Input 
                                label="Reviewed By" 
                                name="officeReviewer"
                                value={officeData.officeReviewer}
                                onChange={handleOfficeChange}
                            />
                            <Input 
                                label="Date of Review" 
                                type="date" 
                                name="officeReviewDate"
                                value={officeData.officeReviewDate}
                                onChange={handleOfficeChange}
                            />
                            <div>
                                <label className="block text-coha-900 text-sm font-semibold mb-1 uppercase tracking-wider">Admission Status</label>
                                <select 
                                    name="officeStatus" 
                                    value={officeData.officeStatus} 
                                    onChange={handleOfficeChange}
                                    className="w-full p-3 border-2 border-gray-300 focus:border-coha-500 outline-none bg-white rounded-none"
                                >
                                    <option value="Successful">Successful</option>
                                    <option value="Not Successful">Not Successful</option>
                                </select>
                            </div>
                            
                            <div className="pt-4 border-t border-gray-200">
                                <h4 className="font-bold text-gray-700 mb-2">Response Details</h4>
                                <Input 
                                    label="Response Date" 
                                    type="date" 
                                    name="officeResponseDate"
                                    value={officeData.officeResponseDate}
                                    onChange={handleOfficeChange}
                                />
                                <div>
                                    <label className="block text-coha-900 text-sm font-semibold mb-1 uppercase tracking-wider">Method</label>
                                    <select 
                                        name="officeResponseMethod" 
                                        value={officeData.officeResponseMethod} 
                                        onChange={handleOfficeChange}
                                        className="w-full p-3 border-2 border-gray-300 focus:border-coha-500 outline-none bg-white rounded-none"
                                    >
                                        <option value="Email">Email</option>
                                        <option value="Phone">Phone</option>
                                        <option value="Post">Post</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-6">
                                <Button fullWidth onClick={handleApprove} disabled={isProcessing} className="mb-2">
                                    {isProcessing ? 'Enrolling...' : <><Check size={20} /> Approve & Enroll</>}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};