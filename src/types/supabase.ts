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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      deviation_reports: {
        Row: {
          comentario: string | null
          created_at: string
          id: string
          reporter_id: string
          step_id: string
          tipo: Database["public"]["Enums"]["report_tipo"]
        }
        Insert: {
          comentario?: string | null
          created_at?: string
          id?: string
          reporter_id?: string
          step_id: string
          tipo: Database["public"]["Enums"]["report_tipo"]
        }
        Update: {
          comentario?: string | null
          created_at?: string
          id?: string
          reporter_id?: string
          step_id?: string
          tipo?: Database["public"]["Enums"]["report_tipo"]
        }
        Relationships: [
          {
            foreignKeyName: "deviation_reports_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "knowledge_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_steps: {
        Row: {
          autor: string | null
          canal: Database["public"]["Enums"]["canal"]
          comportamiento_a_evitar: string | null
          created_at: string
          estado_editorial: Database["public"]["Enums"]["estado_editorial"]
          fecha_ultima_verificacion: string
          id: string
          instruccion: string
          nombre_actual_boton: string | null
          reportes_de_desvio_activos: number
          slug: string
          titulo: string
          trampa: string | null
          updated_at: string
        }
        Insert: {
          autor?: string | null
          canal: Database["public"]["Enums"]["canal"]
          comportamiento_a_evitar?: string | null
          created_at?: string
          estado_editorial?: Database["public"]["Enums"]["estado_editorial"]
          fecha_ultima_verificacion?: string
          id?: string
          instruccion: string
          nombre_actual_boton?: string | null
          reportes_de_desvio_activos?: number
          slug: string
          titulo: string
          trampa?: string | null
          updated_at?: string
        }
        Update: {
          autor?: string | null
          canal?: Database["public"]["Enums"]["canal"]
          comportamiento_a_evitar?: string | null
          created_at?: string
          estado_editorial?: Database["public"]["Enums"]["estado_editorial"]
          fecha_ultima_verificacion?: string
          id?: string
          instruccion?: string
          nombre_actual_boton?: string | null
          reportes_de_desvio_activos?: number
          slug?: string
          titulo?: string
          trampa?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_steps_autor_fkey"
            columns: ["autor"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_progress: {
        Row: {
          estado: Database["public"]["Enums"]["progress_estado"]
          id: string
          marcado_at: string | null
          project_id: string
          step_id: string
        }
        Insert: {
          estado?: Database["public"]["Enums"]["progress_estado"]
          id?: string
          marcado_at?: string | null
          project_id: string
          step_id: string
        }
        Update: {
          estado?: Database["public"]["Enums"]["progress_estado"]
          id?: string
          marcado_at?: string | null
          project_id?: string
          step_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_progress_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_progress_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "knowledge_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          bsp_candidato: string | null
          canal: Database["public"]["Enums"]["canal"]
          cliente_nombre: string
          created_at: string
          diagnostico_respuestas: Json | null
          estado: Database["public"]["Enums"]["project_estado"]
          id: string
          owner_id: string
          pais: string | null
          route_id: string | null
          semaforo_riesgo: Database["public"]["Enums"]["semaforo"] | null
          tipo_negocio: string | null
          updated_at: string
        }
        Insert: {
          bsp_candidato?: string | null
          canal: Database["public"]["Enums"]["canal"]
          cliente_nombre: string
          created_at?: string
          diagnostico_respuestas?: Json | null
          estado?: Database["public"]["Enums"]["project_estado"]
          id?: string
          owner_id?: string
          pais?: string | null
          route_id?: string | null
          semaforo_riesgo?: Database["public"]["Enums"]["semaforo"] | null
          tipo_negocio?: string | null
          updated_at?: string
        }
        Update: {
          bsp_candidato?: string | null
          canal?: Database["public"]["Enums"]["canal"]
          cliente_nombre?: string
          created_at?: string
          diagnostico_respuestas?: Json | null
          estado?: Database["public"]["Enums"]["project_estado"]
          id?: string
          owner_id?: string
          pais?: string | null
          route_id?: string | null
          semaforo_riesgo?: Database["public"]["Enums"]["semaforo"] | null
          tipo_negocio?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      rescue_playbooks: {
        Row: {
          created_at: string
          criterio_irrecuperable: string | null
          diagnostico: string
          documentacion_a_presentar: string | null
          id: string
          plantilla_apelacion: string | null
          tiempo_espera: string | null
          tipo_restriccion: Database["public"]["Enums"]["tipo_restriccion"]
        }
        Insert: {
          created_at?: string
          criterio_irrecuperable?: string | null
          diagnostico: string
          documentacion_a_presentar?: string | null
          id?: string
          plantilla_apelacion?: string | null
          tiempo_espera?: string | null
          tipo_restriccion: Database["public"]["Enums"]["tipo_restriccion"]
        }
        Update: {
          created_at?: string
          criterio_irrecuperable?: string | null
          diagnostico?: string
          documentacion_a_presentar?: string | null
          id?: string
          plantilla_apelacion?: string | null
          tiempo_espera?: string | null
          tipo_restriccion?: Database["public"]["Enums"]["tipo_restriccion"]
        }
        Relationships: []
      }
      route_steps: {
        Row: {
          id: string
          orden: number
          route_id: string
          step_id: string
        }
        Insert: {
          id?: string
          orden: number
          route_id: string
          step_id: string
        }
        Update: {
          id?: string
          orden?: number
          route_id?: string
          step_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_steps_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_steps_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "knowledge_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          bsp: string | null
          canal: Database["public"]["Enums"]["canal"]
          created_at: string
          id: string
          nombre: string
          rama: Database["public"]["Enums"]["rama"]
        }
        Insert: {
          bsp?: string | null
          canal: Database["public"]["Enums"]["canal"]
          created_at?: string
          id?: string
          nombre: string
          rama: Database["public"]["Enums"]["rama"]
        }
        Update: {
          bsp?: string | null
          canal?: Database["public"]["Enums"]["canal"]
          created_at?: string
          id?: string
          nombre?: string
          rama?: Database["public"]["Enums"]["rama"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      canal: "whatsapp" | "instagram"
      estado_editorial: "borrador" | "propuesto" | "aprobado"
      progress_estado: "pendiente" | "hecho" | "desvio"
      project_estado:
        | "diagnostico"
        | "en_ruta"
        | "rescate"
        | "produccion"
        | "abandonado"
      rama: "estandar" | "rehabilitacion" | "verif_alternativa" | "por_bsp"
      report_tipo: "cambio" | "no_funciona"
      semaforo: "verde" | "amarillo" | "rojo"
      tipo_restriccion: "integridad" | "verificacion" | "comportamiento"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export const Constants = {
  public: {
    Enums: {
      canal: ["whatsapp", "instagram"],
      estado_editorial: ["borrador", "propuesto", "aprobado"],
      progress_estado: ["pendiente", "hecho", "desvio"],
      project_estado: [
        "diagnostico",
        "en_ruta",
        "rescate",
        "produccion",
        "abandonado",
      ],
      rama: ["estandar", "rehabilitacion", "verif_alternativa", "por_bsp"],
      report_tipo: ["cambio", "no_funciona"],
      semaforo: ["verde", "amarillo", "rojo"],
      tipo_restriccion: ["integridad", "verificacion", "comportamiento"],
    },
  },
} as const
