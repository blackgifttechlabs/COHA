import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitApplication, getSystemSettings, determineSpecialNeedsLevel } from '../services/dataService';
import { ArrowLeft, CheckCircle, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CustomSelect } from '../components/ui/CustomSelect';

const STEPS = [
  "Learner",
  "Parents", 
  "History",
  "Medical",
  "Consent"
];

// Simple Input for Google Forms Style
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, className = '', required, ...props }) => (
  <div className="w-full mb-6">
    <label className="block text-gray-800 text-sm font-medium mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      className={`w-full p-3 border-b-2 border-gray-300 focus:border-coha-500 outline-none transition-colors bg-gray-50 focus:bg-white text-gray-900 ${className}`}
      {...props}
    />
  </div>
);

export const ApplyPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [gradesList, setGradesList] = useState<string[]>([]);
  const [autoLevel, setAutoLevel] = useState<string>('');
  
  // Validation State
  const [shakeError, setShakeError] = useState(false);
  const [errorField, setErrorField] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    surname: '', firstName: '', dob: '', citizenship: '', gender: 'Male', 
    address: '', region: '', grade: '', isSpecialNeeds: false, specialNeedsType: '',
    fatherName: '', fatherPhone: '', fatherEmail: '',
    motherName: '', motherPhone: '', motherEmail: '',
    emergencyName: '', emergencyRelationship: '', emergencyWork: '', emergencyCell: '', emergencyEmail: '',
    hasPreviousSchool: true, previousSchool: '', highestGrade: '',
    langEnglish: 'Good', 
    langOther1Name: '', langOther1Rating: 'Fair',
    langOther2Name: '', langOther2Rating: 'Fair',
    medicalConditions: '',
    doctorName: '', doctorContact: '',
    audiologistName: '', audiologistContact: '',
    therapistName: '', therapistContact: '',
    hasMedicalAid: false,
    medicalAidName: '', medicalAidMemberName: '', medicalAidMemberID: '', medicalAidOption: '',
    medicalConsent: false,
    agreed: false
  });

  useEffect(() => {
    const fetchGrades = async () => {
        const settings = await getSystemSettings();
        if (settings && settings.grades) {
            setGradesList(settings.grades);
        } else {
            setGradesList(['Grade 0', 'Grade 1', 'Grade 2', 'Grade 3']);
        }
    };
    fetchGrades();
  }, []);

  // Recalculate level when DOB or Special Needs changes
  useEffect(() => {
    if (formData.isSpecialNeeds && formData.dob) {
        const lvl = determineSpecialNeedsLevel(formData.dob);
        setAutoLevel(lvl);
    }
  }, [formData.dob, formData.isSpecialNeeds]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      if (name === 'agreed' || name === 'medicalConsent') setErrorField(null); // Clear error on interaction
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCustomSelect = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      scrollToTop();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      scrollToTop();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation Check for Consent & Agreement
    if (!formData.medicalConsent || !formData.agreed) {
      setShakeError(true);
      setErrorField('consent');
      setTimeout(() => setShakeError(false), 600); 
      return;
    }

    setLoading(true);
    const success = await submitApplication(formData as any);
    if (success) {
      setSubmitted(true);
      scrollToTop();
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
        <div className="bg-white p-8 rounded-lg max-w-sm w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Application Sent!</h2>
          <p className="text-sm text-gray-600 mb-6">
            We have received your details. Our admissions team will be in touch shortly.
          </p>
          <Button fullWidth onClick={() => navigate('/')}>Done</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-20">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-10px); }
          80% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .error-pulse {
          animation: pulse-red 1s infinite;
        }
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>

      {/* Header */}
      <div className="sticky top-0 bg-white z-40 border-b border-gray-100 shadow-sm">
        <div className="px-5 py-3 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-coha-900">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-sm font-bold text-gray-600">Online Application</h1>
        </div>
        
        {/* Stepper */}
        <div className="px-5 pb-3 pt-1">
          <div className="flex items-center justify-between relative">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 transform -translate-y-1/2"></div>
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-coha-500 -z-10 transform -translate-y-1/2 transition-all duration-300"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            ></div>

            {STEPS.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              
              return (
                <div key={index} className="flex flex-col items-center bg-white px-1">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                      isCompleted ? 'bg-coha-500 border-coha-500 text-white' : 
                      isCurrent ? 'bg-white border-coha-500 text-coha-500 scale-110' : 
                      'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {isCompleted ? <Check size={14} /> : index + 1}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-2">
            <span className="text-xs font-bold text-coha-900 uppercase tracking-wide">{STEPS[currentStep]}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-5 pt-8 max-w-5xl mx-auto">
        
        {/* Step 1: Learner */}
        {currentStep === 0 && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Col */}
            <div>
                <FormInput name="surname" label="Surname" value={formData.surname} onChange={handleChange} required />
                <FormInput name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} required />
                <FormInput name="dob" label="Date of Birth" type="date" value={formData.dob} onChange={handleChange} required />
                
                <CustomSelect 
                  label="Gender"
                  value={formData.gender}
                  options={[{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }]}
                  onChange={(val) => handleCustomSelect('gender', val)}
                />

                <FormInput name="citizenship" label="Citizenship" value={formData.citizenship} onChange={handleChange} required />
            </div>

            {/* Right Col */}
            <div>
                <div className="mb-6">
                  <label className="flex items-start gap-3 cursor-pointer p-4 bg-gray-50 border border-gray-200 rounded-lg hover:border-coha-300 transition-colors">
                    <input 
                      type="checkbox" 
                      name="isSpecialNeeds" 
                      checked={formData.isSpecialNeeds} 
                      onChange={handleChange}
                      className="mt-1 w-5 h-5 accent-coha-500"
                    />
                    <div>
                      <span className="font-bold text-gray-800 text-sm">Special Needs Division</span>
                      <p className="text-xs text-gray-500 mt-1">Select this if the learner requires Special Needs education. The system will automatically assign a level based on age.</p>
                    </div>
                  </label>
                </div>

                {formData.isSpecialNeeds ? (
                  <div className="animate-fade-in p-4 bg-blue-50 border-l-4 border-blue-500 mb-6">
                    <h4 className="font-bold text-blue-900 mb-2">Automated Level Assignment</h4>
                    {formData.dob ? (
                         <p className="text-sm text-blue-800">Based on the date of birth, the learner will be placed in: <span className="font-bold text-lg block mt-1">{autoLevel}</span></p>
                    ) : (
                         <p className="text-sm text-blue-600 italic">Please enter Date of Birth to see the assigned level.</p>
                    )}
                    
                    <div className="mt-4">
                        <CustomSelect 
                        label="Type of Special Needs"
                        value={formData.specialNeedsType}
                        options={[
                            { label: 'Intellectual/Learning Difficulties', value: 'Intellectual/Learning Difficulties' },
                            { label: 'Down Syndrome', value: 'Down Syndrome' },
                            { label: 'Autism', value: 'Autism' },
                            { label: 'Other', value: 'Other' }
                        ]}
                        onChange={(val) => handleCustomSelect('specialNeedsType', val)}
                        />
                    </div>
                  </div>
                ) : (
                    <div className="animate-fade-in">
                        <CustomSelect 
                        label="Mainstream Grade"
                        value={formData.grade}
                        options={gradesList.map(g => ({ label: g, value: g }))}
                        onChange={(val) => handleCustomSelect('grade', val)}
                        required
                        />
                    </div>
                )}

                <FormInput name="address" label="Residential Address" value={formData.address} onChange={handleChange} required />
            </div>
          </div>
        )}

        {/* ... (Steps 2-5 are identical to previous version) ... */}
        {/* Step 2: Parents */}
        {currentStep === 1 && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6">Parent / Guardian Details</h3>
                <FormInput name="fatherName" label="Father/Guardian Name" value={formData.fatherName} onChange={handleChange} required />
                <FormInput name="fatherPhone" label="Phone Number" type="tel" value={formData.fatherPhone} onChange={handleChange} required />
                <FormInput name="fatherEmail" label="Email Address" type="email" value={formData.fatherEmail} onChange={handleChange} required />
                <div className="w-full h-px bg-gray-200 my-8"></div>
                <FormInput name="motherName" label="Mother/Guardian Name" value={formData.motherName} onChange={handleChange} />
                <FormInput name="motherPhone" label="Phone Number" type="tel" value={formData.motherPhone} onChange={handleChange} />
                <FormInput name="motherEmail" label="Email Address" type="email" value={formData.motherEmail} onChange={handleChange} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6 lg:mt-0 mt-8">Emergency Contact</h3>
                <div className="bg-red-50 p-4 border-l-4 border-red-400 mb-6 rounded-r-lg">
                  <p className="text-xs text-red-800">Please provide a contact other than the parents.</p>
                </div>
                <FormInput name="emergencyName" label="Full Name" value={formData.emergencyName} onChange={handleChange} required />
                <FormInput name="emergencyRelationship" label="Relationship" value={formData.emergencyRelationship} onChange={handleChange} required />
                <FormInput name="emergencyCell" label="Cell Number" type="tel" value={formData.emergencyCell} onChange={handleChange} required />
                <FormInput name="emergencyWork" label="Work Contact" value={formData.emergencyWork} onChange={handleChange} />
                <FormInput name="emergencyEmail" label="Email Address" type="email" value={formData.emergencyEmail} onChange={handleChange} />
            </div>
          </div>
        )}

        {/* Step 3: History */}
        {currentStep === 2 && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div>
                 <h3 className="text-lg font-bold text-gray-900 mb-6">Educational History</h3>
                 <div className="mb-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="hasPreviousSchool" 
                      checked={!formData.hasPreviousSchool} 
                      onChange={(e) => setFormData({...formData, hasPreviousSchool: !e.target.checked})}
                      className="w-5 h-5 accent-coha-500"
                    />
                    <span className="text-sm text-gray-700">First time attender (No previous school)</span>
                  </label>
                </div>
                {formData.hasPreviousSchool && (
                  <div className="pl-4 border-l-2 border-gray-200 mb-8">
                    <FormInput name="previousSchool" label="Previous School Name" value={formData.previousSchool} onChange={handleChange} />
                    <FormInput name="highestGrade" label="Highest Grade Completed" value={formData.highestGrade} onChange={handleChange} />
                  </div>
                )}
             </div>
             <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6 lg:mt-0 mt-8">Language Proficiency</h3>
                <div className="mb-6">
                  <label className="block text-gray-800 text-sm font-medium mb-2">English Proficiency</label>
                  <div className="flex gap-4">
                    {['Good', 'Fair', 'Poor'].map(rating => (
                      <label key={rating} className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded border border-gray-200">
                        <input 
                          type="radio" 
                          name="langEnglish" 
                          value={rating} 
                          checked={formData.langEnglish === rating} 
                          onChange={handleChange}
                          className="accent-coha-500" 
                        />
                        <span className="text-sm">{rating}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <FormInput name="langOther1Name" label="Other Language (Optional)" value={formData.langOther1Name} onChange={handleChange} />
             </div>
          </div>
        )}

        {/* Step 4: Medical */}
        {currentStep === 3 && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div>
                 <h3 className="text-lg font-bold text-gray-900 mb-6">Medical Information</h3>
                 <div className="mb-6">
                    <label className="block text-gray-800 text-sm font-medium mb-2">Known Medical Conditions / Allergies</label>
                    <textarea 
                      name="medicalConditions" 
                      value={formData.medicalConditions} 
                      onChange={handleChange}
                      className="w-full p-3 border-b-2 border-gray-300 focus:border-coha-500 outline-none bg-gray-50 h-24 text-sm"
                      placeholder="List any conditions here..."
                    />
                 </div>
                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                    <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Professionals (If Applicable)</h4>
                    <FormInput name="doctorName" label="Family Doctor Name" value={formData.doctorName} onChange={handleChange} className="bg-white" />
                    <FormInput name="doctorContact" label="Doctor Contact" value={formData.doctorContact} onChange={handleChange} className="bg-white" />
                    <FormInput name="therapistName" label="Occupational Therapist" value={formData.therapistName} onChange={handleChange} className="bg-white" />
                 </div>
             </div>
             <div>
                 <h3 className="text-lg font-bold text-gray-900 mb-6 lg:mt-0 mt-8">Medical Aid Details</h3>
                 <div className="mb-6">
                  <label className="flex items-center gap-3 cursor-pointer mb-4">
                    <input 
                      type="checkbox" 
                      name="hasMedicalAid" 
                      checked={formData.hasMedicalAid} 
                      onChange={handleChange}
                      className="w-5 h-5 accent-coha-500"
                    />
                    <span className="font-bold text-gray-800 text-sm">Learner has Medical Aid</span>
                  </label>
                  {formData.hasMedicalAid && (
                    <div className="pl-4 border-l-2 border-coha-500 animate-fade-in">
                       <FormInput name="medicalAidName" label="Medical Aid Name" value={formData.medicalAidName} onChange={handleChange} />
                       <FormInput name="medicalAidOption" label="Plan Option" value={formData.medicalAidOption} onChange={handleChange} />
                       <FormInput name="medicalAidMemberID" label="Member ID" value={formData.medicalAidMemberID} onChange={handleChange} />
                    </div>
                  )}
                 </div>
             </div>
          </div>
        )}

        {/* Step 5: Consent */}
        {currentStep === 4 && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div>
                 <h3 className="text-lg font-bold text-gray-900 mb-6">Consent & Declaration</h3>
                 <div className={`p-5 rounded-lg border-l-4 mb-6 transition-all duration-300 ${errorField === 'consent' ? 'bg-red-50 border-red-600 error-pulse' : 'bg-red-50 border-red-500'}`}>
                    <h4 className="font-bold text-red-800 mb-2">Medical Emergency Consent</h4>
                    <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                      In a critical medical situation, the school reserves the right to utilise the quickest medical service available if parents cannot be reached immediately.
                    </p>
                    <label className="flex items-start gap-3 cursor-pointer">
                       <input 
                          type="checkbox" 
                          name="medicalConsent" 
                          checked={formData.medicalConsent} 
                          onChange={handleChange}
                          className="mt-1 w-6 h-6 accent-red-600"
                        />
                       <span className="text-sm font-bold text-red-900">
                         I, hereby agree that a medical practitioner may provide emergency treatment as may be necessary.
                       </span>
                    </label>
                 </div>
             </div>
             <div>
                 <h3 className="text-lg font-bold text-gray-900 mb-6 lg:mt-0 mt-8">Terms & Conditions</h3>
                 <div className={`p-5 rounded-lg border-l-4 mb-8 transition-all duration-300 ${errorField === 'consent' ? 'bg-gray-100 border-red-600 error-pulse' : 'bg-gray-50 border-gray-400'}`}>
                    <h4 className="font-bold text-gray-900 mb-4">Terms & Conditions</h4>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 mb-6">
                      <li>I accept the school's curriculum and policies.</li>
                      <li>I accept financial responsibility for all school fees.</li>
                      <li>School fees are paid in advance.</li>
                      <li>One month's notice is required for withdrawal.</li>
                    </ul>
                    <label className="flex items-start gap-3 cursor-pointer">
                       <input 
                          type="checkbox" 
                          name="agreed" 
                          checked={formData.agreed} 
                          onChange={handleChange}
                          className="mt-1 w-6 h-6 accent-coha-900"
                        />
                       <span className="text-sm font-bold text-gray-900">
                         I declare that the information is true and I accept the terms outlined above.
                       </span>
                    </label>
                 </div>
                  {shakeError && (
                     <div className="flex items-center gap-2 text-red-600 mb-4 animate-shake justify-center bg-red-50 p-2 rounded">
                        <AlertCircle size={18} />
                        <span className="text-sm font-bold">Please accept both consents to proceed.</span>
                     </div>
                  )}
             </div>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-8 flex gap-4 pt-6 border-t border-gray-100 w-full">
           <Button 
              type="button" 
              variant="outline"
              onClick={handleBack} 
              className={`flex-1 ${currentStep === 0 ? 'invisible' : ''}`}
            >
              Back
            </Button>
            
            {currentStep < STEPS.length - 1 ? (
              <Button type="button" onClick={handleNext} className="flex-1 bg-coha-500 hover:bg-coha-600 border-none rounded-lg">
                Next <ArrowRight size={18} />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={loading}
                className={`flex-1 rounded-lg border-none text-white ${shakeError ? 'animate-shake bg-red-600' : 'bg-coha-900'}`}
              >
                {loading ? 'Sending...' : 'Submit Application'}
              </Button>
            )}
        </div>

      </form>
    </div>
  );
};