import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Building2, FileCheck, Bell } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">E</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">ECIJA</h1>
              <p className="text-xs text-muted-foreground">Conflictos de Interés</p>
            </div>
          </div>
          <Button onClick={() => navigate('/login')}>
            Acceder
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-sm font-medium">Sistema Profesional de Compliance</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Gestión de Conflictos de Interés
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sistema integral para prevenir y gestionar conflictos de interés entre sedes de tu organización legal
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/login')} className="text-lg px-8">
              Iniciar Sesión
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="text-lg px-8">
              Registrarse
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Multi-Sede</h3>
            <p className="text-muted-foreground">
              Gestiona conflictos entre múltiples sedes y oficinas de tu firma legal
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <FileCheck className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Verificación Automática</h3>
            <p className="text-muted-foreground">
              Búsqueda instantánea en la base de datos de clientes de todas las sedes
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Notificaciones</h3>
            <p className="text-muted-foreground">
              Sistema de alertas automáticas y recordatorios por email
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border mt-20">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2025 ECIJA. Sistema de Conflictos de Interés.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;