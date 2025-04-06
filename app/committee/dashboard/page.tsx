"use client";

import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Election } from "@/types/database.types";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CommitteeDashboard() {
  const { user, isLoading, logout } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [fetchingElections, setFetchingElections] = useState(true);
  const supabase = createSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !user) {
      router.push("/committee/login");
    } else if (!isLoading && user && user.role !== "committee") {
      // Redirect if user is not a committee member
      router.push("/");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchElections = async () => {
      if (!user) return;

      setFetchingElections(true);
      try {
        // Fetch all elections (active and inactive)
        const { data: electionsData, error: electionsError } = await supabase
          .from("elections")
          .select("*")
          .order("start_time", { ascending: false });

        if (electionsError) {
          console.error("Error fetching elections:", electionsError);
          return;
        }

        setElections(electionsData as Election[]);
      } catch (error) {
        console.error("Error in election fetch:", error);
      } finally {
        setFetchingElections(false);
      }
    };

    fetchElections();
  }, [user, supabase]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Election Committee Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              Logged in as {user.name}
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Elections</h2>
          <Button asChild>
            <Link href="/committee/create-election">Create New Election</Link>
          </Button>
        </div>

        {fetchingElections ? (
          <p>Loading elections...</p>
        ) : elections.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p>No elections created yet.</p>
              <Button className="mt-4" asChild>
                <Link href="/committee/create-election">
                  Create Your First Election
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {elections.map((election) => {
              const isActive = new Date(election.end_time) > new Date();
              const hasStarted = new Date(election.start_time) <= new Date();

              return (
                <Card key={election.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {election.title}
                      {election.is_active ? (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {isActive
                            ? hasStarted
                              ? "Active"
                              : "Scheduled"
                            : "Ended"}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                          Disabled
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {new Date(election.start_time).toLocaleDateString()} -{" "}
                      {new Date(election.end_time).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{election.description || "No description provided."}</p>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/committee/edit-election/${election.id}`}>
                        Edit
                      </Link>
                    </Button>
                    <Button variant="default" className="w-full" asChild>
                      <Link href={`/committee/results/${election.id}`}>
                        Results
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
