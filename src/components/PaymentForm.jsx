import React, { useState, useEffect } from 'react';
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
    const [selectedStudentName, setSelectedStudentName] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        const selectedStudent = students.find(s => s.id === studentId);
        if (selectedStudent) {
            setSelectedStudentName(`${selectedStudent.name} ${selectedStudent.last_name || selectedStudent.lastName}`);
        }
    }, [studentId, students]);

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

        setStudentId('');
        setAmount('');
        setPaymentDate(new Date().toISOString().slice(0, 10));
        setCurrentWeight('');
        setSelectedStudentName('');
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
                                <SelectValue placeholder="Selecciona un alumno">
                                    {selectedStudentName || 'Selecciona un alumno'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 text-white rounded-md shadow-lg">
                                {students.map((student) => (
                                    <SelectItem
                                        key={student.id}
                                        value={student.id}
                                        className="hover:bg-gray-700 data-[state=checked]:bg-gray-700"
                                    >
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