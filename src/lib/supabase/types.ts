/**
 * LaskarCode Supabase Database TypeScript Definitions
 * Menyesuaikan skema 11 tabel inti dari migration 001_initial_schema.sql
 * Dokumen Acuan: docs/LaskarCode_Vibe_Coding_Acuan_v1.0.md §15, §16, §17
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type AiInteractionType = 'KAWAN_KOD' | 'BOTI_STORY';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nickname: string;
          avatar_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nickname: string;
          avatar_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nickname?: string;
          avatar_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      recovery_codes: {
        Row: {
          id: string;
          profile_id: string;
          code_hash: string;
          created_at: string;
          last_used_at: string | null;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          code_hash: string;
          created_at?: string;
          last_used_at?: string | null;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          code_hash?: string;
          created_at?: string;
          last_used_at?: string | null;
          expires_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'recovery_codes_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      islands: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          order_index: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          order_index: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          order_index?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      levels: {
        Row: {
          id: string;
          island_id: string;
          code: string;
          title: string;
          description: string | null;
          level_type: string;
          order_index: number;
          difficulty: number;
          configuration: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          island_id: string;
          code: string;
          title: string;
          description?: string | null;
          level_type: string;
          order_index: number;
          difficulty: number;
          configuration: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          island_id?: string;
          code?: string;
          title?: string;
          description?: string | null;
          level_type?: string;
          order_index?: number;
          difficulty?: number;
          configuration?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'levels_island_id_fkey';
            columns: ['island_id'];
            isOneToOne: false;
            referencedRelation: 'islands';
            referencedColumns: ['id'];
          },
        ];
      };
      concepts: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      level_concepts: {
        Row: {
          level_id: string;
          concept_id: string;
          weight: number;
          role: string;
        };
        Insert: {
          level_id: string;
          concept_id: string;
          weight: number;
          role?: string;
        };
        Update: {
          level_id?: string;
          concept_id?: string;
          weight?: number;
          role?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'level_concepts_level_id_fkey';
            columns: ['level_id'];
            isOneToOne: false;
            referencedRelation: 'levels';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'level_concepts_concept_id_fkey';
            columns: ['concept_id'];
            isOneToOne: false;
            referencedRelation: 'concepts';
            referencedColumns: ['id'];
          },
        ];
      };
      level_progress: {
        Row: {
          id: string;
          profile_id: string;
          level_id: string;
          status: ProgressStatus;
          stars: number;
          best_attempts: number;
          best_time_ms: number | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          level_id: string;
          status: ProgressStatus;
          stars?: number;
          best_attempts?: number;
          best_time_ms?: number | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          level_id?: string;
          status?: ProgressStatus;
          stars?: number;
          best_attempts?: number;
          best_time_ms?: number | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'level_progress_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'level_progress_level_id_fkey';
            columns: ['level_id'];
            isOneToOne: false;
            referencedRelation: 'levels';
            referencedColumns: ['id'];
          },
        ];
      };
      level_attempts: {
        Row: {
          id: string;
          profile_id: string;
          level_id: string;
          attempt_number: number;
          successful: boolean;
          actions_used: number;
          optimal_actions: number | null;
          collisions: number;
          hints_used: number;
          program_changes: number;
          time_to_complete_ms: number | null;
          error_types: Json;
          program_data: Json;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          level_id: string;
          attempt_number: number;
          successful: boolean;
          actions_used: number;
          optimal_actions?: number | null;
          collisions?: number;
          hints_used?: number;
          program_changes?: number;
          time_to_complete_ms?: number | null;
          error_types?: Json;
          program_data?: Json;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          level_id?: string;
          attempt_number?: number;
          successful?: boolean;
          actions_used?: number;
          optimal_actions?: number | null;
          collisions?: number;
          hints_used?: number;
          program_changes?: number;
          time_to_complete_ms?: number | null;
          error_types?: Json;
          program_data?: Json;
          started_at?: string;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'level_attempts_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'level_attempts_level_id_fkey';
            columns: ['level_id'];
            isOneToOne: false;
            referencedRelation: 'levels';
            referencedColumns: ['id'];
          },
        ];
      };
      mastery: {
        Row: {
          id: string;
          profile_id: string;
          concept_id: string;
          score: number;
          status: string;
          evidence_count: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          concept_id: string;
          score?: number;
          status?: string;
          evidence_count?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          concept_id?: string;
          score?: number;
          status?: string;
          evidence_count?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'mastery_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mastery_concept_id_fkey';
            columns: ['concept_id'];
            isOneToOne: false;
            referencedRelation: 'concepts';
            referencedColumns: ['id'];
          },
        ];
      };
      learning_events: {
        Row: {
          id: string;
          profile_id: string;
          level_id: string | null;
          attempt_id: string | null;
          event_type: string;
          event_data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          level_id?: string | null;
          attempt_id?: string | null;
          event_type: string;
          event_data?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          level_id?: string | null;
          attempt_id?: string | null;
          event_type?: string;
          event_data?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'learning_events_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      ai_interactions: {
        Row: {
          id: string;
          profile_id: string;
          level_id: string | null;
          attempt_id: string | null;
          type: AiInteractionType;
          hint_level: number | null;
          context: Json;
          response: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          level_id?: string | null;
          attempt_id?: string | null;
          type: AiInteractionType;
          hint_level?: number | null;
          context?: Json;
          response: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          level_id?: string | null;
          attempt_id?: string | null;
          type?: AiInteractionType;
          hint_level?: number | null;
          context?: Json;
          response?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ai_interactions_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
