import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Users, DollarSign, Calendar, Clock } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Header } from '@/components/Header';
import { StudentForm } from '@/components/StudentForm';
import { PaymentForm } from '@/components/PaymentForm';
import { ScheduleForm } from '@/components/ScheduleForm';
import { StudentsTab } from '@/components/tabs/StudentsTab';
import { PaymentsTab } from '@/components/tabs/PaymentsTab';
import { SchedulesTab } from '@/components/tabs/SchedulesTab';
import { CalendarTab } from '@/components/tabs/CalendarTab';
import { supabase } from "../../supabaseClient.js";

export function Dashboard({ onLogout }) {
    const [students, setStudents] = useState([]);
    const [payments, setPayments] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [activeTab, setActiveTab] = useState('students');
    const [userId, setUserId] = useState(null);

    const [showStudentForm, setShowStudentForm] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [showScheduleForm, setShowScheduleForm] = useState(false);

    const [editingStudent, setEditingStudent] = useState(null);
    const [editingSchedule, setEditingSchedule] = useState(null);

    const { toast } = useToast();

    // --- Fetch user ID ---
    useEffect(() => {
        const getUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                console.error("❌ Error obteniendo usuario:", error);
                return;
            }
            if (user) setUserId(user.id);
        };
        getUser();
    }, []);

    // --- Fetch ---
    const fetchStudents = async () => {
        const { data, error } = await supabase.from('students').select('*');
        if (error) console.error(error);
        else setStudents(data || []);
    };

    const fetchPayments = async () => {
        const { data, error } = await supabase.from('payments').select('*');
        if (error) console.error(error);
        else setPayments(data || []);
    };

    const fetchSchedules = async () => {
        const { data, error } = await supabase.from('schedules').select('*');
        if (error) console.error(error);
        else {
            const normalized = (data || []).map(s => ({
                ...s,
                startTime: s.start_time,
                endTime: s.end_time,
                maxCapacity: s.max_capacity
            }));
            setSchedules(normalized);
        }
    };

    // --- Helpers ---
    const sameId = (a, b) => String(a) === String(b);

    const getLastPaymentDate = (studentId) => {
        const studentPayments = payments.filter(p => sameId(p.student_id, studentId));
        if (!studentPayments.length) return null;
        const latest = studentPayments
            .map(p => new Date(p.payment_date))
            .reduce((max, d) => (d > max ? d : max), new Date(studentPayments[0].payment_date));
        return latest;
    };

    const decoratedStudents = useMemo(() => {
        return students.map(s => ({
            ...s,
            lastName: s.last_name ?? s.lastName ?? '',
            lastPaymentDate: getLastPaymentDate(s.id)
        }));
    }, [students, payments]);

    useEffect(() => {
        fetchStudents();
        fetchPayments();
        fetchSchedules();

        // --- Realtime ---
        const studentsChannel = supabase
            .channel('public:students')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, payload => {
                setStudents(prev => {
                    if (payload.eventType === 'INSERT') return [...prev, payload.new];
                    if (payload.eventType === 'UPDATE') return prev.map(s => sameId(s.id, payload.new.id) ? payload.new : s);
                    if (payload.eventType === 'DELETE') return prev.filter(s => !sameId(s.id, payload.old.id));
                    return prev;
                });
            })
            .subscribe();

        const paymentsChannel = supabase
            .channel('public:payments')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, payload => {
                setPayments(prev => {
                    if (payload.eventType === 'INSERT') return [...prev, payload.new];
                    if (payload.eventType === 'UPDATE') return prev.map(p => sameId(p.id, payload.new.id) ? payload.new : p);
                    if (payload.eventType === 'DELETE') return prev.filter(p => !sameId(p.id, payload.old.id));
                    return prev;
                });
            })
            .subscribe();

        const schedulesChannel = supabase
            .channel('public:schedules')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, payload => {
                const normalized = {
                    ...payload.new,
                    startTime: payload.new.start_time,
                    endTime: payload.new.end_time,
                    maxCapacity: payload.new.max_capacity
                };
                setSchedules(prev => {
                    if (payload.eventType === 'INSERT') return [...prev, normalized];
                    if (payload.eventType === 'UPDATE') return prev.map(s => sameId(s.id, normalized.id) ? normalized : s);
                    if (payload.eventType === 'DELETE') return prev.filter(s => !sameId(s.id, payload.old.id));
                    return prev;
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(studentsChannel);
            supabase.removeChannel(paymentsChannel);
            supabase.removeChannel(schedulesChannel);
        };
    }, []);

    // --- Handlers ---
    const handleSaveStudent = () => {
        setEditingStudent(null);
        setShowStudentForm(false);
    };

    const handleEditStudent = (student) => {
        setEditingStudent(student);
        setShowStudentForm(true);
    };

    const handleDeleteStudent = async (studentId) => {
        const { error } = await supabase.from('students').delete().eq('id', studentId);
        if (error) toast({ title: "Error al eliminar", description: error.message, variant: "destructive" });
        else toast({ title: "Alumno eliminado correctamente" });
    };

    const handleSavePayment = async (paymentData) => {
        try {
            const { error: paymentError } = await supabase
                .from("payments")
                .insert([{
                    student_id: paymentData.studentId,
                    amount: paymentData.amount,
                    payment_date: paymentData.paymentDate,
                    current_weight: paymentData.currentWeight || null,
                }]);

            if (paymentError) throw paymentError;
        } catch (err) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    };

    const handleSaveSchedule = async (scheduleData) => {
        try {
            if (scheduleData.id) {
                const { error } = await supabase.from('schedules').update({
                    name: scheduleData.name,
                    days: scheduleData.days,
                    start_time: scheduleData.startTime,
                    end_time: scheduleData.endTime,
                    max_capacity: scheduleData.maxCapacity,
                    description: scheduleData.description
                }).eq('id', scheduleData.id);

                if (error) throw error;
                toast({ title: "Horario actualizado correctamente" });
            } else {
                const { error } = await supabase.from('schedules').insert([{
                    name: scheduleData.name,
                    days: scheduleData.days,
                    start_time: scheduleData.startTime,
                    end_time: scheduleData.endTime,
                    max_capacity: scheduleData.maxCapacity,
                    description: scheduleData.description
                }]);

                if (error) throw error;
                toast({ title: "Horario creado correctamente" });
            }

            setEditingSchedule(null);
            setShowScheduleForm(false);

        } catch (err) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    };

    const handleEditSchedule = (schedule) => {
        setEditingSchedule(schedule);
        setShowScheduleForm(true);
    };

    const handleDeleteSchedule = async (scheduleId) => {
        const { error } = await supabase.from('schedules').delete().eq('id', scheduleId);
        if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
        toast({ title: "Horario eliminado correctamente" });
    };

    const calculateMonthlyIncome = () => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlyPayments = payments.filter(payment => {
            const paymentDate = new Date(payment.payment_date);
            return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
        });

        const total = monthlyPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

        toast({
            title: "Ingresos del mes",
            description: `Total: $${total.toLocaleString()} (${monthlyPayments.length} pagos)`,
        });
    };

    // --- Render ---
    return (
        <div className="min-h-screen bg-background">
            <Header onLogout={onLogout} userId={userId} />

            <main className="container mx-auto p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 glass-effect border-border">
                        <TabsTrigger value="students" className="flex items-center space-x-2">
                            <Users className="w-4 h-4" /><span>Alumnos</span>
                        </TabsTrigger>
                        <TabsTrigger value="payments" className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4" /><span>Pagos</span>
                        </TabsTrigger>
                        <TabsTrigger value="schedules" className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" /><span>Horarios</span>
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" /><span>Calendario</span>
                        </TabsTrigger>
                    </TabsList>

                    <AnimatePresence mode="wait">
                        {activeTab === "students" && (
                            <motion.div key="students" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                                <StudentsTab
                                    students={decoratedStudents}
                                    onNewStudent={() => { setEditingStudent(null); setShowStudentForm(true); }}
                                    onEditStudent={handleEditStudent}
                                    onDeleteStudent={handleDeleteStudent}
                                />
                            </motion.div>
                        )}

                        {activeTab === "payments" && (
                            <motion.div key="payments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                                <PaymentsTab
                                    students={students}
                                    payments={payments}
                                    onNewPayment={() => setShowPaymentForm(true)}
                                    onCalculateIncome={calculateMonthlyIncome}
                                    onNavigateToStudents={() => setActiveTab('students')}
                                />
                            </motion.div>
                        )}

                        {activeTab === "schedules" && (
                            <motion.div key="schedules" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                                <SchedulesTab
                                    schedules={schedules}
                                    students={students}
                                    onNewSchedule={() => { setEditingSchedule(null); setShowScheduleForm(true); }}
                                    onEditSchedule={handleEditSchedule}
                                    onDeleteSchedule={handleDeleteSchedule}
                                />
                            </motion.div>
                        )}

                        {activeTab === "calendar" && (
                            <motion.div key="calendar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                                <CalendarTab schedules={schedules} students={students} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Tabs>
            </main>

            <StudentForm
                isOpen={showStudentForm}
                onClose={() => { setShowStudentForm(false); setEditingStudent(null); }}
                onSave={handleSaveStudent}
                student={editingStudent}
                schedules={schedules}
            />

            <PaymentForm
                isOpen={showPaymentForm}
                onClose={() => setShowPaymentForm(false)}
                onSave={handleSavePayment}
                students={students}
            />

            <ScheduleForm
                isOpen={showScheduleForm}
                onClose={() => { setShowScheduleForm(false); setEditingSchedule(null); }}
                onSave={handleSaveSchedule}
                schedule={editingSchedule}
            />
        </div>
    );
}
