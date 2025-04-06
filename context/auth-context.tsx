"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import { User } from "@/types/database.types";
import { useRouter } from "next/navigation";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    role: "voter" | "committee"
  ) => Promise<{ error: any | null }>;
  signUp: (
    email: string,
    password: string,
    name: string,
    voterId: string | null,
    role: "voter" | "committee"
  ) => Promise<{ error: any | null }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: userData, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (userData && !error) {
          setUser(userData as User);
        }
      }

      setIsLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          const { data: userData, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (userData && !error) {
            setUser(userData as User);
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const login = async (
    email: string,
    password: string,
    role: "voter" | "committee"
  ) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      // Check if user has correct role
      if (data.user) {
        const { data: userData, error: roleError } = await supabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (roleError || !userData) {
          await supabase.auth.signOut();
          return { error: new Error("User not found") };
        }

        if (userData.role !== role) {
          await supabase.auth.signOut();
          return { error: new Error(`You're not authorized as ${role}`) };
        }

        // Redirect based on role
        if (role === "voter") {
          router.push("/voter/dashboard");
        } else {
          router.push("/committee/dashboard");
        }
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    voterId: string | null,
    role: "voter" | "committee"
  ) => {
    try {
      // First create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      // Then create user profile
      if (data.user) {
        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          email,
          name,
          voter_id: voterId,
          role,
        });

        if (profileError) {
          // Cleanup if profile creation fails
          return { error: profileError };
        }

        // Redirect based on role
        if (role === "voter") {
          router.push("/voter/dashboard");
        } else {
          router.push("/committee/dashboard");
        }
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
