import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StudentCard } from '@/components/StudentCard';

export function StudentsTab({ students, onNewStudent, onEditStudent, onDeleteStudent }) {
    const [search, setSearch] = useState('');

    // Filtra alumnos por búsqueda
    const filteredStudents = useMemo(() => {
        if (!search) return students;
        const lowerSearch = search.toLowerCase();
        return students.filter(
            (s) =>
                s.name.toLowerCase().includes(lowerSearch) ||
                (s.last_name || s.lastName || '').toLowerCase().includes(lowerSearch)
        );
    }, [students, search]);

    return (
        <div className="space-y-6">
            {/* Header, buscador y botón juntos */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Gestión de Alumnos</h2>
                    <p className="text-muted-foreground">Administra la información de todos los alumnos</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Buscador */}
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar Alumno"
                            className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black placeholder-black"
                        />
                    </div>

                    {/* Botón nuevo alumno */}
                    <Button
                        onClick={onNewStudent}
                        className="bg-blue-800 hover:bg-blue-700 text-white flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Alumno
                    </Button>
                </div>
            </div>

            {/* Lista de alumnos */}
            {students.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                >
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No hay alumnos registrados</h3>
                    <p className="text-muted-foreground mb-4">Comienza agregando tu primer alumno</p>
                    <Button
                        onClick={onNewStudent}
                        className="bg-blue-700 hover:bg-blue-600 text-white flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Registrar Primer Alumno
                    </Button>
                </motion.div>
            ) : filteredStudents.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                >
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No se encontraron alumnos</h3>
                    <p className="text-muted-foreground mb-4">Intenta con otro nombre o apellido</p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredStudents.map((student) => (
                            <motion.div
                                key={student.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
                                <StudentCard
                                    student={student}
                                    onEdit={onEditStudent}
                                    onDelete={onDeleteStudent}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
