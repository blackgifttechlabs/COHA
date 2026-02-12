import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { submitApplication, getSystemSettings } from '../services/dataService';
import { ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react';

const STEPS = [
  "Learner Details",
  "Parent Details", 
  "History & Languages",
  "Medical Information",
  "Consent & Declaration"
];

export const ApplyPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [gradesList, setGradesList] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    // Step 1: Learner
    surname: '', firstName: '', dob: '', citizenship: '', gender: 'Male', 
    address: '', region: '', grade: '', isSpecialNeeds: false, specialNeedsType: '',
    
    // Step 2: Parent & Emergency
    fatherName: '', fatherPhone: '', fatherEmail: '',
    motherName: '', motherPhone: '',
    emergencyName: '', emergencyRelationship: '', emergencyWork: '', emergencyCell: '', emergencyEmail: '',

    // Step 3: History & Languages
    hasPreviousSchool: true, previousSchool: '', highestGrade: '',
    langEnglish: 'Good', 
    langOther1Name: '', langOther1Rating: 'Fair',
    langOther2Name: '', langOther2Rating: 'Fair',

    // Step 4: Medical
    medicalConditions: '',
    doctorName: '', doctorContact: '',
    audiologistName: '', audiologistContact: '',
    therapistName: '', therapistContact: '',
    hasMedicalAid: false,
    medicalAidName: '', medicalAidMemberName: '', medicalAidMemberID: '', medicalAidOption: '',

    // Step 5: Consent
    medicalConsent: false,
    agreed: false
  });

  useEffect(() => {
    const fetchGrades = async () => {
        const settings = await getSystemSettings();
        if (settings && settings.grades) {
            setGradesList(settings.grades);
        } else {
            setGradesList(['Grade 1', 'Grade 2', 'Grade 3']); // Default fallback
        }
    };
    fetchGrades();
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

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await submitApplication(formData as any);
    if (success) {
      setSubmitted(true);
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 max-w-lg w-full text-center shadow-2xl border-t-4 border-coha-500">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-coha-900 mb-4">Application Received!</h2>
          <p className="text-gray-600 mb-8">
            Thank you for applying to Circle of Hope Academy. Your application has been submitted successfully. 
            Our admissions team will review your details and contact you shortly.
          </p>
          <Button fullWidth onClick={() => navigate('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-coha-900 text-white p-6 sticky top-0 z-30 shadow-md">
        <div className="w-full px-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="hover:text-coha-400">
              <ArrowLeft />
            </button>
            <h1 className="text-xl font-bold uppercase tracking-wider">Online Application</h1>
          </div>
          <span className="text-sm font-mono opacity-80">Step {currentStep + 1} of {STEPS.length}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-200 h-2 w-full">
        <div 
          className="bg-coha-400 h-full transition-all duration-300 ease-in-out"
          style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 w-full px-5 py-10">
        <form onSubmit={handleSubmit} className="bg-white shadow-xl border border-gray-100 p-8 min-h-[500px] flex flex-col">
          <h2 className="text-2xl font-bold text-coha-900 mb-8 border-b pb-4">{STEPS[currentStep]}</h2>
          
          <div className="flex-1">
            {/* Step 1: Learner Details */}
            {currentStep === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                <Input name="surname" label="Surname" value={formData.surname} onChange={handleChange} required />
                <Input name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} required />
                <Input name="dob" label="Date of Birth" type="date" value={formData.dob} onChange={handleChange} required />
                <Input name="citizenship" label="Citizenship" value={formData.citizenship} onChange={handleChange} required />
                
                <div className="mb-4">
                  <label className="block text-coha-900 text-sm font-semibold mb-1 uppercase tracking-wider">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 border-2 border-gray-300 focus:border-coha-500 outline-none bg-white rounded-none">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="mb-4">
                   <label className="block text-coha-900 text-sm font-semibold mb-1 uppercase tracking-wider">Grade Applying For</label>
                   <select name="grade" value={formData.grade} onChange={handleChange} className="w-full p-3 border-2 border-gray-300 focus:border-coha-500 outline-none bg-white rounded-none" required>
                     <option value="">Select Grade</option>
                     {gradesList.map(grade => (
                         <option key={grade} value={grade}>{grade}</option>
                     ))}
                   </select>
                </div>

                <Input name="address" label="Residential Address" value={formData.address} onChange={handleChange} className="md:col-span-2" required />
                
                <div className="md:col-span-2 border-t pt-4 mt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="isSpecialNeeds" 
                      checked={formData.isSpecialNeeds} 
                      onChange={handleChange}
                      className="w-5 h-5 text-coha-500 rounded-none focus:ring-coha-500"
                    />
                    <span className="font-bold text-gray-700">Special Needs Application</span>
                  </label>
                </div>

                {formData.isSpecialNeeds && (
                  <div className="md:col-span-2 animate-fade-in">
                    <label className="block text-coha-900 text-sm font-semibold mb-1 uppercase tracking-wider">Type of Special Needs</label>
                    <select name="specialNeedsType" value={formData.specialNeedsType} onChange={handleChange} className="w-full p-3 border-2 border-gray-300 focus:border-coha-500 outline-none bg-white rounded-none">
                      <option value="">Select Type</option>
                      <option value="Slow Learner">Slow Learner</option>
                      <option value="Down Syndrome">Down Syndrome</option>
                      <option value="Autism">Autism</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Parent & Emergency */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                <div className="md:col-span-2 bg-gray-50 p-4 border-l-4 border-coha-500">
                  <h3 className="font-bold text-gray-800">Parents / Guardians</h3>
                </div>
                <Input name="fatherName" label="Father/Guardian Name" value={formData.fatherName} onChange={handleChange} required />
                <Input name="fatherPhone" label="Phone Number" value={formData.fatherPhone} onChange={handleChange} required />
                <Input name="fatherEmail" label="Email Address" type="email" value={formData.fatherEmail} onChange={handleChange} className="md:col-span-2" required />

                <Input name="motherName" label="Mother/Guardian Name" value={formData.motherName} onChange={handleChange} />
                <Input name="motherPhone" label="Phone Number" value={formData.motherPhone} onChange={handleChange} />

                <div className="md:col-span-2 bg-gray-50 p-4 border-l-4 border-red-500 mt-6">
                  <h3 className="font-bold text-gray-800">Emergency Contact Details</h3>
                </div>
                <Input name="emergencyName" label="Full Names & Surname" value={formData.emergencyName} onChange={handleChange} required />
                <Input name="emergencyRelationship" label="Relationship" value={formData.emergencyRelationship} onChange={handleChange} required />
                <Input name="emergencyWork" label="Work Info (Company/Tel)" value={formData.emergencyWork} onChange={handleChange} />
                <Input name="emergencyCell" label="Cell Number" value={formData.emergencyCell} onChange={handleChange} required />
                <Input name="emergencyEmail" label="Email Address" value={formData.emergencyEmail} onChange={handleChange} className="md:col-span-2" />
              </div>
            )}

            {/* Step 3: History & Languages */}
            {currentStep === 2 && (
              <div className="grid grid-cols-1 gap-6 animate-fade-in">
                
                {/* Educational Background */}
                <div className="bg-gray-50 p-4 border-b-2 border-coha-100">
                    <h3 className="font-bold text-coha-900 mb-4">Educational Background</h3>
                    <label className="flex items-center gap-3 cursor-pointer mb-4">
                        <input 
                        type="checkbox" 
                        name="hasPreviousSchool" 
                        checked={!formData.hasPreviousSchool} 
                        onChange={(e) => setFormData({...formData, hasPreviousSchool: !e.target.checked})}
                        className="w-5 h-5 text-coha-500 rounded-none focus:ring-coha-500"
                        />
                        <span className="text-gray-700">First time attender / No previous school</span>
                    </label>
                    {formData.hasPreviousSchool && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input name="previousSchool" label="Previous School Attended" value={formData.previousSchool} onChange={handleChange} />
                            <Input name="highestGrade" label="Highest Grade Completed" value={formData.highestGrade} onChange={handleChange} />
                        </div>
                    )}
                </div>

                {/* Language Proficiency */}
                <div className="mt-4">
                    <h3 className="font-bold text-coha-900 mb-4 uppercase">Language Proficiency</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border border-gray-200">
                            <thead className="bg-gray-100 text-sm font-bold uppercase text-gray-600">
                                <tr>
                                    <th className="p-3">Language</th>
                                    <th className="p-3 text-center">Good</th>
                                    <th className="p-3 text-center">Fair</th>
                                    <th className="p-3 text-center">Poor</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-t border-gray-100">
                                    <td className="p-3 font-bold">English</td>
                                    <td className="p-3 text-center"><input type="radio" name="langEnglish" value="Good" checked={formData.langEnglish === 'Good'} onChange={handleChange} /></td>
                                    <td className="p-3 text-center"><input type="radio" name="langEnglish" value="Fair" checked={formData.langEnglish === 'Fair'} onChange={handleChange} /></td>
                                    <td className="p-3 text-center"><input type="radio" name="langEnglish" value="Poor" checked={formData.langEnglish === 'Poor'} onChange={handleChange} /></td>
                                </tr>
                                <tr className="border-t border-gray-100 bg-gray-50">
                                    <td className="p-3">
                                        <input placeholder="Other Language 1" name="langOther1Name" value={formData.langOther1Name} onChange={handleChange} className="bg-transparent border-b border-gray-300 w-full outline-none" />
                                    </td>
                                    <td className="p-3 text-center"><input type="radio" name="langOther1Rating" value="Good" checked={formData.langOther1Rating === 'Good'} onChange={handleChange} /></td>
                                    <td className="p-3 text-center"><input type="radio" name="langOther1Rating" value="Fair" checked={formData.langOther1Rating === 'Fair'} onChange={handleChange} /></td>
                                    <td className="p-3 text-center"><input type="radio" name="langOther1Rating" value="Poor" checked={formData.langOther1Rating === 'Poor'} onChange={handleChange} /></td>
                                </tr>
                                <tr className="border-t border-gray-100">
                                    <td className="p-3">
                                        <input placeholder="Other Language 2" name="langOther2Name" value={formData.langOther2Name} onChange={handleChange} className="bg-transparent border-b border-gray-300 w-full outline-none" />
                                    </td>
                                    <td className="p-3 text-center"><input type="radio" name="langOther2Rating" value="Good" checked={formData.langOther2Rating === 'Good'} onChange={handleChange} /></td>
                                    <td className="p-3 text-center"><input type="radio" name="langOther2Rating" value="Fair" checked={formData.langOther2Rating === 'Fair'} onChange={handleChange} /></td>
                                    <td className="p-3 text-center"><input type="radio" name="langOther2Rating" value="Poor" checked={formData.langOther2Rating === 'Poor'} onChange={handleChange} /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
              </div>
            )}

            {/* Step 4: Medical */}
            {currentStep === 3 && (
                <div className="animate-fade-in space-y-6">
                    <div>
                        <h3 className="font-bold text-coha-900 mb-4 uppercase">Medical Health Professions</h3>
                        <p className="text-sm text-gray-500 mb-4">Please fill in details for any medical professionals the learner sees.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 border border-gray-200 bg-gray-50">
                            <h4 className="md:col-span-2 font-bold text-gray-700">Medical Doctor</h4>
                            <Input name="doctorName" label="Name" value={formData.doctorName} onChange={handleChange} />
                            <Input name="doctorContact" label="Contact Details" value={formData.doctorContact} onChange={handleChange} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 border border-gray-200 bg-gray-50">
                            <h4 className="md:col-span-2 font-bold text-gray-700">Speech and Audiologist</h4>
                            <Input name="audiologistName" label="Name" value={formData.audiologistName} onChange={handleChange} />
                            <Input name="audiologistContact" label="Contact Details" value={formData.audiologistContact} onChange={handleChange} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 border border-gray-200 bg-gray-50">
                            <h4 className="md:col-span-2 font-bold text-gray-700">Occupational Therapist</h4>
                            <Input name="therapistName" label="Name" value={formData.therapistName} onChange={handleChange} />
                            <Input name="therapistContact" label="Contact Details" value={formData.therapistContact} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        <h3 className="font-bold text-coha-900 mb-4 uppercase">Medical Aid Details</h3>
                         <label className="flex items-center gap-3 cursor-pointer mb-4">
                            <input 
                            type="checkbox" 
                            name="hasMedicalAid" 
                            checked={formData.hasMedicalAid} 
                            onChange={handleChange}
                            className="w-5 h-5 text-coha-500 rounded-none focus:ring-coha-500"
                            />
                            <span className="text-gray-700 font-bold">Learner has Medical Aid</span>
                        </label>

                        {formData.hasMedicalAid && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                                <Input name="medicalAidName" label="Medical Aid Name" value={formData.medicalAidName} onChange={handleChange} />
                                <Input name="medicalAidOption" label="Option" value={formData.medicalAidOption} onChange={handleChange} />
                                <Input name="medicalAidMemberName" label="Main Member Name & Surname" value={formData.medicalAidMemberName} onChange={handleChange} />
                                <Input name="medicalAidMemberID" label="Main Member ID No" value={formData.medicalAidMemberID} onChange={handleChange} />
                            </div>
                        )}
                    </div>
                    
                    <div className="border-t pt-6">
                         <div className="mb-4">
                            <label className="block text-coha-900 text-sm font-semibold mb-1 uppercase tracking-wider">Known Medical Conditions / Allergies</label>
                            <textarea 
                            name="medicalConditions" 
                            value={formData.medicalConditions} 
                            onChange={handleChange}
                            className="w-full p-3 border-2 border-gray-300 focus:border-coha-500 outline-none transition-colors bg-white rounded-none h-24"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Step 5: Consent & Declaration */}
            {currentStep === 4 && (
              <div className="animate-fade-in space-y-6">
                
                {/* Medical Consent */}
                <div className="bg-red-50 border-l-4 border-red-500 p-6">
                    <h3 className="font-bold text-red-800 mb-2 uppercase">Learners Medical Details - Consent</h3>
                    <p className="text-sm text-gray-700 mb-4 text-justify">
                        In a critical medical situation, please bear in mind that there may not be time to refer to the learner’s
                        records. The school therefore reserves the right to utilise the quickest medical service available.
                    </p>
                    <p className="text-sm text-gray-800 italic mb-4">
                        I, <strong>{formData.fatherName || formData.motherName || '________________'}</strong> being the parent/legal guardian of 
                        <strong> {formData.firstName} {formData.surname}</strong>, hereby agree that a medical practitioner may provide emergency
                        treatment as may be necessary.
                    </p>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            name="medicalConsent" 
                            checked={formData.medicalConsent} 
                            onChange={handleChange}
                            className="w-6 h-6 text-red-600 rounded-none focus:ring-red-500"
                        />
                        <span className="font-bold text-red-900">I Consent to Emergency Medical Treatment</span>
                    </label>
                </div>

                <div className="bg-gray-50 p-6 border border-gray-200 text-sm text-gray-700 leading-relaxed">
                  <h4 className="font-bold text-coha-900 mb-4 uppercase">Agreement between Circle of Hope Private Academy and the Parent/Guardian</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>I accept that Circle of Hope Private Academy is a school based on Ministry of Education curriculum.</li>
                    <li>I commit myself to the full participation in the total curriculum of the school.</li>
                    <li>I will support and abide by the established school policies and code of conduct.</li>
                    <li>I accept financial responsibility for all school fees and charges.</li>
                    <li>School fees are paid in advance.</li>
                    <li>I understand that one month's notice is required before withdrawing my child.</li>
                  </ul>
                </div>

                <div className="flex items-start gap-3 mt-6">
                  <input 
                    type="checkbox" 
                    name="agreed" 
                    checked={formData.agreed} 
                    onChange={handleChange}
                    className="mt-1 w-6 h-6 text-coha-500 rounded-none focus:ring-coha-500"
                    required
                  />
                  <p className="text-gray-800">
                    I declare that the information I have given in this form is true and complete. I hereby accept the terms and conditions outlined above.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleBack} 
              disabled={currentStep === 0}
              className={currentStep === 0 ? 'opacity-0' : ''}
            >
              Back
            </Button>
            
            {currentStep < STEPS.length - 1 ? (
              <Button type="button" onClick={handleNext}>
                Next Step <ArrowRight size={18} />
              </Button>
            ) : (
              <Button type="submit" disabled={!formData.agreed || !formData.medicalConsent || loading}>
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};