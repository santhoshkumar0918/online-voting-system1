"use client";

import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Election, ElectionResult } from "@/types/database.types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ElectionResults({
  params,
}: {
  params: { id: string };
}) {
  const { user, isLoading } = useAuth();
  const [election, setElection] = useState<Election | null>(null);
  const [results, setResults] = useState<ElectionResult[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();
  const router = useRouter();
  const electionId = params.id;

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
    const fetchResults = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch election details
        const { data: electionData, error: electionError } = await supabase
          .from("elections")
          .select("*")
          .eq("id", electionId)
          .single();

        if (electionError) {
          toast.error("Error fetching election details.");
          router.push("/committee/dashboard");
          return;
        }

        setElection(electionData as Election);

        // Fetch election results using the stored function
        const { data: resultsData, error: resultsError } = await supabase.rpc(
          "get_election_results",
          { election_id: electionId }
        );

        if (resultsError) {
          throw new Error(resultsError.message);
        }

        // Calculate total votes
        let total = 0;
        resultsData.forEach((result: ElectionResult) => {
          total += result.vote_count;
        });

        setResults(resultsData as ElectionResult[]);
        setTotalVotes(total);
      } catch (error: any) {
        console.error("Error fetching election results:", error);
        toast.error("Failed to fetch election results. Please try again.");
        router.push("/committee/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user, electionId, supabase, router, toast]);

  if (isLoading || loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Election not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Election Results
          </h1>
          <Button variant="outline" size="sm" asChild>
            <Link href="/committee/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{election.title}</CardTitle>
            <CardDescription>
              {new Date(election.start_time).toLocaleDateString()} -{" "}
              {new Date(election.end_time).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              {election.description || "No description provided."}
            </p>
            <div className="bg-blue-50 text-blue-700 p-4 rounded-md">
              <p className="font-medium">Total votes cast: {totalVotes}</p>
              <p className="text-sm mt-1">
                {new Date() < new Date(election.end_time)
                  ? "Note: This election is still ongoing. Results may change."
                  : "This election has ended."}
              </p>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-semibold mb-4">Results</h2>

        {results.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p>No votes have been cast in this election yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => {
              const percentage =
                totalVotes > 0 ? (result.vote_count / totalVotes) * 100 : 0;

              return (
                <Card key={result.candidate_id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className="font-medium text-lg">
                          {result.candidate_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {result.vote_count} vote
                          {result.vote_count !== 1 ? "s" : ""} (
                          {percentage.toFixed(1)}%)
                        </p>
                      </div>
                      <div className="text-2xl font-bold">
                        {index === 0 && totalVotes > 0 && (
                          <span className="text-green-600">
                            {percentage.toFixed(1)}%
                          </span>
                        )}
                        {index !== 0 && (
                          <span className="text-gray-500">
                            {percentage.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className={`${
                          index === 0 ? "bg-green-600" : "bg-blue-500"
                        } h-4 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add a way to export results later */}
      </main>
    </div>
  );
}
