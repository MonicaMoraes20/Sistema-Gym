import React from 'react';
import { Calendar as CalendarComponent } from '@/components/Calendar';

export function CalendarTab({ schedules, students }) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-foreground">Calendario de Actividades</h2>
                <p className="text-muted-foreground">Visualiza todos los horarios y actividades del gimnasio</p>
            </div>
            <CalendarComponent schedules={schedules} students={students} />
        </div>
    );
}