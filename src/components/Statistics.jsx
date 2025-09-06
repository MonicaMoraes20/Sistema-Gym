import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, AlertTriangle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Statistics({ students = [], payments = [] }) {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedStudentId, setSelectedStudentId] = useState(null);

    const [pagosFiltrados, setPagosFiltrados] = useState([]);
    const [ingresosMes, setIngresosMes] = useState(0);
    const [alumnosActivos, setAlumnosActivos] = useState(0);
    const [pagosVencidos, setPagosVencidos] = useState(0);

    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

    // 🔹 Actualiza estadísticas cuando cambian pagos, mes o año
    useEffect(() => {
        const filtrados = payments.filter(payment => {
            const fecha = new Date(payment.payment_date);
            return fecha.getMonth() === selectedMonth && fecha.getFullYear() === selectedYear;
        });
        setPagosFiltrados(filtrados);
        setIngresosMes(filtrados.reduce((total, p) => total + p.amount, 0));
        setAlumnosActivos(
            students.filter(student => student.is_active && filtrados.some(p => p.student_id === student.id)).length
        );
        // ✅ Solo alumnos activos sin pago se cuentan como vencidos
        setPagosVencidos(
            students.filter(
                student => student.is_active && !filtrados.some(p => p.student_id === student.id)
            ).length
        );
    }, [payments, selectedMonth, selectedYear, students]);

    const alumnosConPatologias = students.filter(s => s.pathology && s.pathology.trim() !== '').length;

    // Historial de peso del alumno seleccionado
    const historialPeso = useMemo(() => {
        if (!selectedStudentId) return [];
        const pagosAlumno = payments
            .filter(p => p.student_id === selectedStudentId && p.current_weight)
            .sort((a, b) => new Date(a.payment_date) - new Date(b.payment_date));

        return pagosAlumno.map(p => {
            const fecha = new Date(p.payment_date);
            return {
                mesAno: `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`,
                peso: p.current_weight,
                esMesActual: fecha.getMonth() === new Date().getMonth() && fecha.getFullYear() === new Date().getFullYear()
            };
        });
    }, [selectedStudentId, payments]);

    const estadisticas = [
        {
            titulo: 'Ingresos del Mes',
            valor: `$${ingresosMes.toLocaleString()}`,
            icono: DollarSign,
            color: 'from-green-500 to-emerald-600',
            descripcion: `${pagosFiltrados.length} pagos registrados`
        },
        {
            titulo: 'Alumnos Activos',
            valor: alumnosActivos,
            icono: Users,
            color: 'from-blue-500 to-cyan-600',
            descripcion: 'Con pagos al día'
        },
        {
            titulo: 'Pagos Vencidos',
            valor: pagosVencidos,
            icono: AlertTriangle,
            color: 'from-red-500 to-pink-600',
            descripcion: 'Requieren seguimiento'
        },
        {
            titulo: 'Con Patologías',
            valor: alumnosConPatologias,
            icono: AlertTriangle,
            color: 'from-orange-500 to-yellow-600',
            descripcion: 'Requieren atención especial'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Filtros */}
            <Card className="glass-effect border-border">
                <CardHeader>
                    <CardTitle className="text-foreground flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Filtros de Estadísticas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-foreground text-sm">Mes</label>
                            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                                <SelectTrigger className="bg-secondary border-border text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 text-white">
                                    {meses.map((mes, i) => (
                                        <SelectItem key={i} value={i.toString()}>{mes}</SelectItem>
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
                                <SelectContent className="bg-gray-800 text-white">
                                    {anos.map(ano => (
                                        <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-foreground text-sm">Alumno</label>
                            <Select value={selectedStudentId || ""} onValueChange={(value) => setSelectedStudentId(parseInt(value))}>
                                <SelectTrigger className="bg-secondary border-border text-foreground">
                                    <SelectValue placeholder="Seleccionar alumno" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 text-white max-h-60 overflow-auto">
                                    {students.map(student => (
                                        <SelectItem key={student.id} value={student.id.toString()}>
                                            {student.name} {student.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {estadisticas.map((stat, index) => (
                    <motion.div
                        key={stat.titulo}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="glass-effect border-border card-hover">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm font-medium">{stat.titulo}</p>
                                    <p className="text-2xl font-bold text-foreground mt-1">{stat.valor}</p>
                                    <p className="text-muted-foreground text-xs mt-1">{stat.descripcion}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                                    <stat.icono className="w-6 h-6 text-white" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Gráfico de historial de peso */}
            {selectedStudentId && historialPeso.length > 0 && (
                <Card className="glass-effect border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">
                            Historial de Peso de {students.find(s => s.id === selectedStudentId)?.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
                            style={{ cursor: 'grab' }}
                            onMouseDown={(e) => {
                                const el = e.currentTarget;
                                el.style.cursor = 'grabbing';
                                const startX = e.pageX - el.offsetLeft;
                                const scrollLeft = el.scrollLeft;

                                const onMouseMove = (eMove) => {
                                    const x = eMove.pageX - el.offsetLeft;
                                    const walk = (x - startX) * 1;
                                    el.scrollLeft = scrollLeft - walk;
                                };

                                const onMouseUp = () => {
                                    el.style.cursor = 'grab';
                                    window.removeEventListener('mousemove', onMouseMove);
                                    window.removeEventListener('mouseup', onMouseUp);
                                };

                                window.addEventListener('mousemove', onMouseMove);
                                window.addEventListener('mouseup', onMouseUp);
                            }}
                        >
                            <div style={{ minWidth: `${historialPeso.length * 100}px`, height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={historialPeso}
                                        margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid stroke="#444" strokeDasharray="3 3" />
                                        <XAxis dataKey="mesAno" stroke="#fff" />
                                        <YAxis
                                            stroke="#fff"
                                            label={{
                                                value: 'Peso (kg)',
                                                angle: -90,
                                                position: 'insideLeft',
                                                fill: '#fff',
                                            }}
                                        />
                                        <Tooltip formatter={(value) => [`${value} kg`, 'Peso']} />
                                        <Line
                                            type="monotone"
                                            dataKey="peso"
                                            stroke="#00bfff"
                                            strokeWidth={2}
                                            dot={(dotProps) => {
                                                const { cx, cy, payload } = dotProps;
                                                const key = `dot-${payload.mesAno}`;
                                                if (payload.esMesActual) {
                                                    return (
                                                        <circle
                                                            key={key}
                                                            cx={cx}
                                                            cy={cy}
                                                            r={6}
                                                            fill="#ff6347"
                                                            stroke="#fff"
                                                            strokeWidth={2}
                                                        />
                                                    );
                                                }
                                                return (
                                                    <circle
                                                        key={key}
                                                        cx={cx}
                                                        cy={cy}
                                                        r={4}
                                                        fill="#00bfff"
                                                    />
                                                );
                                            }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <p className="text-sm mt-2 text-muted-foreground">
                            El punto rojo indica el mes actual.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
