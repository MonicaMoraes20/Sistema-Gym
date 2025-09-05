import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DAYS_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function Calendar({ schedules = [], students = [] }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);

    const getWeeksInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();

        const weeks = [];
        let week = [];

        for (let day = 1; day <= lastDay; day++) {
            const current = new Date(year, month, day);
            let dayOfWeek = current.getDay();
            dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

            if (day === 1 && dayOfWeek > 0) {
                for (let i = 0; i < dayOfWeek; i++) week.push(null);
            }

            week.push({ date: current, isCurrentMonth: true });

            if (week.length === 7) {
                weeks.push(week);
                week = [];
            }
        }

        if (week.length > 0) {
            while (week.length < 7) week.push(null);
            weeks.push(week);
        }

        return weeks;
    };

    const getSchedulesForDay = (date) => {
        const dayMap = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
        const dayOfWeek = dayMap[date.getDay()];

        // Protección: schedule.days puede ser null o undefined
        return schedules.filter(schedule => Array.isArray(schedule.days) && schedule.days.includes(dayOfWeek));
    };

    const getStudentsInSchedule = (schedule) => {
        // Protección: student.schedule puede ser null o undefined
        return students.filter(student =>
            student.schedule?.includes(`${schedule.startTime}-${schedule.endTime}`)
        ).length;
    };

    const navigateMonth = (direction) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev.getFullYear(), prev.getMonth() + direction, 1);
            setSelectedDay(null);
            return newDate;
        });
    };

    const weeks = getWeeksInMonth(currentDate);

    // Filtrar solo los días del mes actual
    const daysOfCurrentMonth = weeks.flat().filter(day => day && day.date.getMonth() === currentDate.getMonth());

    return (
        <Card className="glass-effect border-border">
            <CardHeader>
                <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                    <CardTitle className="text-foreground text-xl">Calendario de Actividades</CardTitle>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)} className="border-border text-foreground hover:bg-accent">
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-foreground font-medium min-w-[150px] text-center">
                            {MONTHS_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => navigateMonth(1)} className="border-border text-foreground hover:bg-accent">
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <select
                        className="border p-1 rounded text-sm"
                        value={selectedDay || ''}
                        onChange={(e) => setSelectedDay(e.target.value)}
                    >
                        <option value="">Todos los días de {MONTHS_NAMES[currentDate.getMonth()]}</option>
                        {daysOfCurrentMonth.map(day => (
                            <option key={day.date.toISOString()} value={day.date.toISOString()}>
                                {day.date.getDate()} {MONTHS_NAMES[currentDate.getMonth()]}
                            </option>
                        ))}
                    </select>
                </div>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-7 gap-1">
                    {DAYS_NAMES.map(day => (
                        <div key={day} className="p-2 text-center text-muted-foreground font-medium text-sm">{day}</div>
                    ))}

                    {weeks.map((week, wi) =>
                        week.map((day, di) => {
                            if (!day) return <div key={`${wi}-${di}`} className="p-2 text-muted-foreground/50"></div>;
                            if (selectedDay && day.date.toISOString() !== selectedDay) return null;

                            const daySchedules = getSchedulesForDay(day.date);
                            const isToday = day.date.toDateString() === new Date().toDateString();

                            return (
                                <motion.div
                                    key={`${wi}-${di}`}
                                    className={`calendar-cell p-1 ${isToday ? 'bg-primary/20 border-primary' : ''}`}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="text-xs font-medium mb-1">{day.date.getDate()}</div>
                                    <div className="space-y-1">
                                        {daySchedules.map(schedule => {
                                            const studentCount = getStudentsInSchedule(schedule);
                                            return (
                                                <div key={schedule.id} className="schedule-item flex items-center justify-between" title={`${schedule.name} - ${studentCount} alumnos`}>
                                                    <span className="truncate flex-1">{schedule.startTime || 'Sin horario'}</span>
                                                    {studentCount > 0 && (
                                                        <div className="flex items-center ml-1">
                                                            <Users className="w-2 h-2 mr-1" />
                                                            <span>{studentCount}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>

                <div className="mt-4 text-xs text-muted-foreground">
                    <p>• Los horarios se muestran con el número de alumnos inscritos</p>
                    <p>• El día actual está resaltado en morado</p>
                </div>
            </CardContent>
        </Card>
    );
}
