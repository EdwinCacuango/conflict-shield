export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      areas: {
        Row: {
          correo_contacto: string | null
          created_at: string | null
          id: string
          nombre_area: string
          responsable_area: string | null
          sede_id: string
          updated_at: string | null
        }
        Insert: {
          correo_contacto?: string | null
          created_at?: string | null
          id?: string
          nombre_area: string
          responsable_area?: string | null
          sede_id: string
          updated_at?: string | null
        }
        Update: {
          correo_contacto?: string | null
          created_at?: string | null
          id?: string
          nombre_area?: string
          responsable_area?: string | null
          sede_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "areas_sede_id_fkey"
            columns: ["sede_id"]
            isOneToOne: false
            referencedRelation: "sedes"
            referencedColumns: ["id"]
          },
        ]
      }
      auditoria: {
        Row: {
          consulta_id: string | null
          created_at: string | null
          detalle: Json | null
          evento: string
          fecha_evento: string | null
          id: string
          usuario_responsable: string | null
        }
        Insert: {
          consulta_id?: string | null
          created_at?: string | null
          detalle?: Json | null
          evento: string
          fecha_evento?: string | null
          id?: string
          usuario_responsable?: string | null
        }
        Update: {
          consulta_id?: string | null
          created_at?: string | null
          detalle?: Json | null
          evento?: string
          fecha_evento?: string | null
          id?: string
          usuario_responsable?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auditoria_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auditoria_usuario_responsable_fkey"
            columns: ["usuario_responsable"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes_actuales: {
        Row: {
          area_id: string | null
          created_at: string | null
          estado: string | null
          fecha_registro: string | null
          id: string
          nombre_cliente: string
          ruc: string
          sede_id: string
          tipo_servicio: string | null
          updated_at: string | null
        }
        Insert: {
          area_id?: string | null
          created_at?: string | null
          estado?: string | null
          fecha_registro?: string | null
          id?: string
          nombre_cliente: string
          ruc: string
          sede_id: string
          tipo_servicio?: string | null
          updated_at?: string | null
        }
        Update: {
          area_id?: string | null
          created_at?: string | null
          estado?: string | null
          fecha_registro?: string | null
          id?: string
          nombre_cliente?: string
          ruc?: string
          sede_id?: string
          tipo_servicio?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_actuales_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_actuales_sede_id_fkey"
            columns: ["sede_id"]
            isOneToOne: false
            referencedRelation: "sedes"
            referencedColumns: ["id"]
          },
        ]
      }
      consultas: {
        Row: {
          created_at: string | null
          estado_final: Database["public"]["Enums"]["estado_consulta"] | null
          fecha_consulta: string | null
          id: string
          nombre_potencial_cliente: string
          ruc_potencial_cliente: string
          tiene_conflicto: boolean | null
          tipo_servicio: string | null
          updated_at: string | null
          usuario_solicitante: string
        }
        Insert: {
          created_at?: string | null
          estado_final?: Database["public"]["Enums"]["estado_consulta"] | null
          fecha_consulta?: string | null
          id?: string
          nombre_potencial_cliente: string
          ruc_potencial_cliente: string
          tiene_conflicto?: boolean | null
          tipo_servicio?: string | null
          updated_at?: string | null
          usuario_solicitante: string
        }
        Update: {
          created_at?: string | null
          estado_final?: Database["public"]["Enums"]["estado_consulta"] | null
          fecha_consulta?: string | null
          id?: string
          nombre_potencial_cliente?: string
          ruc_potencial_cliente?: string
          tiene_conflicto?: boolean | null
          tipo_servicio?: string | null
          updated_at?: string | null
          usuario_solicitante?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultas_usuario_solicitante_fkey"
            columns: ["usuario_solicitante"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      notificaciones: {
        Row: {
          consulta_id: string | null
          created_at: string | null
          estado: string | null
          fecha_envio: string | null
          id: string
          leida: boolean | null
          notificacion_nombre: string
          tipo_notificacion: Database["public"]["Enums"]["tipo_notificacion"]
          updated_at: string | null
          usuario_destinatario: string
        }
        Insert: {
          consulta_id?: string | null
          created_at?: string | null
          estado?: string | null
          fecha_envio?: string | null
          id?: string
          leida?: boolean | null
          notificacion_nombre: string
          tipo_notificacion: Database["public"]["Enums"]["tipo_notificacion"]
          updated_at?: string | null
          usuario_destinatario: string
        }
        Update: {
          consulta_id?: string | null
          created_at?: string | null
          estado?: string | null
          fecha_envio?: string | null
          id?: string
          leida?: boolean | null
          notificacion_nombre?: string
          tipo_notificacion?: Database["public"]["Enums"]["tipo_notificacion"]
          updated_at?: string | null
          usuario_destinatario?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificaciones_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_usuario_destinatario_fkey"
            columns: ["usuario_destinatario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      respuestas: {
        Row: {
          comentario: string | null
          consulta_id: string
          created_at: string | null
          estado_respuesta: Database["public"]["Enums"]["estado_respuesta_type"]
          fecha_respuesta: string | null
          id: string
          updated_at: string | null
          usuario_respondedor: string
        }
        Insert: {
          comentario?: string | null
          consulta_id: string
          created_at?: string | null
          estado_respuesta: Database["public"]["Enums"]["estado_respuesta_type"]
          fecha_respuesta?: string | null
          id?: string
          updated_at?: string | null
          usuario_respondedor: string
        }
        Update: {
          comentario?: string | null
          consulta_id?: string
          created_at?: string | null
          estado_respuesta?: Database["public"]["Enums"]["estado_respuesta_type"]
          fecha_respuesta?: string | null
          id?: string
          updated_at?: string | null
          usuario_respondedor?: string
        }
        Relationships: [
          {
            foreignKeyName: "respuestas_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respuestas_usuario_respondedor_fkey"
            columns: ["usuario_respondedor"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      sedes: {
        Row: {
          correo_contacto: string
          created_at: string | null
          direccion: string | null
          id: string
          nombre_sede: string
          updated_at: string | null
        }
        Insert: {
          correo_contacto: string
          created_at?: string | null
          direccion?: string | null
          id?: string
          nombre_sede: string
          updated_at?: string | null
        }
        Update: {
          correo_contacto?: string
          created_at?: string | null
          direccion?: string | null
          id?: string
          nombre_sede?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          correo_electronico: string
          created_at: string | null
          id: string
          nombre_usuario: string
          rol: Database["public"]["Enums"]["app_role"]
          sede_id: string | null
          updated_at: string | null
        }
        Insert: {
          correo_electronico: string
          created_at?: string | null
          id: string
          nombre_usuario: string
          rol?: Database["public"]["Enums"]["app_role"]
          sede_id?: string | null
          updated_at?: string | null
        }
        Update: {
          correo_electronico?: string
          created_at?: string | null
          id?: string
          nombre_usuario?: string
          rol?: Database["public"]["Enums"]["app_role"]
          sede_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_sede_id_fkey"
            columns: ["sede_id"]
            isOneToOne: false
            referencedRelation: "sedes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin_central" | "admin_sede" | "usuario_normal"
      estado_consulta: "pendiente" | "en_proceso" | "escalado" | "finalizado"
      estado_respuesta_type:
        | "sin_conflicto"
        | "con_conflicto"
        | "requiere_escalacion"
      tipo_notificacion:
        | "nueva_consulta"
        | "recordatorio"
        | "escalacion"
        | "finalizacion"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin_central", "admin_sede", "usuario_normal"],
      estado_consulta: ["pendiente", "en_proceso", "escalado", "finalizado"],
      estado_respuesta_type: [
        "sin_conflicto",
        "con_conflicto",
        "requiere_escalacion",
      ],
      tipo_notificacion: [
        "nueva_consulta",
        "recordatorio",
        "escalacion",
        "finalizacion",
      ],
    },
  },
} as const
