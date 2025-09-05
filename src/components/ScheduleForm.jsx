import React, { useState, useEffect } from 'react';
import { Save, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const DAYS_OF_WEEK = [
    { id: 'monday', label: 'Lunes' },
    { id: 'tuesday', label: 'Martes' },
    { id: 'wednesday', label: 'Miércoles' },
    { id: 'thursday', label: 'Jueves' },
    { id: 'friday', label: 'Viernes' },
    { id: 'saturday', label: 'Sábado' },
    { id: 'sunday', label: 'Domingo' }
];

export function ScheduleForm({ isOpen, onClose, onSave, schedule = null }) {
    const [formData, setFormData] = useState({
        name: '',
        days: [],
        startTime: '',
        endTime: '',
        maxCapacity: '',
        description: ''
    });
    const { toast } = useToast();

    useEffect(() => {
        if (schedule) {
            setFormData({
                name: schedule.name || '',
                days: schedule.days || [],
                startTime: schedule.start_time || '',
                endTime: schedule.end_time || '',
                maxCapacity: schedule.max_capacity || '',
                description: schedule.description || ''
            });
        } else {
            setFormData({ name: '', days: [], startTime: '', endTime: '', maxCapacity: '', description: '' });
        }
    }, [schedule, isOpen]);

    const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleDayToggle = (dayId) => {
        setFormData(prev => ({
            ...prev,
            days: prev.days.includes(dayId)
                ? prev.days.filter(d => d !== dayId)
                : [...prev.days, dayId]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name || formData.days.length === 0 || !formData.startTime || !formData.endTime) {
            toast({ title: "Campos requeridos", description: "Completa nombre, días y horarios", variant: "destructive" });
            return;
        }

        if (formData.startTime >= formData.endTime) {
            toast({ title: "Error en horarios", description: "La hora de inicio debe ser anterior a la hora de fin", variant: "destructive" });
            return;
        }

        const scheduleData = {
            ...formData,
            maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : null,
            id: schedule?.id || null
        };

        onSave(scheduleData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-background border-border max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-foreground text-xl flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        {schedule ? 'Editar Horario' : 'Crear Horario'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del Horario *</Label>
                        <Input id="name" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                        <Label>Días de la Semana *</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {DAYS_OF_WEEK.map(day => (
                                <div key={day.id} className="flex items-center space-x-2">
                                    <Checkbox id={day.id} checked={formData.days.includes(day.id)} onCheckedChange={() => handleDayToggle(day.id)} />
                                    <Label htmlFor={day.id}>{day.label}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="startTime">Hora de Inicio *</Label>
                            <Input id="startTime" type="time" value={formData.startTime} onChange={e => handleInputChange('startTime', e.target.value)} required />
                        </div>
                        <div>
                            <Label htmlFor="endTime">Hora de Fin *</Label>
                            <Input id="endTime" type="time" value={formData.endTime} onChange={e => handleInputChange('endTime', e.target.value)} required />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="maxCapacity">Capacidad Máxima</Label>
                        <Input id="maxCapacity" type="number" value={formData.maxCapacity} onChange={e => handleInputChange('maxCapacity', e.target.value)} />
                    </div>

                    <div>
                        <Label htmlFor="description">Descripción</Label>
                        <Input id="description" value={formData.description} onChange={e => handleInputChange('description', e.target.value)} />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
                            <Save className="w-4 h-4 mr-2" /> {schedule ? 'Actualizar' : 'Crear'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
