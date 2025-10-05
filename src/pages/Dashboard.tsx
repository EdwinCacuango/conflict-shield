import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSearch, AlertCircle, Users, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, loading, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdminCentral = userRole === 'admin_central';
  const isAdminSede = userRole === 'admin_sede';
  const isUsuarioNormal = userRole === 'usuario_normal';

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">E</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Sistema de Conflictos</h1>
              <p className="text-xs text-muted-foreground">ECIJA</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user.email}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {userRole?.replace('_', ' ')}
              </p>
            </div>
            <Button variant="outline" onClick={signOut}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Panel de Control</h2>
          <p className="text-muted-foreground">
            Bienvenido al sistema de gestión de conflictos de interés
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Verificar Conflicto - Todos */}
          {isUsuarioNormal && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/consulta')}>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                  <FileSearch className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Verificar Conflicto</CardTitle>
                <CardDescription>
                  Consulta si existe un conflicto de interés con un potencial cliente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Nueva Consulta
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Consultas Pendientes - Admins */}
          {(isAdminCentral || isAdminSede) && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/respuestas')}>
              <CardHeader>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-2">
                  <AlertCircle className="w-6 h-6 text-warning" />
                </div>
                <CardTitle>Responder Consultas</CardTitle>
                <CardDescription>
                  Revisa y responde consultas pendientes de tu sede
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full">
                  Ver Pendientes
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Gestión de Usuarios - Admins */}
          {(isAdminCentral || isAdminSede) && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/usuarios')}>
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>
                  Administra usuarios {isAdminCentral ? 'y administradores de sede' : 'de tu sede'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Administrar
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Gestión de Sedes - Solo Admin Central */}
          {isAdminCentral && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/sedes')}>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Gestión de Sedes</CardTitle>
                <CardDescription>
                  Administra las sedes de la organización
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Ver Sedes
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Mis Consultas - Usuario Normal */}
          {isUsuarioNormal && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/mis-consultas')}>
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-2">
                  <FileSearch className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle>Mis Consultas</CardTitle>
                <CardDescription>
                  Revisa el estado de tus consultas anteriores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Ver Historial
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}