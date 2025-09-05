import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Calendar, AlertTriangle, Phone, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Días en español
const diasES = {
    monday: "Lunes", mon: "Lunes",
    tuesday: "Martes", tue: "Martes",
    wednesday: "Miércoles", wed: "Miércoles",
    thursday: "Jueves", thu: "Jueves",
    friday: "Viernes", fri: "Viernes",
    saturday: "Sábado", sat: "Sábado",
    sunday: "Domingo", sun: "Domingo"
};

export function StudentCard({ student, onEdit, onDelete }) {
    const [imageError, setImageError] = useState(false);

    // Función para validar si el último pago sigue vigente (+1 mes)
    const isPaymentValid = (paymentDate) => {
        if (!paymentDate) return false;
        const date = new Date(paymentDate);
        const expiryDate = new Date(date);
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        if (expiryDate.getDate() !== date.getDate()) expiryDate.setDate(0);
        expiryDate.setHours(23, 59, 59, 999);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today <= expiryDate;
    };

    const isOverdue = !isPaymentValid(student.last_payment);

    const getInitials = (name, lastName) =>
        `${name?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();

    // Formateo de fecha sin desplazamiento por zona horaria
    const formatDate = (date) => {
        if (!date) return 'No registrado';
        const d = new Date(date);
        const day = d.getUTCDate();
        const month = d.getUTCMonth();
        const year = d.getUTCFullYear();
        const weekday = d.getUTCDay();

        const weekdays = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
        const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

        return `${weekdays[weekday]}, ${day} de ${months[month]} de ${year}`;
    };

    const formatSchedule = (schedule) => {
        if (!schedule) return 'Sin horario';
        if (Array.isArray(schedule)) return schedule.map(d => diasES[d.trim().toLowerCase()] || d).join(', ');
        if (typeof schedule === 'string') {
            const [daysPart, hoursPart] = schedule.split(' ').reduce(
                (acc, curr) => {
                    if (curr.includes(':') || curr.includes('-')) acc[1].push(curr);
                    else acc[0].push(curr);
                    return acc;
                },
                [[], []]
            );

            const diasTraducidos = daysPart.join(' ').split(',')
                .map(d => diasES[d.trim().toLowerCase()] || d.trim())
                .join(', ');

            const horasStr = hoursPart.map(h => h.split(':').slice(0, 2).join(':')).join(' ');

            return diasTraducidos + (horasStr ? ` (${horasStr})` : '');
        }
        return 'Sin horario';
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -5 }} className="relative">
            <Card className="glass-effect border-border card-hover overflow-hidden">
                {isOverdue && (
                    <div className="absolute top-2 right-2 z-10">
                        <Badge variant="destructive" className="alert-pulse">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Pago Vencido
                        </Badge>
                    </div>
                )}

                <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                        <Avatar className="w-20 h-20 border-2 border-border">
                            {student.photo_url && !imageError ? (
                                <AvatarImage
                                    src={student.photo_url}
                                    alt={`${student.name} ${student.lastName}`}
                                    className="object-cover w-full h-full"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <AvatarFallback className="bg-gradient-to-r from-primary to-purple-500 text-primary-foreground text-lg font-bold">
                                    {getInitials(student.name, student.lastName)}
                                </AvatarFallback>
                            )}
                        </Avatar>

                        <div className="flex-1">
                            <CardTitle className="text-foreground text-lg">
                                {student.name} {student.lastName}
                            </CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="secondary" className="text-xs">{student.modality || 'Grupal'}</Badge>
                                <span className="text-muted-foreground text-sm">{student.age} años</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span className="whitespace-normal">{formatSchedule(student.schedule)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-muted-foreground">
                            <span className="font-medium text-foreground">Peso:</span>
                            <span>{student.initial_weight} kg</span>
                        </div>
                        <div className="flex items-center space-x-2 text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            <span>{student.contact}</span>
                        </div>
                        {student.pathology && (
                            <div className="flex items-center space-x-2 text-orange-400">
                                <Heart className="w-4 h-4" />
                                <span className="text-xs">{student.pathology}</span>
                            </div>
                        )}
                    </div>

                    {student.medical_assistance && (
                        <div className="text-xs text-muted-foreground bg-secondary p-2 rounded">
                            <strong>Asistencia Médica:</strong> {student.medical_assistance}
                        </div>
                    )}

                    {student.emergency_contact && (
                        <div className="text-xs text-muted-foreground">
                            <strong>Contacto de emergencia:</strong> {student.emergency_contact}
                        </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                        <strong>Último pago:</strong> {formatDate(student.last_payment)}
                    </div>

                    <div className="text-xs text-muted-foreground">
                        <strong>Creado el:</strong> {formatDate(student.created_at)}
                    </div>

                    <div className="flex space-x-2 pt-2">
                        <Button size="sm" variant="outline" onClick={() => onEdit(student)} className="flex-1">
                            <Edit className="w-4 h-4 mr-1" /> Editar
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => onDelete(student.id)} className="flex-1">
                            <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}