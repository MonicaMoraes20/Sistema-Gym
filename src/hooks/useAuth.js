import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabaseClient.js";

export function useAuth() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("🔹 useAuth montado");

        const fetchSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) console.error("Error al obtener sesión:", error.message);
                else console.log("✅ Sesión inicial obtenida:", session);
                setSession(session);
            } catch (err) {
                console.error("Error al cargar la sesión:", err);
            } finally {
                setLoading(false);
            }
        };

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log("🔹 onAuthStateChange:", session);
            setSession(session);
            setLoading(false);
        });

        fetchSession();

        return () => {
            listener.subscription.unsubscribe();
            console.log("🔹 useAuth desmontado, limpiando listener");
        };
    }, []);

    const signIn = useCallback(async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) console.error("Error en signIn:", error.message);
        return { data, error };
    }, []);

    const logout = useCallback(async () => {
        console.log("🔹 logout llamado");
        if (session) {
            const { error } = await supabase.auth.signOut();
            if (error) console.error("Error en logout:", error.message);
            else console.log("✅ logout exitoso");
        }
    }, [session]);

    const signUp = useCallback(async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) console.error("Error en signUp:", error.message);
        return { data, error };
    }, []);

    return {
        session,
        loading,
        signIn,
        logout,
        signUp,
        user: session?.user,
    };
}
