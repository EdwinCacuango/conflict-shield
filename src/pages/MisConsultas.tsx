import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, ArrowUpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Consulta {
  id: string;
  nombre_potencial_cliente: string;
  ruc_potencial_cliente: string;
  tipo_servicio: string;
  fecha_consulta: string;
  estado_final: string;
  tiene_conflicto: boolean | null;
}

export default function MisConsultas() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConsultas();
    }
  }, [user]);

  const fetchConsultas = async () => {
    try {
      const { data, error } = await supabase
        .from('consultas')
        .select('*')
        .eq('usuario_solicitante', user?.id)
        .order('fecha_consulta', { ascending: false });

      if (error) throw error;
      setConsultas(data || []);
    } catch (error) {
      console.error('Error fetching consultas:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const getEstadoBadge = (estado: string) => {
    const estados = {
      pendiente: { label: 'Pendiente', variant: 'secondary' as const, icon: Clock },
      en_proceso: { label: 'En Proceso', variant: 'default' as const, icon: AlertCircle },
      escalado: { label: 'Escalado', variant: 'destructive' as const, icon: ArrowUpCircle },
      finalizado: { label: 'Finalizado', variant: 'default' as const, icon: CheckCircle2 },
    };

    const config = estados[estado as keyof typeof estados] || estados.pendiente;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mis Consultas</h1>
          <p className="text-muted-foreground">
            Historial de tus consultas de conflictos de interés
          </p>
        </div>

        {consultas.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tienes consultas</h3>
              <p className="text-muted-foreground mb-4">
                Aún no has realizado ninguna consulta de conflicto de interés
              </p>
              <Button onClick={() => navigate('/consulta')}>
                Nueva Consulta
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {consultas.map((consulta) => (
              <Card key={consulta.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-1">{consulta.nombre_potencial_cliente}</CardTitle>
                      <CardDescription>RUC: {consulta.ruc_potencial_cliente}</CardDescription>
                    </div>
                    {getEstadoBadge(consulta.estado_final)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {consulta.tipo_servicio && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Servicio:</span> {consulta.tipo_servicio}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Fecha:</span>{' '}
                      {format(new Date(consulta.fecha_consulta), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                    </p>
                    {consulta.tiene_conflicto !== null && (
                      <div className={`mt-4 p-3 rounded-lg ${
                        consulta.tiene_conflicto 
                          ? 'bg-destructive/10 text-destructive' 
                          : 'bg-success/10 text-success'
                      }`}>
                        <p className="text-sm font-medium">
                          {consulta.tiene_conflicto 
                            ? '⚠️ Posible conflicto detectado - En revisión por administradores' 
                            : '✓ Sin conflictos detectados'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}