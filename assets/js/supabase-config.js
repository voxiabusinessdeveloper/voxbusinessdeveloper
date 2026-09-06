/**
 * VOX Business Developer - Supabase Configuration
 * Configuración centralizada del cliente Supabase para Web y Dashboard.
 */

const SUPABASE_URL = "https://umnnzfaymrictdpxpurh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtbm56ZmF5bXJpY3RkcHhwdXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDY5NzksImV4cCI6MjEwNDI4Mjk3OX0.CXtmnp4xprxn0kHCEunm9QrmpY-o5qGmPD5ZslhMHcU";

let supabaseClient = null;

// Inicializar cliente Supabase si el SDK está cargado
if (typeof window.supabase !== 'undefined') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("⚡ Conectado exitosamente a Supabase Cloud (VOX Business Developer).");
}

window.VOX_SUPABASE = {
    client: supabaseClient,
    isConfigured: () => {
        return supabaseClient !== null;
    }
};
