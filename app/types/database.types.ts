export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'user' | 'author' | 'admin'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          role: UserRole
          bio: string | null
          instagram: string | null
          linkedin: string | null
          twitter: string | null
          github: string | null
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          role?: UserRole
          bio?: string | null
          instagram?: string | null
          linkedin?: string | null
          twitter?: string | null
          github?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          role?: UserRole
          bio?: string | null
          instagram?: string | null
          linkedin?: string | null
          twitter?: string | null
          github?: string | null
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          author_id: string
          title: string
          slug: string
          excerpt: string | null
          content: string | null
          cover_image: string | null
          published: boolean
          published_at: string | null
          reading_time_minutes: number | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          slug: string
          excerpt?: string | null
          content?: string | null
          cover_image?: string | null
          published?: boolean
          published_at?: string | null
          reading_time_minutes?: number | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string | null
          cover_image?: string | null
          published?: boolean
          published_at?: string | null
          reading_time_minutes?: number | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      post_likes: {
        Row: { id: string; post_id: string; user_id: string; created_at: string }
        Insert: { id?: string; post_id: string; user_id: string; created_at?: string }
        Update: { id?: string; post_id?: string; user_id?: string; created_at?: string }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          parent_comment_id: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          parent_comment_id?: string | null
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          parent_comment_id?: string | null
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      comment_likes: {
        Row: { id: string; comment_id: string; user_id: string; created_at: string }
        Insert: { id?: string; comment_id: string; user_id: string; created_at?: string }
        Update: { id?: string; comment_id?: string; user_id?: string; created_at?: string }
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: Record<never, never>
  }
}
