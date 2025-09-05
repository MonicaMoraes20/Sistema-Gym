// src/contexts/SupabaseAuthContext.jsx
import { createContext, useContext } from "react";
import { useAuth } from "@/hooks/useAuth";

// Creamos el contexto
const AuthContext = createContext();

// Provider que envuelve tu app
export function AuthProvider({ children }) {
    const auth = useAuth(); // valores que vienen de useAuth.js
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

// Hook para consumir el contexto en cualquier componente
export function useAuthContext() {
    return useContext(AuthContext);
}
