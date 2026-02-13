import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentById, saveTeacherAssessmentDay, calculateDayPercentage, calculateFinalStage } from '../../services/dataService';
import { Student, UserRole, AssessmentDay, ABCLog } from '../../types';
import { Loader } from '../../components/ui/Loader';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, CheckCircle, Lock, Calendar, Brain, Activity, ClipboardList, Plus, Trash2, X, Heart, User, AlertTriangle, PlayCircle, ArrowRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Toast } from '../../components/ui/Toast';

const THINKING_TASKS = [
    { id: 'T1', desc: 'Pile objects on top of one another' },
    { id: 'T2', desc: 'Place shapes correctly into a form board' },
    { id: 'T3', desc: 'Search for an object that is hidden' },
    { id: 'T4', desc: 'Sort objects into big and small' },
    { id: 'T5', desc: 'Arrange sticks in order of length' },
    { id: 'T6', desc: 'Sort objects by colour' },
    { id: 'T7', desc: 'Identify the odd-one-out from set of pictures' },
    { id: 'T8', desc: 'Remember where to find objects around the classroom' },
    { id: 'T9', desc: 'Arrange pictures into a correct sequence' },
    { id: 'T10', desc: 'Follow instructions to bring three objects from another room' },
    { id: 'T11', desc: 'Play a memory game to see how many can be recalled' },
    { id: 'T12', desc: 'Review: General cognitive observation' },
    { id: 'T13', desc: 'Review: Problem solving observation' },
    { id: 'T14', desc: 'Final Review: Overall readiness' },
];

interface AssessmentPageProps {
    userRole: UserRole;
    user?: any;
}

export const AssessmentPage: React.FC<AssessmentPageProps> = ({ userRole, user }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [student, setStudent] = useState<Student | null>(null);
    const [selectedDay, setSelectedDay] = useState<number>(1);
    const [viewMode, setViewMode] = useState<'DAILY' | 'PARENT'>('DAILY');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ show: false, msg: '', type: 'success' as 'success' | 'error' });
    
    // Transfer Modal State
    const [transferModalOpen, setTransferModalOpen] = useState(false);
    const [transferClass, setTransferClass] = useState('');

    // Day Form State
    const [formState, setFormState] = useState({
        numbers: 0,
        reading: 0,
        selfCare: 0,
        behaviour: 0,
        senses: 0,
        thinkingResponse: '', 
        abcLogs: [] as ABCLog[]
    });

    // ABC Modal State
    const [isAbcModalOpen, setIsAbcModalOpen] = useState(false);
    const [newAbc, setNewAbc] = useState<Partial<ABCLog>>({
        antecedent: '',
        behaviour: '',
        consequence: '',
        isPositive: false
    });

    useEffect(() => {
        const fetchStudent = async () => {
            if (id) {
                const s = await getStudentById(id);
                setStudent(s);
                loadDayData(s, selectedDay);
            }
            setLoading(false);
        };
        fetchStudent();
    }, [id]);

    const loadDayData = (s: Student | null, day: number) => {
        if (!s || !s.assessment || !s.assessment.teacherAssessments[day]) {
            setFormState({
                numbers: 0, reading: 0, selfCare: 0, behaviour: 0, senses: 0,
                thinkingResponse: '',
                abcLogs: []
            });
            return;
        }

        const data = s.assessment.teacherAssessments[day];
        setFormState({
            numbers: data.scores.numbers,
            reading: data.scores.reading,
            selfCare: data.scores.selfCare,
            behaviour: data.scores.behaviour,
            senses: data.scores.senses,
            thinkingResponse: data.thinkingTask?.response || '',
            abcLogs: data.abcLogs || [] 
        });
    };

    const handleDaySelect = (day: number) => {
        setSelectedDay(day);
        setViewMode('DAILY');
        loadDayData(student, day);
    };

    const handleMainScoreChange = (field: string, val: string) => {
        const num = parseInt(val) || 0;
        setFormState(prev => ({ ...prev, [field]: Math.min(5, Math.max(0, num)) }));
    };

    const handleAddAbcLog = () => {
        if (!newAbc.behaviour) return; 

        const log: ABCLog = {
            id: uuidv4(),
            antecedent: newAbc.antecedent || 'N/A',
            behaviour: newAbc.behaviour || '',
            consequence: newAbc.consequence || 'N/A',
            isPositive: newAbc.isPositive || false,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setFormState(prev => ({
            ...prev,
            abcLogs: [...prev.abcLogs, log]
        }));
        
        setNewAbc({ antecedent: '', behaviour: '', consequence: '', isPositive: false });
        setIsAbcModalOpen(false);
    };

    const removeAbcLog = (logId: string) => {
        setFormState(prev => ({
            ...prev,
            abcLogs: prev.abcLogs.filter(log => log.id !== logId)
        }));
    };

    const handleSaveDay = async () => {
        if (!student || !id) return;
        setSaving(true);

        // Calculate Scores
        let thinkingScore = 0;
        if (formState.thinkingResponse === 'Yes') thinkingScore = 5;
        else if (formState.thinkingResponse === 'Yes with help') thinkingScore = 2.5;

        // ABC Score
        let abcScore = 0;
        if (formState.abcLogs.length > 0) {
            const totalAbc = formState.abcLogs.reduce((acc, log) => acc + (log.isPositive ? 5 : 0), 0);
            abcScore = parseFloat((totalAbc / formState.abcLogs.length).toFixed(2));
        } else {
             abcScore = 3; 
        }

        const dayData: AssessmentDay = {
            completed: true,
            date: new Date().toISOString(),
            scores: {
                numbers: formState.numbers,
                reading: formState.reading,
                selfCare: formState.selfCare,
                behaviour: formState.behaviour,
                senses: formState.senses
            },
            thinkingTask: {
                taskId: THINKING_TASKS[selectedDay - 1].id,
                description: THINKING_TASKS[selectedDay - 1].desc,
                response: formState.thinkingResponse as any
            },
            thinkingScore,
            abcScore,
            abcLogs: formState.abcLogs
        };

        await saveTeacherAssessmentDay(id, selectedDay, dayData);
        const updatedStudent = await getStudentById(id);
        setStudent(updatedStudent);
        setSaving(false);
        setToast({ show: true, msg: `Day ${selectedDay} Saved.`, type: 'success' });
    };

    const handleFinalize = async () => {
        if (!student || !id) return;
        
        if (window.confirm("Are you sure you want to finalize this assessment? This will calculate the final stage and enroll the student into the class.")) {
            setSaving(true);
            try {
                const assignedClass = await calculateFinalStage(id);
                if (assignedClass) {
                    const updatedStudent = await getStudentById(id);
                    setStudent(updatedStudent);
                    
                    // Check for transfer
                    if (user && user.assignedClass && assignedClass !== user.assignedClass && userRole === UserRole.TEACHER) {
                        setTransferClass(assignedClass);
                        setTransferModalOpen(true);
                    } else {
                        setToast({ show: true, msg: `Assessment Finalized! Student placed in ${assignedClass}`, type: 'success' });
                    }
                } else {
                    setToast({ show: true, msg: "Failed to finalize. Please ensure all 14 days are recorded.", type: 'error' });
                }
            } catch (e) {
                console.error("Finalization failed", e);
                setToast({ show: true, msg: "System error during finalization.", type: 'error' });
            }
            setSaving(false);
        }
    };

    if (loading || !student) return <Loader />;

    const isReadOnly = userRole === UserRole.ADMIN || student.assessment?.isComplete;
    const completedDaysCount = student.assessment?.teacherAssessments ? Object.values(student.assessment.teacherAssessments).filter((d:any) => d.completed).length : 0;
    const isReadyToFinalize = completedDaysCount === 14;
    const isCompleted = student.assessment?.isComplete;

    return (
        <div className="pb-20 relative">
            <Toast message={toast.msg} isVisible={toast.show} onClose={() => setToast({...toast, show: false})} variant={toast.type} />
            
            {/* Transfer Modal */}
            {transferModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-md shadow-2xl border-t-8 border-orange-500 rounded-lg overflow-hidden">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
                                <ArrowRight size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Transferring Student</h3>
                            <p className="text-gray-600 mb-4">
                                Based on the assessment, {student.name} has been assigned to:
                            </p>
                            <div className="bg-orange-50 border border-orange-200 text-orange-900 font-bold text-lg py-2 px-4 rounded mb-6 inline-block">
                                {transferClass}
                            </div>
                            <p className="text-xs text-gray-500 mb-6">
                                The student will be moved from your class list to the new class register.
                            </p>
                            <Button fullWidth onClick={() => { setTransferModalOpen(false); navigate('/teacher/dashboard'); }}>
                                Acknowledge & Return to Dashboard
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ABC Log Modal */}
            {isAbcModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white w-full max-w-lg shadow-2xl border-t-8 border-coha-900 animate-fade-in rounded-none">
                         <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-coha-900 flex items-center gap-2">
                                <ClipboardList size={24}/> Add ABC Log
                            </h3>
                            <button onClick={() => setIsAbcModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Antecedent (A)</label>
                                <textarea 
                                    className="w-full p-3 border-2 border-gray-300 outline-none rounded bg-gray-50 h-20 text-sm focus:border-coha-500" 
                                    placeholder="What happened immediately before the behaviour?"
                                    value={newAbc.antecedent} 
                                    onChange={(e) => setNewAbc({...newAbc, antecedent: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Behaviour (B)</label>
                                <div className="flex gap-2 mb-2">
                                    <button onClick={() => setNewAbc({...newAbc, isPositive: true})} className={`flex-1 py-1 text-xs font-bold rounded ${newAbc.isPositive ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>Positive</button>
                                    <button onClick={() => setNewAbc({...newAbc, isPositive: false})} className={`flex-1 py-1 text-xs font-bold rounded ${!newAbc.isPositive ? 'bg-red-500 text-white' : 'bg-gray-100'}`}>Negative</button>
                                </div>
                                <textarea 
                                    className="w-full p-3 border-2 border-gray-300 outline-none rounded bg-gray-50 h-20 text-sm focus:border-coha-500" 
                                    placeholder="What exactly did the learner do?"
                                    value={newAbc.behaviour} 
                                    onChange={(e) => setNewAbc({...newAbc, behaviour: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Consequence (C)</label>
                                <textarea 
                                    className="w-full p-3 border-2 border-gray-300 outline-none rounded bg-gray-50 h-20 text-sm focus:border-coha-500" 
                                    placeholder="What happened immediately after?"
                                    value={newAbc.consequence} 
                                    onChange={(e) => setNewAbc({...newAbc, consequence: e.target.value})} 
                                />
                            </div>
                            <Button fullWidth onClick={handleAddAbcLog} disabled={!newAbc.behaviour}><Plus size={20} /> Add Entry</Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 bg-white border hover:bg-gray-50">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-coha-900">{student.name}</h2>
                    <p className="text-gray-600">14-Day Observation Assessment</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-4 shadow-sm border border-gray-200 sticky top-24">
                        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Calendar size={18}/> Assessment Days</h3>
                        
                        <div className="grid grid-cols-4 gap-2">
                            {Array.from({ length: 14 }, (_, i) => i + 1).map((day) => {
                                const dayData = student.assessment?.teacherAssessments?.[day];
                                const isCompleted = dayData?.completed;
                                const isSelected = day === selectedDay && viewMode === 'DAILY';
                                const percentage = calculateDayPercentage(dayData);
                                
                                return (
                                    <button
                                        key={day}
                                        onClick={() => handleDaySelect(day)}
                                        className={`aspect-square flex flex-col items-center justify-center border-2 transition-all rounded-lg relative overflow-hidden
                                            ${isSelected ? 'border-coha-900 bg-coha-900 text-white scale-105 shadow-md' : 
                                              isCompleted ? 'border-green-500 bg-green-50 text-green-700' : 
                                              'border-gray-200 bg-gray-50 text-gray-400 hover:border-coha-300 hover:text-coha-500'}
                                        `}
                                    >
                                        <span className="font-bold text-sm">{day}</span>
                                        {isCompleted && <span className="text-[10px] font-bold">{percentage}%</span>}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <div className="mt-6 border-t pt-4 space-y-2">
                             <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Input Sources</h4>
                            <button 
                                onClick={() => setViewMode('PARENT')}
                                className={`w-full text-left p-3 rounded-lg flex items-center gap-2 transition-colors border-2 ${viewMode === 'PARENT' ? 'bg-purple-50 border-purple-500 text-purple-900 font-bold' : 'bg-white border-transparent hover:bg-gray-50 text-gray-700'}`}
                            >
                                <Heart size={18} className={viewMode === 'PARENT' ? 'text-purple-600' : 'text-gray-400'} />
                                <div className="flex-1">
                                    <span className="block text-sm">Parent Input</span>
                                    <span className="text-[10px] text-gray-500">Self Care (S)</span>
                                </div>
                                {student.assessment?.parentSelfCare && <CheckCircle size={14} className="text-green-500" />}
                            </button>
                        </div>

                        {/* FINALIZATION ACTION AREA */}
                        <div className="mt-6 border-t pt-4">
                            <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Finalization</h4>
                            {isCompleted ? (
                                <div className="text-center bg-green-100 text-green-800 p-4 rounded font-bold border border-green-200 shadow-sm">
                                    <CheckCircle className="mx-auto mb-2" size={32} />
                                    Assessment Closed
                                    <span className="block text-xs mt-2 font-normal text-green-700">Assigned to:</span>
                                    <span className="block text-lg font-bold mt-1">{student.assignedClass}</span>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="text-xs text-gray-600">Days Completed: <strong>{completedDaysCount} / 14</strong></div>
                                    <Button 
                                        fullWidth 
                                        onClick={handleFinalize} 
                                        disabled={!isReadyToFinalize || saving}
                                        className={isReadyToFinalize ? "bg-green-600 hover:bg-green-700 border-none shadow-lg animate-pulse" : "opacity-50 cursor-not-allowed"}
                                    >
                                        {saving ? 'Processing...' : (
                                            <span className="flex items-center gap-2"><PlayCircle size={18} /> Complete Assessment</span>
                                        )}
                                    </Button>
                                    {!isReadyToFinalize && <p className="text-[10px] text-red-500 text-center italic">All 14 days must be recorded.</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {viewMode === 'PARENT' ? (
                        <div className="bg-white p-6 shadow-sm border border-purple-200 animate-fade-in relative">
                             <h3 className="text-xl font-bold text-purple-900 mb-6 flex items-center gap-2">
                                <User size={24} /> Parent Self-Care Assessment
                            </h3>
                            {!student.assessment?.parentSelfCare ? (
                                <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-300 rounded">
                                    <p className="text-gray-500 font-medium">The parent has not submitted the assessment yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-purple-50 p-4 rounded-lg flex justify-between items-center border border-purple-100">
                                        <div><p className="text-sm font-bold text-purple-900">Submitted: {new Date(student.assessment.parentSelfCare.completedDate).toLocaleDateString()}</p></div>
                                        <div><p className="text-2xl font-bold text-purple-900">{student.assessment.parentSelfCare.calculatedScore} / 5.0</p></div>
                                    </div>
                                    <div className="bg-white border border-gray-200 p-4 rounded"><p className="italic text-gray-600">"{student.assessment.parentSelfCare.comments}"</p></div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-coha-900 flex items-center gap-2">
                                    <span className="bg-coha-100 text-coha-900 w-8 h-8 flex items-center justify-center rounded-full text-sm">{selectedDay}</span>
                                    Day {selectedDay} Assessment
                                </h3>
                                {student.assessment?.teacherAssessments?.[selectedDay]?.completed && (
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        <CheckCircle size={14} /> Completed
                                    </span>
                                )}
                            </div>

                            {/* Main Scores (Dropdown 0-5) */}
                            <div className="bg-white p-6 shadow-sm border border-gray-200">
                                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                                    <Activity className="text-coha-500" size={20}/> Daily Observation (Score 0-5)
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                                    {['Numbers', 'Reading', 'SelfCare', 'Behaviour', 'Senses'].map((field) => (
                                        <div key={field}>
                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{field}</label>
                                            <select 
                                                value={(formState as any)[field.charAt(0).toLowerCase() + field.slice(1)]}
                                                onChange={(e) => !isReadOnly && handleMainScoreChange(field.charAt(0).toLowerCase() + field.slice(1), e.target.value)}
                                                className="w-full p-2 border-2 border-gray-300 focus:border-coha-500 font-bold text-center text-lg rounded-none bg-gray-50"
                                                disabled={isReadOnly}
                                            >
                                                {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Thinking Task */}
                             <div className="bg-white p-6 shadow-sm border border-gray-200">
                                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                                    <Brain className="text-purple-500" size={20}/> Learn to Think
                                </h4>
                                <p className="mb-4">{THINKING_TASKS[selectedDay - 1].desc}</p>
                                <div className="flex gap-4">
                                    {['Yes', 'Yes with help', 'No'].map(opt => (
                                        <button key={opt} onClick={() => !isReadOnly && setFormState(prev => ({...prev, thinkingResponse: opt}))} className={`flex-1 py-3 border-2 font-bold ${formState.thinkingResponse === opt ? 'bg-purple-600 text-white' : 'bg-white'}`} disabled={isReadOnly}>{opt}</button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* ABC Logs */}
                            <div className="bg-white p-6 shadow-sm border border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-gray-800 flex gap-2"><ClipboardList className="text-orange-500"/> ABC Logs</h4>
                                    {!isReadOnly && !isCompleted && <Button onClick={() => setIsAbcModalOpen(true)} className="py-1 px-3 text-sm"><Plus size={16}/> Add</Button>}
                                </div>
                                <div className="space-y-4">
                                    {formState.abcLogs.map(log => (
                                        <div key={log.id} className={`border p-3 rounded-lg ${log.isPositive ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}`}>
                                            <div className="flex justify-between font-bold text-xs uppercase mb-2">
                                                <span>{log.time}</span>
                                                <span className={log.isPositive ? 'text-green-600' : 'text-red-600'}>{log.isPositive ? 'Positive' : 'Negative'}</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-1 text-sm bg-gray-50 p-2 rounded">
                                                <p><span className="font-bold text-gray-500 w-6 inline-block">A:</span> {log.antecedent}</p>
                                                <p><span className="font-bold text-coha-900 w-6 inline-block">B:</span> {log.behaviour}</p>
                                                <p><span className="font-bold text-gray-500 w-6 inline-block">C:</span> {log.consequence}</p>
                                            </div>
                                            {!isReadOnly && <button onClick={() => removeAbcLog(log.id)} className="text-red-400 text-xs mt-2 underline">Remove</button>}
                                        </div>
                                    ))}
                                    {formState.abcLogs.length === 0 && <p className="text-center text-gray-400 italic">No logs recorded.</p>}
                                </div>
                            </div>

                            {!isReadOnly && !isCompleted && (
                                <div className="flex justify-end pt-4">
                                    <Button onClick={handleSaveDay} disabled={saving} className="w-full md:w-auto px-8 py-4 text-lg">
                                        {saving ? 'Saving...' : `Complete Day ${selectedDay}`}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};