import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function Statistics({ students = [], payments = [] }) {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

    // 🔹 Filtra pagos por mes y año seleccionados
    const filteredPayments = useMemo(() => {
        return payments.filter(payment => {
            const paymentDate = new Date(payment.payment_date);
            return paymentDate.getMonth() === selectedMonth && paymentDate.getFullYear() === selectedYear;
        });
    }, [payments, selectedMonth, selectedYear]);

    // 🔹 Total de ingresos del mes
    const monthlyIncome = filteredPayments.reduce((total, p) => total + p.amount, 0);

    // 🔹 Chequea si un pago sigue vigente (1 mes de validez, con ajuste de fechas)
    const isPaymentValid = (lastPaymentDate) => {
        if (!lastPaymentDate) return false;
        const date = new Date(lastPaymentDate);
        const expiry = new Date(date);
        expiry.setMonth(expiry.getMonth() + 1);

        // Ajuste para meses con menos días
        if (expiry.getDate() !== date.getDate()) expiry.setDate(0);

        expiry.setHours(23, 59, 59, 999);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return today <= expiry;
    };

    // 🔹 Cálculos principales
    const activeStudents = students.filter(s => isPaymentValid(s.last_payment)).length;
    const overduePayments = students.filter(s => !isPaymentValid(s.last_payment)).length;
    const studentsWithPathologies = students.filter(s => s.pathology && s.pathology.trim() !== '').length;

    // 🔹 Evolución de peso
    const weightEvolution = students.map(student => {
        const studentPayments = payments
            .filter(p => p.student_id === student.id && p.currentWeight)
            .sort((a, b) => new Date(a.payment_date) - new Date(b.payment_date));

        const initialWeight = parseFloat(student.initial_weight) || 0;
        const currentWeight =
            studentPayments.length > 0
                ? studentPayments[studentPayments.length - 1].currentWeight
                : initialWeight;

        const weightChange = currentWeight - initialWeight;

        return {
            name: `${student.name} ${student.lastName}`,
            initialWeight,
            currentWeight,
            weightChange
        };
    }).filter(s => s.initialWeight || s.currentWeight);

    const stats = [
        {
            title: 'Ingresos del Mes',
            value: `$${monthlyIncome.toLocaleString()}`,
            icon: DollarSign,
            color: 'from-green-500 to-emerald-600',
            description: `${filteredPayments.length} pagos registrados`
        },
        {
            title: 'Alumnos Activos',
            value: activeStudents,
            icon: Users,
            color: 'from-blue-500 to-cyan-600',
            description: 'Con pagos al día'
        },
        {
            title: 'Pagos Vencidos',
            value: overduePayments,
            icon: AlertTriangle,
            color: 'from-red-500 to-pink-600',
            description: 'Requieren seguimiento'
        },
        {
            title: 'Con Patologías',
            value: studentsWithPathologies,
            icon: AlertTriangle,
            color: 'from-orange-500 to-yellow-600',
            description: 'Requieren atención especial'
        }
    ];

    return (
        <div className="space-y-6">
            {/* 🔹 Filtros */}
            <Card className="glass-effect border-border">
                <CardHeader>
                    <CardTitle className="text-foreground flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Filtros de Estadísticas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-foreground text-sm">Mes</label>
                            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                                <SelectTrigger className="bg-secondary border-border text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((month, i) => (
                                        <SelectItem key={i} value={i.toString()}>{month}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-foreground text-sm">Año</label>
                            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                                <SelectTrigger className="bg-secondary border-border text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map(year => (
                                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 🔹 Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="glass-effect border-border card-hover">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
                                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                                    <p className="text-muted-foreground text-xs mt-1">{stat.description}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* 🔹 Evolución de peso */}
            {weightEvolution.length > 0 && (
                <Card className="glass-effect border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2" />
                            Evolución de Peso
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {weightEvolution.map((student, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                                >
                                    <div>
                                        <p className="text-foreground font-medium">{student.name}</p>
                                        <p className="text-muted-foreground text-sm">
                                            {student.initialWeight}kg → {student.currentWeight}kg
                                        </p>
                                    </div>
                                    <div
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            student.weightChange > 0
                                                ? 'bg-green-500/20 text-green-300'
                                                : student.weightChange < 0
                                                    ? 'bg-red-500/20 text-red-300'
                                                    : 'bg-gray-500/20 text-gray-300'
                                        }`}
                                    >
                                        {student.weightChange > 0 ? '+' : ''}{student.weightChange.toFixed(1)}kg
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
