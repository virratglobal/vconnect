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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          tenant_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_jobs: {
        Row: {
          campaign_id: string
          completed_at: string | null
          created_at: string
          failed_count: number
          id: string
          last_error: string | null
          processed_count: number
          started_at: string | null
          status: string
          tenant_id: string
          total_recipients: number
          updated_at: string
        }
        Insert: {
          campaign_id: string
          completed_at?: string | null
          created_at?: string
          failed_count?: number
          id?: string
          last_error?: string | null
          processed_count?: number
          started_at?: string | null
          status?: string
          tenant_id: string
          total_recipients?: number
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          completed_at?: string | null
          created_at?: string
          failed_count?: number
          id?: string
          last_error?: string | null
          processed_count?: number
          started_at?: string | null
          status?: string
          tenant_id?: string
          total_recipients?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_jobs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_logs: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          error_message: string | null
          http_status: number | null
          id: string
          log_type: string
          recipient_id: string | null
          request_payload: Json | null
          response_payload: Json | null
          tenant_id: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          error_message?: string | null
          http_status?: number | null
          id?: string
          log_type: string
          recipient_id?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          tenant_id: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          error_message?: string | null
          http_status?: number | null
          id?: string
          log_type?: string
          recipient_id?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_logs_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "campaign_recipients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_media: {
        Row: {
          campaign_id: string | null
          file_name: string
          file_url: string
          id: string
          tenant_id: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          campaign_id?: string | null
          file_name: string
          file_url: string
          id?: string
          tenant_id: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          campaign_id?: string | null
          file_name?: string
          file_url?: string
          id?: string
          tenant_id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_media_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_media_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_recipients: {
        Row: {
          attempts: number
          campaign_id: string
          contact_id: string | null
          created_at: string
          delivered_at: string | null
          error: string | null
          id: string
          meta_error: string | null
          meta_message_id: string | null
          meta_status: string | null
          phone_number_normalized: string
          read_at: string | null
          rendered_variables: Json | null
          sent_at: string | null
          status: Database["public"]["Enums"]["recipient_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          campaign_id: string
          contact_id?: string | null
          created_at?: string
          delivered_at?: string | null
          error?: string | null
          id?: string
          meta_error?: string | null
          meta_message_id?: string | null
          meta_status?: string | null
          phone_number_normalized: string
          read_at?: string | null
          rendered_variables?: Json | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["recipient_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          campaign_id?: string
          contact_id?: string | null
          created_at?: string
          delivered_at?: string | null
          error?: string | null
          id?: string
          meta_error?: string | null
          meta_message_id?: string | null
          meta_status?: string | null
          phone_number_normalized?: string
          read_at?: string | null
          rendered_variables?: Json | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["recipient_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          assigned_to: string | null
          audience_criteria: Json | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          failed_count: number
          id: string
          name: string
          processed_count: number
          scheduled_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          template_id: string | null
          template_snapshot: Json | null
          tenant_id: string
          total_recipients: number
          updated_at: string
          variable_mapping: Json | null
        }
        Insert: {
          assigned_to?: string | null
          audience_criteria?: Json | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          failed_count?: number
          id?: string
          name: string
          processed_count?: number
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          template_id?: string | null
          template_snapshot?: Json | null
          tenant_id: string
          total_recipients?: number
          updated_at?: string
          variable_mapping?: Json | null
        }
        Update: {
          assigned_to?: string | null
          audience_criteria?: Json | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          failed_count?: number
          id?: string
          name?: string
          processed_count?: number
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          template_id?: string | null
          template_snapshot?: Json | null
          tenant_id?: string
          total_recipients?: number
          updated_at?: string
          variable_mapping?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          contact_id: string
          created_at: string
          id: string
          metadata: Json | null
          reference_id: string | null
          tenant_id: string
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          contact_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          tenant_id: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          contact_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_activities_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_groups: {
        Row: {
          contact_id: string
          created_at: string
          created_by: string | null
          group_id: string
          tenant_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          created_by?: string | null
          group_id: string
          tenant_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          created_by?: string | null
          group_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_groups_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_groups_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_imports: {
        Row: {
          created_at: string
          created_by: string | null
          duplicate_rows: number
          file_name: string | null
          id: string
          imported_rows: number
          invalid_rows: number
          source_type: Database["public"]["Enums"]["import_source"]
          tenant_id: string
          total_rows: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          duplicate_rows?: number
          file_name?: string | null
          id?: string
          imported_rows?: number
          invalid_rows?: number
          source_type?: Database["public"]["Enums"]["import_source"]
          tenant_id: string
          total_rows?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          duplicate_rows?: number
          file_name?: string | null
          id?: string
          imported_rows?: number
          invalid_rows?: number
          source_type?: Database["public"]["Enums"]["import_source"]
          tenant_id?: string
          total_rows?: number
        }
        Relationships: [
          {
            foreignKeyName: "contact_imports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_tags: {
        Row: {
          contact_id: string
          created_at: string
          tag_id: string
          tenant_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          tag_id: string
          tenant_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          tag_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_tags_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_tags_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          company: string | null
          country_code: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string | null
          id: string
          name: string | null
          opt_in_date: string | null
          opt_in_source: string | null
          phone_number_normalized: string
          phone_number_raw: string
          source: string | null
          source_import_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          opt_in_date?: string | null
          opt_in_source?: string | null
          phone_number_normalized: string
          phone_number_raw: string
          source?: string | null
          source_import_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          opt_in_date?: string | null
          opt_in_source?: string | null
          phone_number_normalized?: string
          phone_number_raw?: string
          source?: string | null
          source_import_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_activities: {
        Row: {
          activity_type: string
          actor_id: string | null
          conversation_id: string
          created_at: string
          id: string
          metadata: Json
          tenant_id: string
        }
        Insert: {
          activity_type: string
          actor_id?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json
          tenant_id: string
        }
        Update: {
          activity_type?: string
          actor_id?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_activities_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_activities_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_activities_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_assignment_logs: {
        Row: {
          action: string
          assigned_by: string
          assigned_to: string | null
          conversation_id: string
          created_at: string
          id: string
          previous_assignee: string | null
          reason: string | null
          tenant_id: string
        }
        Insert: {
          action: string
          assigned_by: string
          assigned_to?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          previous_assignee?: string | null
          reason?: string | null
          tenant_id: string
        }
        Update: {
          action?: string
          assigned_by?: string
          assigned_to?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          previous_assignee?: string | null
          reason?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_assignment_logs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_assignment_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_internal_notes: {
        Row: {
          author_id: string
          body: string
          conversation_id: string
          created_at: string
          deleted_at: string | null
          id: string
          mentions: Json
          tenant_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          mentions?: Json
          tenant_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          mentions?: Json
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_internal_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_internal_notes_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_internal_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_messages: {
        Row: {
          conversation_id: string
          created_at: string | null
          delivered_at: string | null
          direction: string
          id: string
          media_url: string | null
          message_text: string | null
          message_type: string
          meta_message_id: string | null
          meta_status: string | null
          read_at: string | null
          sent_at: string | null
          tenant_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          delivered_at?: string | null
          direction: string
          id?: string
          media_url?: string | null
          message_text?: string | null
          message_type: string
          meta_message_id?: string | null
          meta_status?: string | null
          read_at?: string | null
          sent_at?: string | null
          tenant_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          delivered_at?: string | null
          direction?: string
          id?: string
          media_url?: string | null
          message_text?: string | null
          message_type?: string
          meta_message_id?: string | null
          meta_status?: string | null
          read_at?: string | null
          sent_at?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          assigned_to: string | null
          contact_id: string | null
          created_at: string
          first_response_at: string | null
          id: string
          last_inbound_at: string | null
          last_message: string | null
          last_message_at: string | null
          phone_number: string
          priority: string
          resolved_at: string | null
          sla_breach_at: string | null
          status: string
          tenant_id: string
          unread_count: number
          updated_at: string
          wa_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          contact_id?: string | null
          created_at?: string
          first_response_at?: string | null
          id?: string
          last_inbound_at?: string | null
          last_message?: string | null
          last_message_at?: string | null
          phone_number: string
          priority?: string
          resolved_at?: string | null
          sla_breach_at?: string | null
          status?: string
          tenant_id?: string
          unread_count?: number
          updated_at?: string
          wa_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          contact_id?: string | null
          created_at?: string
          first_response_at?: string | null
          id?: string
          last_inbound_at?: string | null
          last_message?: string | null
          last_message_at?: string | null
          phone_number?: string
          priority?: string
          resolved_at?: string | null
          sla_breach_at?: string | null
          status?: string
          tenant_id?: string
          unread_count?: number
          updated_at?: string
          wa_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_values: {
        Row: {
          contact_id: string
          created_at: string
          field_id: string
          id: string
          tenant_id: string
          updated_at: string
          value: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string
          field_id: string
          id?: string
          tenant_id: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string
          field_id?: string
          id?: string
          tenant_id?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_values_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_field_values_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "custom_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_field_values_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_fields: {
        Row: {
          created_at: string
          field_key: string
          field_type: string
          id: string
          label: string
          options: Json | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          field_key: string
          field_type?: string
          id?: string
          label: string
          options?: Json | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          field_key?: string
          field_type?: string
          id?: string
          label?: string
          options?: Json | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_fields_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      group_shares: {
        Row: {
          audience_type: string
          can_edit_audience: boolean
          can_manage_contacts: boolean
          can_reshare_audience: boolean
          can_use_in_campaigns: boolean
          can_view_contacts: boolean
          created_at: string
          group_id: string | null
          id: string
          saved_audience_id: string | null
          shared_by: string | null
          shared_with_user: string
          tenant_id: string
        }
        Insert: {
          audience_type: string
          can_edit_audience?: boolean
          can_manage_contacts?: boolean
          can_reshare_audience?: boolean
          can_use_in_campaigns?: boolean
          can_view_contacts?: boolean
          created_at?: string
          group_id?: string | null
          id?: string
          saved_audience_id?: string | null
          shared_by?: string | null
          shared_with_user: string
          tenant_id: string
        }
        Update: {
          audience_type?: string
          can_edit_audience?: boolean
          can_manage_contacts?: boolean
          can_reshare_audience?: boolean
          can_use_in_campaigns?: boolean
          can_view_contacts?: boolean
          created_at?: string
          group_id?: string | null
          id?: string
          saved_audience_id?: string | null
          shared_by?: string | null
          shared_with_user?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_shares_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_shares_saved_audience_id_fkey"
            columns: ["saved_audience_id"]
            isOneToOne: false
            referencedRelation: "saved_audiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_shares_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_shares_shared_with_user_fkey"
            columns: ["shared_with_user"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_shares_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_system_group: boolean | null
          name: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_system_group?: boolean | null
          name: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_system_group?: boolean | null
          name?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "groups_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          approval_status: string | null
          body: string
          category: string | null
          created_at: string
          deleted_at: string | null
          example_media_url: string | null
          footer: string | null
          header: string | null
          header_format: string | null
          header_type: string | null
          id: string
          language: string
          last_sync_at: string | null
          meta_template_id: string | null
          rejection_reason: string | null
          source: string
          submitted_at: string | null
          sync_status: Database["public"]["Enums"]["template_sync_status"]
          template_name: string
          tenant_id: string
          updated_at: string
          variables: Json
          version: number
        }
        Insert: {
          approval_status?: string | null
          body: string
          category?: string | null
          created_at?: string
          deleted_at?: string | null
          example_media_url?: string | null
          footer?: string | null
          header?: string | null
          header_format?: string | null
          header_type?: string | null
          id?: string
          language?: string
          last_sync_at?: string | null
          meta_template_id?: string | null
          rejection_reason?: string | null
          source?: string
          submitted_at?: string | null
          sync_status?: Database["public"]["Enums"]["template_sync_status"]
          template_name: string
          tenant_id: string
          updated_at?: string
          variables?: Json
          version?: number
        }
        Update: {
          approval_status?: string | null
          body?: string
          category?: string | null
          created_at?: string
          deleted_at?: string | null
          example_media_url?: string | null
          footer?: string | null
          header?: string | null
          header_format?: string | null
          header_type?: string | null
          id?: string
          language?: string
          last_sync_at?: string | null
          meta_template_id?: string | null
          rejection_reason?: string | null
          source?: string
          submitted_at?: string | null
          sync_status?: Database["public"]["Enums"]["template_sync_status"]
          template_name?: string
          tenant_id?: string
          updated_at?: string
          variables?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string | null
          campaign_id: string | null
          contact_id: string | null
          conversation_id: string | null
          created_at: string
          delivered_at: string | null
          direction: string
          id: string
          media_url: string | null
          meta_message_id: string | null
          payload: Json | null
          read_at: string | null
          sent_at: string | null
          status: string | null
          tenant_id: string
          type: string
        }
        Insert: {
          body?: string | null
          campaign_id?: string | null
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          delivered_at?: string | null
          direction: string
          id?: string
          media_url?: string | null
          meta_message_id?: string | null
          payload?: Json | null
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          tenant_id: string
          type?: string
        }
        Update: {
          body?: string | null
          campaign_id?: string | null
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          delivered_at?: string | null
          direction?: string
          id?: string
          media_url?: string | null
          meta_message_id?: string | null
          payload?: Json | null
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          tenant_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_super_admin: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_super_admin?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_super_admin?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          messages_per_day: number
          messages_per_hour: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          messages_per_day?: number
          messages_per_hour?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          messages_per_day?: number
          messages_per_hour?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rate_limits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_audiences: {
        Row: {
          created_at: string
          criteria: Json
          description: string | null
          id: string
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criteria?: Json
          description?: string | null
          id?: string
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criteria?: Json
          description?: string | null
          id?: string
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_audiences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      system_errors: {
        Row: {
          context: Json | null
          created_at: string
          error: string
          id: string
          tenant_id: string | null
          type: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          error: string
          id?: string
          tenant_id?: string | null
          type: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          error?: string
          id?: string
          tenant_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_errors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tags_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_assignment_settings: {
        Row: {
          default_agent_id: string | null
          strategy: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          default_agent_id?: string | null
          strategy?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          default_agent_id?: string | null
          strategy?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_assignment_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_branding: {
        Row: {
          branding_level: string
          company_logo: string | null
          company_name: string | null
          created_at: string
          favicon: string | null
          id: string
          primary_color: string | null
          secondary_color: string | null
          support_email: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          branding_level?: string
          company_logo?: string | null
          company_name?: string | null
          created_at?: string
          favicon?: string | null
          id?: string
          primary_color?: string | null
          secondary_color?: string | null
          support_email?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          branding_level?: string
          company_logo?: string | null
          company_name?: string | null
          created_at?: string
          favicon?: string | null
          id?: string
          primary_color?: string | null
          secondary_color?: string | null
          support_email?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_branding_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_members: {
        Row: {
          created_at: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["tenant_role"]
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["tenant_role"]
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["tenant_role"]
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          allow_admin_whatsapp_config: boolean
          branding_level: string
          country: string | null
          created_at: string
          created_by: string | null
          custom_domain: string | null
          id: string
          industry: string | null
          name: string
          slug: string
          suspended: boolean
          timezone: string
          updated_at: string
          webhook_verify_token: string
        }
        Insert: {
          allow_admin_whatsapp_config?: boolean
          branding_level?: string
          country?: string | null
          created_at?: string
          created_by?: string | null
          custom_domain?: string | null
          id?: string
          industry?: string | null
          name: string
          slug: string
          suspended?: boolean
          timezone?: string
          updated_at?: string
          webhook_verify_token?: string
        }
        Update: {
          allow_admin_whatsapp_config?: boolean
          branding_level?: string
          country?: string | null
          created_at?: string
          created_by?: string | null
          custom_domain?: string | null
          id?: string
          industry?: string | null
          name?: string
          slug?: string
          suspended?: boolean
          timezone?: string
          updated_at?: string
          webhook_verify_token?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string
          error: string | null
          event_type: string | null
          id: string
          payload: Json
          processed_at: string | null
          source: string
          tenant_id: string | null
        }
        Insert: {
          created_at?: string
          error?: string | null
          event_type?: string | null
          id?: string
          payload: Json
          processed_at?: string | null
          source?: string
          tenant_id?: string | null
        }
        Update: {
          created_at?: string
          error?: string | null
          event_type?: string | null
          id?: string
          payload?: Json
          processed_at?: string | null
          source?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_credentials: {
        Row: {
          access_token: string | null
          account_name: string
          created_at: string
          display_phone_number: string | null
          graph_api_version: string
          id: string
          is_default: boolean
          last_failure_at: string | null
          last_incoming_webhook_at: string | null
          last_success_at: string | null
          last_successful_message_at: string | null
          last_template_sync_at: string | null
          phone_number_id: string | null
          status: string
          tenant_id: string
          token_expiry_at: string | null
          updated_at: string
          waba_id: string | null
          webhook_verify_token: string | null
        }
        Insert: {
          access_token?: string | null
          account_name?: string
          created_at?: string
          display_phone_number?: string | null
          graph_api_version?: string
          id?: string
          is_default?: boolean
          last_failure_at?: string | null
          last_incoming_webhook_at?: string | null
          last_success_at?: string | null
          last_successful_message_at?: string | null
          last_template_sync_at?: string | null
          phone_number_id?: string | null
          status?: string
          tenant_id: string
          token_expiry_at?: string | null
          updated_at?: string
          waba_id?: string | null
          webhook_verify_token?: string | null
        }
        Update: {
          access_token?: string | null
          account_name?: string
          created_at?: string
          display_phone_number?: string | null
          graph_api_version?: string
          id?: string
          is_default?: boolean
          last_failure_at?: string | null
          last_incoming_webhook_at?: string | null
          last_success_at?: string | null
          last_successful_message_at?: string | null
          last_template_sync_at?: string | null
          phone_number_id?: string | null
          status?: string
          tenant_id?: string
          token_expiry_at?: string | null
          updated_at?: string
          waba_id?: string | null
          webhook_verify_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_credentials_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_edit_group: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      can_manage_contact: {
        Args: { _contact_id: string; _user_id: string }
        Returns: boolean
      }
      can_use_shared_audience: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      can_view_campaign: {
        Args: { _campaign_id: string; _user_id: string }
        Returns: boolean
      }
      can_view_contact: {
        Args: { _contact_id: string; _user_id: string }
        Returns: boolean
      }
      can_view_conversation: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      can_view_group: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      diagnose_campaign: {
        Args: { _campaign_id: string }
        Returns: {
          created_at: string
          error: string
          meta_message_id: string
          phone: string
          recipient_id: string
          rendered_vars: Json
          section: string
          status: string
        }[]
      }
      generate_webhook_verify_token: { Args: never; Returns: string }
      get_contacts_messages_counts: {
        Args: { _contact_ids: string[] }
        Returns: {
          contact_id: string
          count: number
        }[]
      }
      get_webhook_verify_token: { Args: { _tenant: string }; Returns: string }
      get_whatsapp_status: {
        Args: { _tenant_id: string }
        Returns: {
          connected: boolean
          display_phone_number: string
          last_failure_at: string
          last_success_at: string
          status: string
        }[]
      }
      has_tenant_role: {
        Args: {
          _roles: Database["public"]["Enums"]["tenant_role"][]
          _tenant: string
          _user: string
        }
        Returns: boolean
      }
      increment_campaign_counters: {
        Args: { _campaign_id: string; _failed: number; _processed: number }
        Returns: undefined
      }
      is_contact_creator: {
        Args: { _contact_id: string; _user_id: string }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      is_tenant_member: {
        Args: { _tenant: string; _user: string }
        Returns: boolean
      }
      lookup_user_id_by_email: {
        Args: { _email: string; _tenant: string }
        Returns: string
      }
      normalize_phone: { Args: { _raw: string }; Returns: string }
      shares_tenant_with: { Args: { _other: string }; Returns: boolean }
      start_impersonating_tenant: {
        Args: { _tenant_id: string }
        Returns: boolean
      }
      stop_impersonating_tenant: {
        Args: { _tenant_id: string }
        Returns: boolean
      }
      super_admin_get_analytics: { Args: never; Returns: Json }
      super_admin_get_system_errors: {
        Args: never
        Returns: {
          context: Json
          created_at: string
          error: string
          id: string
          tenant_name: string
          type: string
        }[]
      }
      super_admin_get_tenants: {
        Args: never
        Returns: {
          campaign_count: number
          contact_count: number
          created_at: string
          id: string
          member_count: number
          name: string
          slug: string
          suspended: boolean
        }[]
      }
      super_admin_toggle_tenant_status: {
        Args: { _suspended: boolean; _tenant_id: string }
        Returns: boolean
      }
      tenant_role_of: {
        Args: { _tenant: string; _user: string }
        Returns: Database["public"]["Enums"]["tenant_role"]
      }
    }
    Enums: {
      activity_type:
        | "imported"
        | "tag_added"
        | "tag_removed"
        | "group_added"
        | "group_removed"
        | "campaign_sent"
        | "delivered"
        | "read"
        | "replied"
        | "opted_out"
      campaign_status:
        | "draft"
        | "scheduled"
        | "queued"
        | "sending"
        | "paused"
        | "completed"
        | "failed"
        | "cancelled"
        | "processing"
        | "sent_to_meta"
        | "delivered"
        | "read"
        | "partial"
      import_source: "csv" | "bulk_paste" | "manual" | "api"
      recipient_status:
        | "pending"
        | "sending"
        | "sent"
        | "failed"
        | "skipped"
        | "api_failed"
        | "sent_to_meta"
      template_sync_status:
        | "draft"
        | "pending"
        | "approved"
        | "rejected"
        | "disabled"
      tenant_role: "owner" | "admin" | "manager" | "agent"
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
      activity_type: [
        "imported",
        "tag_added",
        "tag_removed",
        "group_added",
        "group_removed",
        "campaign_sent",
        "delivered",
        "read",
        "replied",
        "opted_out",
      ],
      campaign_status: [
        "draft",
        "scheduled",
        "queued",
        "sending",
        "paused",
        "completed",
        "failed",
        "cancelled",
        "processing",
        "sent_to_meta",
        "delivered",
        "read",
        "partial",
      ],
      import_source: ["csv", "bulk_paste", "manual", "api"],
      recipient_status: [
        "pending",
        "sending",
        "sent",
        "failed",
        "skipped",
        "api_failed",
        "sent_to_meta",
      ],
      template_sync_status: [
        "draft",
        "pending",
        "approved",
        "rejected",
        "disabled",
      ],
      tenant_role: ["owner", "admin", "manager", "agent"],
    },
  },
} as const
