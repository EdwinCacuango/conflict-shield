import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Consulta() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nombreCliente: '',
    ruc: '',
    tipoServicio: '',
  });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Crear la consulta
      const { data: consultaData, error: consultaError } = await supabase
        .from('consultas')
        .insert({
          nombre_potencial_cliente: formData.nombreCliente,
          ruc_potencial_cliente: formData.ruc,
          tipo_servicio: formData.tipoServicio,
          usuario_solicitante: user.id,
          estado_final: 'pendiente',
        })
        .select()
        .single();

      if (consultaError) throw consultaError;

      // Buscar coincidencias en clientes actuales
      const { data: clientesCoincidentes, error: searchError } = await supabase
        .from('clientes_actuales')
        .select('*')
        .or(`ruc.eq.${formData.ruc},nombre_cliente.ilike.%${formData.nombreCliente}%`);

      if (searchError) throw searchError;

      const tieneConflictoInicial = (clientesCoincidentes?.length || 0) > 0;

      // Actualizar consulta con resultado inicial
      await supabase
        .from('consultas')
        .update({ 
          tiene_conflicto: tieneConflictoInicial,
          estado_final: tieneConflictoInicial ? 'en_proceso' : 'finalizado'
        })
        .eq('id', consultaData.id);

      // Registrar en auditoría
      await supabase
        .from('auditoria')
        .insert({
          evento: 'Nueva consulta creada',
          consulta_id: consultaData.id,
          usuario_responsable: user.id,
          detalle: {
            cliente: formData.nombreCliente,
            ruc: formData.ruc,
            conflicto_inicial: tieneConflictoInicial,
            coincidencias: clientesCoincidentes?.length || 0,
          },
        });

      if (tieneConflictoInicial) {
        // Obtener todos los admin de sede
        const { data: admins } = await supabase
          .from('usuarios')
          .select('id')
          .in('rol', ['admin_sede', 'admin_central']);

        // Crear notificaciones para cada admin
        if (admins) {
          const notificaciones = admins.map(admin => ({
            notificacion_nombre: `Nueva consulta: ${formData.nombreCliente}`,
            usuario_destinatario: admin.id,
            tipo_notificacion: 'nueva_consulta' as const,
            consulta_id: consultaData.id,
            estado: 'pendiente',
          }));

          await supabase
            .from('notificaciones')
            .insert(notificaciones);
        }

        toast({
          title: "Conflicto detectado",
          description: `Se encontraron ${clientesCoincidentes?.length} posibles coincidencias. Los administradores de sede han sido notificados.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sin conflictos",
          description: "No se encontraron conflictos de interés con este cliente.",
        });
      }

      navigate('/mis-consultas');
    } catch (error) {
      console.error('Error al crear consulta:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar la consulta. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
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

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Nueva Consulta de Conflicto</CardTitle>
            <CardDescription>
              Ingresa los datos del potencial cliente para verificar conflictos de interés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nombreCliente">Nombre del Cliente</Label>
                <Input
                  id="nombreCliente"
                  placeholder="Empresa S.A."
                  value={formData.nombreCliente}
                  onChange={(e) => setFormData({ ...formData, nombreCliente: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ruc">RUC / Identificación</Label>
                <Input
                  id="ruc"
                  placeholder="20123456789"
                  value={formData.ruc}
                  onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoServicio">Tipo de Servicio</Label>
                <Textarea
                  id="tipoServicio"
                  placeholder="Descripción del servicio legal requerido"
                  value={formData.tipoServicio}
                  onChange={(e) => setFormData({ ...formData, tipoServicio: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Al enviar esta consulta, el sistema buscará automáticamente coincidencias en la base de datos 
                  de todas las sedes. Si se detecta un posible conflicto, se notificará a los administradores 
                  de sede para su revisión y confirmación.
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => navigate('/dashboard')} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? 'Procesando...' : 'Enviar Consulta'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}