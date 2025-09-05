import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, BarChart3, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Statistics } from '@/components/Statistics';

export function PaymentsTab({ students, payments, onNewPayment, onCalculateIncome, onNavigateToStudents }) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Gestión de Pagos y Estadísticas</h2>
                    <p className="text-muted-foreground">Registra mensualidades y visualiza el rendimiento</p>
                </div>
                <div className="flex space-x-3">
                    <Button onClick={onCalculateIncome} variant="outline">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Ingresos del Mes
                    </Button>
                    <Button
                        onClick={onNewPayment}
                        className="bg-green-600 text-white hover:bg-green-700"
                        disabled={students.length === 0}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Pago
                    </Button>
                </div>
            </div>

            <Statistics students={students} payments={payments} />

            {students.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                >
                    <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No hay alumnos para registrar pagos</h3>
                    <p className="text-muted-foreground mb-4">Primero debes registrar alumnos</p>
                    <Button onClick={onNavigateToStudents} className="bg-primary hover:bg-primary/90">
                        <Users className="w-4 h-4 mr-2" />
                        Ir a Alumnos
                    </Button>
                </motion.div>
            )}
        </div>
    );
}