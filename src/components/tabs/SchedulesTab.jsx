import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mapa para traducir los días al español
const diasES = {
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo"
};

// Función para formatear hora tipo "08:30" en vez de "08:30:00"
const formatearHora = (hora) => {
    if (!hora) return '';
    return hora.slice(0,5); // toma solo "HH:MM"
}

export function SchedulesTab({ schedules, students, onNewSchedule, onEditSchedule, onDeleteSchedule }) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Gestión de Horarios</h2>
                    <p className="text-muted-foreground">Administra los horarios de entrenamiento</p>
                </div>
                <Button onClick={onNewSchedule} className="bg-purple-600 text-white hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Horario
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {schedules.map((schedule) => {
                        // ✅ Solo contar alumnos activos
                        const studentsInSchedule = students.filter(student =>
                            student.is_active && student.schedule && student.schedule.includes(`${schedule.startTime}-${schedule.endTime}`)
                        ).length;

                        return (
                            <motion.div
                                key={schedule.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="glass-effect border-border rounded-lg p-6 card-hover"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground">{schedule.name}</h3>
                                        <p className="text-muted-foreground text-sm">{schedule.description}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button size="icon" variant="ghost" onClick={() => onEditSchedule(schedule)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => onDeleteSchedule(schedule.id)}
                                            className="text-destructive hover:text-destructive/80"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Días:</span>
                                        <span className="text-foreground font-medium">
                                            {Array.isArray(schedule.days)
                                                ? schedule.days.map(d => diasES[d]).join(', ')
                                                : 'Sin días'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Horario:</span>
                                        <span className="text-foreground font-medium">
                                            {schedule.startTime && schedule.endTime
                                                ? `${formatearHora(schedule.startTime)} - ${formatearHora(schedule.endTime)}`
                                                : 'Sin horario'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Alumnos:</span>
                                        <span className="text-foreground font-medium">{studentsInSchedule}</span>
                                    </div>
                                    {schedule.maxCapacity && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Capacidad:</span>
                                            <span className="text-foreground font-medium">
                                                {studentsInSchedule} / {schedule.maxCapacity}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {schedules.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                >
                    <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No hay horarios configurados</h3>
                    <p className="text-muted-foreground mb-4">Crea tu primer horario de entrenamiento</p>
                    <Button onClick={onNewSchedule} className="bg-purple-600 text-white hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Crear Primer Horario
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
