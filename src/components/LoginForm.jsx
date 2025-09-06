import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuthContext } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';

import fondoLogin from '@/img/fondologin.jpg';
import logo from '@/img/logo.png';

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState({ email: '', password: '' });

    const { signIn } = useAuthContext();
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage({ email: '', password: '' });

        try {
            const { data, error } = await signIn(email, password);

            if (error) {
                if (error.message.toLowerCase().includes("email")) {
                    setErrorMessage({ email: "Correo incorrecto", password: '' });
                } else if (error.message.toLowerCase().includes("password")) {
                    setErrorMessage({ email: '', password: "Contraseña incorrecta" });
                } else {
                    toast({
                        title: "Error",
                        description: error.message,
                        variant: "destructive",
                    });
                }
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
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Overlay semitransparente */}
            <div className="absolute inset-0 bg-black/30"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md"
            >
                <Card className="glass-effect border-border py-4 px-6">
                    <CardHeader className="text-center space-y-2">
                        {/* Logo más compacto */}
                        <motion.div
                            key="logo"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="mx-auto  w-40 h-25 flex items-center justify-center"
                        >
                            <img
                                src={logo}
                                alt="Logo"
                                className="w-full h-full object-contain"
                            />
                        </motion.div>

                        <CardTitle className="text-xl font-bold text-foreground">
                            Panel Administrativo
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-sm">
                            Accede al sistema de gestión del gimnasio
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="space-y-1">
                                <Label htmlFor="email" className="text-foreground text-sm">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Ingresa tu email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                                    required
                                />
                                {errorMessage.email && (
                                    <p className="text-red-500 text-xs mt-1">{errorMessage.email}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="password" className="text-foreground text-sm">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Ingresa tu contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                                    required
                                />
                                {errorMessage.password && (
                                    <p className="text-red-500 text-xs mt-1">{errorMessage.password}</p>
                                )}
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

                        {/* Footer */}
                        <div className="mt-4 text-center text-sm text-gray-400">
                            <p className="mb-1">
                                Desarrollado por <span className="font-semibold text-white">Nexus Uruguay</span><br/>
                                &copy; Todos los derechos reservados
                            </p>
                            <a
                                href="https://www.instagram.com/nexus_uruguay?igsh=aXI5bnVkc3llYWZq&utm_source=qr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center text-blue-400 hover:text-blue-300 font-medium mt-1"
                            >
                                <Instagram className="w-4 h-4 mr-1" />
                                @nexus_uruguay
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
