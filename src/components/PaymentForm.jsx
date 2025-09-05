import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

export function PaymentForm({ isOpen, onClose, onSave, students }) {
    const [studentId, setStudentId] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
    const [currentWeight, setCurrentWeight] = useState('');
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!studentId || !amount) {
            return toast({
                title: 'Error',
                description: 'Alumno y monto son obligatorios',
                variant: 'destructive'
            });
        }

        onSave({
            studentId,
            amount: parseFloat(amount),
            paymentDate,
            currentWeight: currentWeight ? parseFloat(currentWeight) : null
        });

        // Reset fields
        setStudentId('');
        setAmount('');
        setPaymentDate(new Date().toISOString().slice(0, 10));
        setCurrentWeight('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Registrar Pago</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <Label>Alumno</Label>
                        <Select value={studentId} onValueChange={setStudentId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un alumno" />
                            </SelectTrigger>
                            <SelectContent>
                                {students.map((student) => (
                                    <SelectItem key={student.id} value={student.id}>
                                        {student.name} {student.last_name || student.lastName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label>Monto</Label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Ingrese el monto"
                            min="0"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Fecha de Pago</Label>
                        <Input
                            type="date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Peso Actual (opcional)</Label>
                        <Input
                            type="number"
                            value={currentWeight}
                            onChange={(e) => setCurrentWeight(e.target.value)}
                            placeholder="kg"
                            step="0.1"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit">Guardar Pago</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
