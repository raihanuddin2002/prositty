export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          admin_from: string;
          user_id: string;
          valid: boolean;
        };
        Insert: {
          admin_from?: string;
          user_id: string;
          valid?: boolean;
        };
        Update: {
          admin_from?: string;
          user_id?: string;
          valid?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "admins_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      categories: {
        Row: {
          created_at: string;
          created_by: string;
          creator_id: string | null;
          id: string;
          is_child: boolean;
          name: string;
          parent_id: string | null;
          slug: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          creator_id?: string | null;
          id?: string;
          is_child?: boolean;
          name: string;
          parent_id?: string | null;
          slug: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          creator_id?: string | null;
          id?: string;
          is_child?: boolean;
          name?: string;
          parent_id?: string | null;
          slug?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      "favorite-users": {
        Row: {
          favorited_at: string;
          id: string;
          owner_id: string;
          user_id: string;
        };
        Insert: {
          favorited_at?: string;
          id?: string;
          owner_id?: string;
          user_id: string;
        };
        Update: {
          favorited_at?: string;
          id?: string;
          owner_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "favorite-users_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favorite-users_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      favorites: {
        Row: {
          favorited_at: string;
          id: string;
          owner_id: string;
          place_id: string;
        };
        Insert: {
          favorited_at?: string;
          id?: string;
          owner_id?: string;
          place_id: string;
        };
        Update: {
          favorited_at?: string;
          id?: string;
          owner_id?: string;
          place_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "favorites_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favorites_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          }
        ];
      };
      liked: {
        Row: {
          id: string;
          liked_at: string;
          owner_id: string;
          place_id: string | null;
        };
        Insert: {
          id?: string;
          liked_at?: string;
          owner_id?: string;
          place_id?: string | null;
        };
        Update: {
          id?: string;
          liked_at?: string;
          owner_id?: string;
          place_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "liked_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "liked_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          }
        ];
      };
      places: {
        Row: {
          category_id: string | null;
          city: string | null;
          comment: string;
          contact: string | null;
          created_at: string;
          created_by: string;
          id: string;
          link: string | null;
          name: string;
          online: boolean | null;
          tags: string[]
        };
        Insert: {
          category_id?: string | null;
          city?: string | null;
          comment: string;
          contact?: string | null;
          created_at?: string;
          created_by?: string;
          id?: string;
          link?: string | null;
          name: string;
          online?: boolean | null;
        };
        Update: {
          category_id?: string | null;
          city?: string | null;
          comment?: string;
          contact?: string | null;
          created_at?: string;
          created_by?: string;
          id?: string;
          link?: string | null;
          name?: string;
          online?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "places_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "places_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          address: string | null;
          avatar_url: string | null;
          belief: string | null;
          city: string | null;
          country: string | null;
          created_at: string;
          dob: string | null;
          education: string | null;
          full_name: string | null;
          gender: Database["public"]["Enums"]["gender"] | null;
          hobbies: string | null;
          id: string;
          last_active: string;
          last_signal: string | null;
          latitude: number | null;
          location: { coordinates: number[], type:"Point" } | null;
          longitude: number | null;
          profession: string | null;
          race: string | null;
          short_description: string | null;
          updated_at: string | null;
          username: string;
          website: string | null;
        };
        Insert: {
          address?: string | null;
          avatar_url?: string | null;
          belief?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          dob?: string | null;
          education?: string | null;
          full_name?: string | null;
          gender?: Database["public"]["Enums"]["gender"] | null;
          hobbies?: string | null;
          id: string;
          last_active?: string;
          last_signal?: string | null;
          latitude?: number | null;
          location?: unknown | null;
          longitude?: number | null;
          profession?: string | null;
          race?: string | null;
          short_description?: string | null;
          updated_at?: string | null;
          username: string;
          website?: string | null;
        };
        Update: {
          address?: string | null;
          avatar_url?: string | null;
          belief?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          dob?: string | null;
          education?: string | null;
          full_name?: string | null;
          gender?: Database["public"]["Enums"]["gender"] | null;
          hobbies?: string | null;
          id?: string;
          last_active?: string;
          last_signal?: string | null;
          latitude?: number | null;
          location?: unknown | null;
          longitude?: number | null;
          profession?: string | null;
          race?: string | null;
          short_description?: string | null;
          updated_at?: string | null;
          username?: string;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_locations: {
        Args: {
          user_id: string;
        };
        Returns: {
          address: string | null;
          avatar_url: string | null;
          belief: string | null;
          city: string | null;
          country: string | null;
          created_at: string;
          dob: string | null;
          education: string | null;
          full_name: string | null;
          gender: Database["public"]["Enums"]["gender"] | null;
          hobbies: string | null;
          id: string;
          last_active: string;
          last_signal: string | null;
          latitude: number | null;
          location: unknown | null;
          longitude: number | null;
          profession: string | null;
          race: string | null;
          short_description: string | null;
          updated_at: string | null;
          username: string;
          website: string | null;
        }[];
      };
      homepage_stats: {
        Args: Record<PropertyKey, never>;
        Returns: {
          places_count: number;
          profiles_count: number;
          last_login: string;
        }[];
      };
      is_favorite_and_liked: {
        Args: {
          place_id: string;
        };
        Returns: {
          favorite: boolean;
          liked: boolean;
          likes: number;
          follows: number;
        }[];
      };
      count_follows: {
        Args: {
          place_id_to_find: string;
        };
        Returns: number;
      };
    };
    Enums: {
      gender: "male" | "female" | "other";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never;