import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuthContext } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';

import fondoLogin from '@/img/fondologin.jpg'; // Imagen de fondo

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { signIn } = useAuthContext();
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data, error } = await signIn(email, password);

            if (error) {
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            }

            toast({
                title: "¡Bienvenido!",
                description: "Has iniciado sesión correctamente.",
            });

            navigate("/dashboard");
        } catch (err) {
            console.error("Error inesperado:", err);
            toast({
                title: "Error inesperado",
                description: "Revisa la consola para más detalles.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative"
            style={{
                backgroundImage: `url(${fondoLogin})`,
                backgroundSize: 'cover',      // Ajusta la imagen para cubrir el área
                backgroundPosition: 'center', // Centra la imagen
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Overlay semitransparente para mejorar visibilidad */}
            <div className="absolute inset-0 bg-black/40"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md"
            >
                <Card className="glass-effect border-border">
                    <CardHeader className="text-center">
                        {/* Icono de mancuernas */}
                        <motion.div
                            key="logo"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center"
                        >
                            <Dumbbell className="w-8 h-8 text-primary-foreground" />
                        </motion.div>

                        <CardTitle className="text-2xl font-bold text-foreground">Panel Administrativo</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Accede al sistema de gestión del gimnasio
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-foreground">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Ingresa tu email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-foreground">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Ingresa tu contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <motion.div
                                        key="spinner"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mx-auto"
                                    />
                                ) : (
                                    <div key="buttonContent" className="flex items-center justify-center">
                                        <LogIn className="w-4 h-4 mr-2" />
                                        Iniciar Sesión
                                    </div>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
