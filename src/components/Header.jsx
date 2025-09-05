import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Upload, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '../../supabaseClient.js';

export function Header({ onLogout, userId }) {
    const { toast } = useToast();
    const [logo, setLogo] = useState(null);

    // Cargar logo desde la DB
    const fetchLogo = async () => {
        try {
            const { data, error } = await supabase
                .from('logos')
                .select('logo_url')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error al cargar el logo:', error);
            }

            if (data?.logo_url) setLogo(data.logo_url);
        } catch (err) {
            console.error('Error fetchLogo:', err);
        }
    };

    useEffect(() => {
        if (userId) fetchLogo();
    }, [userId]);

    const handleLogoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            console.warn("⚠️ No se seleccionó archivo.");
            return;
        }

        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            console.log("👤 Usuario autenticado:", user);
            if (userError) {
                console.error("❌ Error obteniendo usuario:", userError);
                return;
            }
            if (!user) {
                console.error("❌ No hay usuario autenticado");
                return;
            }

            const fileName = `logo_${Date.now()}_${file.name}`;
            console.log("📂 Nombre archivo:", fileName);

            // Subir al bucket
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from("logos")
                .upload(fileName, file, { upsert: true });

            console.log("📤 Resultado upload:", uploadData);
            if (uploadError) {
                console.error("❌ Error en upload:", uploadError);
                return;
            }

            const publicUrl = supabase.storage.from("logos").getPublicUrl(fileName).data.publicUrl;
            console.log("🌍 URL pública generada:", publicUrl);

            // Guardar en la tabla logos
            const { data: dbData, error: dbError } = await supabase
                .from("logos")
                .upsert(
                    { user_id: user.id, logo_url: publicUrl },
                    { onConflict: "user_id" }
                );

            console.log("🗄️ Resultado DB:", dbData);
            if (dbError) {
                console.error("❌ Error guardando en DB:", dbError);
                return;
            }

            console.log("✅ Logo subido y guardado con éxito!");
            setLogo(publicUrl); // actualizar logo al instante
        } catch (err) {
            console.error("💥 Excepción en handleLogoUpload:", err);
        }
    };

    return (
        <motion.header
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-effect border-b border-border p-4 sticky top-0 z-40"
        >
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    {/* Logo */}
                    <div className="relative">
                        {logo ? (
                            <img
                                src={logo}
                                alt="Logo del Gimnasio"
                                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-border"
                            />
                        ) : (
                            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center">
                                <Dumbbell className="w-6 sm:w-8 md:w-10 h-6 sm:h-8 md:h-10 text-primary-foreground" />
                            </div>
                        )}
                        <label
                            htmlFor="logo-upload"
                            className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
                        >
                            <Upload className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 text-primary-foreground" />
                        </label>
                        <Input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                        />
                    </div>

                    {/* Título */}
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground gradient-text">
                            Panel Administrativo
                        </h1>
                        <p className="text-muted-foreground text-sm sm:text-base">Sistema de Gestión del Gimnasio</p>
                    </div>
                </div>

                {/* Botón Cerrar Sesión */}
                <Button
                    onClick={onLogout}
                    variant="outline"
                    className="border-border text-foreground hover:bg-accent"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                </Button>
            </div>
        </motion.header>
    );
}
