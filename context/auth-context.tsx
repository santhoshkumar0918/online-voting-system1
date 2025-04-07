// // // "use client";

// // // import { createContext, useContext, useEffect, useState } from "react";
// // // import { createSupabaseClient } from "@/lib/supabase";
// // // import { User } from "@/types/database.types";
// // // import { useRouter } from "next/navigation";

// // // type AuthContextType = {
// // //   user: User | null;
// // //   isLoading: boolean;
// // //   login: (
// // //     email: string,
// // //     password: string,
// // //     role: "voter" | "committee"
// // //   ) => Promise<{ error: any | null }>;
// // //   signUp: (
// // //     email: string,
// // //     password: string,
// // //     name: string,
// // //     voterId: string | null,
// // //     role: "voter" | "committee"
// // //   ) => Promise<{ error: any | null }>;
// // //   logout: () => Promise<void>;
// // // };

// // // const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // // export function AuthProvider({ children }: { children: React.ReactNode }) {
// // //   const [user, setUser] = useState<User | null>(null);
// // //   const [isLoading, setIsLoading] = useState(true);
// // //   const supabase = createSupabaseClient();
// // //   const router = useRouter();

// // //   useEffect(() => {
// // //     const fetchUser = async () => {
// // //       const {
// // //         data: { session },
// // //       } = await supabase.auth.getSession();

// // //       if (session?.user) {
// // //         const { data: userData, error } = await supabase
// // //           .from("users")
// // //           .select("*")
// // //           .eq("id", session.user.id)
// // //           .single();

// // //         if (userData && !error) {
// // //           setUser(userData as User);
// // //         }
// // //       }

// // //       setIsLoading(false);
// // //     };

// // //     fetchUser();

// // //     const { data: authListener } = supabase.auth.onAuthStateChange(
// // //       async (event, session) => {
// // //         if (event === "SIGNED_IN" && session) {
// // //           const { data: userData, error } = await supabase
// // //             .from("users")
// // //             .select("*")
// // //             .eq("id", session.user.id)
// // //             .single();

// // //           if (userData && !error) {
// // //             setUser(userData as User);
// // //           }
// // //         } else if (event === "SIGNED_OUT") {
// // //           setUser(null);
// // //         }
// // //       }
// // //     );

// // //     return () => {
// // //       authListener.subscription.unsubscribe();
// // //     };
// // //   }, [supabase]);

// // //   const login = async (
// // //     email: string,
// // //     password: string,
// // //     role: "voter" | "committee"
// // //   ) => {
// // //     try {
// // //       console.log("Login attempt:", email, role);

// // //       const { data, error } = await supabase.auth.signInWithPassword({
// // //         email,
// // //         password,
// // //       });

// // //       if (error) {
// // //         console.error("Authentication error:", error);
// // //         return { error };
// // //       }

// // //       console.log("Auth success, checking role");

// // //       // Check if user has correct role
// // //       if (data.user) {
// // //         const { data: userData, error: roleError } = await supabase
// // //           .from("users")
// // //           .select("role")
// // //           .eq("id", data.user.id)
// // //           .single();

// // //         if (roleError || !userData) {
// // //           console.error("User not found in users table:", roleError);
// // //           await supabase.auth.signOut();
// // //           return { error: new Error("User not found") };
// // //         }

// // //         if (userData.role !== role) {
// // //           console.error("Role mismatch:", userData.role, "vs", role);
// // //           await supabase.auth.signOut();
// // //           return { error: new Error(`You're not authorized as ${role}`) };
// // //         }

// // //         console.log("Login successful, redirecting");

// // //         // Redirect based on role
// // //         if (role === "voter") {
// // //           router.push("/voter/dashboard");
// // //         } else {
// // //           router.push("/committee/dashboard");
// // //         }
// // //       }

// // //       return { error: null };
// // //     } catch (error) {
// // //       console.error("Unexpected login error:", error);
// // //       return { error };
// // //     }
// // //   };

// // //   const signUp = async (
// // //     email: string,
// // //     password: string,
// // //     name: string,
// // //     voterId: string | null,
// // //     role: "voter" | "committee"
// // //   ) => {
// // //     try {
// // //       // First create auth user
// // //       const { data, error } = await supabase.auth.signUp({
// // //         email,
// // //         password,
// // //       });

// // //       if (error) {
// // //         return { error };
// // //       }

// // //       // Then create user profile
// // //       if (data.user) {
// // //         const { error: profileError } = await supabase.from("users").insert({
// // //           id: data.user.id,
// // //           email,
// // //           name,
// // //           voter_id: voterId,
// // //           role,
// // //         });

// // //         if (profileError) {
// // //           // Cleanup if profile creation fails
// // //           console.error("Profile creation error:", profileError);
// // //           return { error: profileError };
// // //         }

// // //         // Redirect based on role
// // //         if (role === "voter") {
// // //           router.push("/voter/dashboard");
// // //         } else {
// // //           router.push("/committee/dashboard");
// // //         }
// // //       }

// // //       return { error: null };
// // //     } catch (error) {
// // //       console.error("Signup error:", error);
// // //       return { error };
// // //     }
// // //   };

// // //   const logout = async () => {
// // //     await supabase.auth.signOut();
// // //     router.push("/");
// // //   };

// // //   return (
// // //     <AuthContext.Provider value={{ user, isLoading, login, signUp, logout }}>
// // //       {children}
// // //     </AuthContext.Provider>
// // //   );
// // // }

// // // export function useAuth() {
// // //   const context = useContext(AuthContext);
// // //   if (context === undefined) {
// // //     throw new Error("useAuth must be used within an AuthProvider");
// // //   }
// // //   return context;
// // // }

// // "use client";

// // import { createContext, useContext, useEffect, useState } from "react";
// // import { createSupabaseClient } from "@/lib/supabase";
// // import { User } from "@/types/database.types";
// // import { useRouter } from "next/navigation";

// // type AuthContextType = {
// //   user: User | null;
// //   isLoading: boolean;
// //   login: (
// //     email: string,
// //     password: string,
// //     role: "voter" | "committee"
// //   ) => Promise<{ error: any | null }>;
// //   signUp: (
// //     email: string,
// //     password: string,
// //     name: string,
// //     voterId: string | null,
// //     role: "voter" | "committee"
// //   ) => Promise<{ error: any | null }>;
// //   logout: () => Promise<void>;
// // };

// // const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // export function AuthProvider({ children }: { children: React.ReactNode }) {
// //   const [user, setUser] = useState<User | null>(null);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const supabase = createSupabaseClient();
// //   const router = useRouter();

// //   useEffect(() => {
// //     const fetchUser = async () => {
// //       const {
// //         data: { session },
// //       } = await supabase.auth.getSession();

// //       if (session?.user) {
// //         const { data: userData, error } = await supabase
// //           .from("users")
// //           .select("*")
// //           .eq("id", session.user.id)
// //           .single();

// //         if (userData && !error) {
// //           setUser(userData as User);
// //         }
// //       }

// //       setIsLoading(false);
// //     };

// //     fetchUser();

// //     const { data: authListener } = supabase.auth.onAuthStateChange(
// //       async (event, session) => {
// //         if (event === "SIGNED_IN" && session) {
// //           const { data: userData, error } = await supabase
// //             .from("users")
// //             .select("*")
// //             .eq("id", session.user.id)
// //             .single();

// //           if (userData && !error) {
// //             setUser(userData as User);
// //           }
// //         } else if (event === "SIGNED_OUT") {
// //           setUser(null);
// //         }
// //       }
// //     );

// //     return () => {
// //       authListener.subscription.unsubscribe();
// //     };
// //   }, [supabase]);

// //   const login = async (
// //     email: string,
// //     password: string,
// //     role: "voter" | "committee"
// //   ) => {
// //     try {
// //       console.log("Login attempt:", email, role);

// //       const { data, error } = await supabase.auth.signInWithPassword({
// //         email,
// //         password,
// //       });

// //       if (error) {
// //         console.error("Authentication error:", error);
// //         return { error };
// //       }

// //       console.log("Auth success, checking role");

// //       // Check if user has correct role
// //       if (data.user) {
// //         const { data: userData, error: roleError } = await supabase
// //           .from("users")
// //           .select("role")
// //           .eq("id", data.user.id)
// //           .single();

// //         if (roleError || !userData) {
// //           console.error("User not found in users table:", roleError);
// //           await supabase.auth.signOut();
// //           return { error: new Error("User not found") };
// //         }

// //         if (userData.role !== role) {
// //           console.error("Role mismatch:", userData.role, "vs", role);
// //           await supabase.auth.signOut();
// //           return { error: new Error(`You're not authorized as ${role}`) };
// //         }

// //         console.log("Login successful, redirecting");

// //         // Redirect based on role
// //         if (role === "voter") {
// //           router.push("/voter/dashboard");
// //         } else {
// //           router.push("/committee/dashboard");
// //         }
// //       }

// //       return { error: null };
// //     } catch (error) {
// //       console.error("Unexpected login error:", error);
// //       return { error };
// //     } finally {
// //       // Always reset loading state in the component that calls this function
// //     }
// //   };

// //   const signUp = async (
// //     email: string,
// //     password: string,
// //     name: string,
// //     voterId: string | null,
// //     role: "voter" | "committee"
// //   ) => {
// //     try {
// //       console.log("Starting signup process for:", email);

// //       // Using the database trigger approach
// //       // Create auth user with metadata that will be used by the trigger
// //       const { data, error } = await supabase.auth.signUp({
// //         email,
// //         password,
// //         options: {
// //           data: {
// //             name,
// //             voter_id: voterId,
// //             role,
// //           },
// //         },
// //       });

// //       if (error) {
// //         console.error("Signup error:", error);
// //         return { error };
// //       }

// //       console.log("Auth signup successful, user created:", data.user?.id);

// //       // Let the user know their account was created successfully
// //       alert("Account created successfully! You can now login.");

// //       // Redirect to login page instead of dashboard, since we require email confirmation
// //       router.push(role === "voter" ? "/voter/login" : "/committee/login");

// //       return { error: null };
// //     } catch (error) {
// //       console.error("Signup error:", error);
// //       return { error };
// //     }
// //   };

// //   const logout = async () => {
// //     await supabase.auth.signOut();
// //     router.push("/");
// //   };

// //   return (
// //     <AuthContext.Provider value={{ user, isLoading, login, signUp, logout }}>
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // }

// // export function useAuth() {
// //   const context = useContext(AuthContext);
// //   if (context === undefined) {
// //     throw new Error("useAuth must be used within an AuthProvider");
// //   }
// //   return context;
// // }

// "use client";

// import { createContext, useContext, useEffect, useState } from "react";
// import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";
// import { createSupabaseClient } from "@/lib/supabase";
// import { useRouter } from "next/navigation";

// type AuthContextType = {
//   user: any | null;
//   isLoading: boolean;
//   userRole: "voter" | "committee" | null;
//   redirectToLogin: () => void;
//   redirectToDashboard: () => void;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const { isLoaded, userId } = useClerkAuth();
//   const { user } = useUser();
//   const [userRole, setUserRole] = useState<"voter" | "committee" | null>(null);
//   const router = useRouter();

//   useEffect(() => {
//     if (isLoaded && user) {
//       // Get role from user public metadata
//       const role = user.publicMetadata.role as
//         | "voter"
//         | "committee"
//         | undefined;
//       setUserRole(role || null);
//     } else {
//       setUserRole(null);
//     }
//   }, [isLoaded, user]);

//   const redirectToLogin = () => {
//     router.push("/voter/login");
//   };

//   const redirectToDashboard = () => {
//     if (userRole === "voter") {
//       router.push("/voter/dashboard");
//     } else if (userRole === "committee") {
//       router.push("/committee/dashboard");
//     } else {
//       router.push("/");
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isLoading: !isLoaded,
//         userRole,
//         redirectToLogin,
//         redirectToDashboard,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// }

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

type AuthContextType = {
  user: any | null;
  isLoading: boolean;
  userRole: "voter" | "committee" | null;
  redirectToLogin: () => void;
  redirectToDashboard: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId } = useClerkAuth();
  const { user } = useUser();
  const [userRole, setUserRole] = useState<"voter" | "committee" | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      // Get role from user public metadata
      const role = user.publicMetadata.role as
        | "voter"
        | "committee"
        | undefined;
      setUserRole(role || null);
    } else {
      setUserRole(null);
    }
  }, [isLoaded, user]);

  const redirectToLogin = () => {
    router.push("/voter/login");
  };

  const redirectToDashboard = () => {
    if (userRole === "voter") {
      router.push("/voter/dashboard");
    } else if (userRole === "committee") {
      router.push("/committee/dashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: !isLoaded,
        userRole,
        redirectToLogin,
        redirectToDashboard,
      }}
    >
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
