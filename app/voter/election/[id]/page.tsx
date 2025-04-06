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
import { Election, Candidate } from "@/types/database.types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import toast from "react-hot-toast";

export default function ElectionVoting({ params }: { params: { id: string } }) {
  const { user, isLoading } = useAuth();
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null
  );
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const supabase = createSupabaseClient();
  const router = useRouter();
  const electionId = params.id;

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !user) {
      router.push("/voter/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchElectionData = async () => {
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
          console.error("Error fetching election:", electionError);

          toast.error("Error fetching election details.");
          router.push("/voter/dashboard");
          return;
        }

        setElection(electionData as Election);

        // Check if user has already voted
        const { data: voteData, error: voteError } = await supabase
          .from("votes")
          .select("candidate_id")
          .eq("election_id", electionId)
          .eq("voter_id", user.id)
          .single();

        if (voteData) {
          setHasVoted(true);
          setUserVote(voteData.candidate_id);
        }

        // Fetch candidates
        const { data: candidatesData, error: candidatesError } = await supabase
          .from("candidates")
          .select("*")
          .eq("election_id", electionId)
          .order("name");

        if (candidatesError) {
          console.error("Error fetching candidates:", candidatesError);
          return;
        }

        setCandidates(candidatesData as Candidate[]);
      } catch (error) {
        console.error("Error loading election data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchElectionData();
  }, [user, electionId, supabase, router, toast]);

  const handleVote = async () => {
    if (!selectedCandidate || !user || !election) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("votes").insert({
        election_id: electionId,
        voter_id: user.id,
        candidate_id: selectedCandidate,
      });

      if (error) {
        toast.error("Error submitting your vote.");

        return;
      }

      toast.success("Vote submitted successfully!");
      setHasVoted(true);
      setUserVote(selectedCandidate);
      router.push("/voter/dashboard");
    } catch (error: any) {
      console.error("Error submitting vote:", error);
      toast.error("An error occurred while submitting your vote.");
    } finally {
      setSubmitting(false);
      setConfirmDialogOpen(false);
    }
  };

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
        <p>Election not found or has been removed.</p>
      </div>
    );
  }

  const isElectionActive = new Date(election.end_time) > new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Vote in Election
          </h1>
          <div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/voter/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
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
            <p>{election.description || "No description provided."}</p>
            {hasVoted && (
              <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
                <p className="font-medium">
                  You have already voted in this election.
                </p>
                <p className="text-sm mt-1">
                  Thank you for participating in this democratic process.
                </p>
              </div>
            )}
            {!isElectionActive && !hasVoted && (
              <div className="mt-4 p-4 bg-yellow-50 text-yellow-700 rounded-md">
                <p className="font-medium">This election has ended.</p>
                <p className="text-sm mt-1">
                  The voting period for this election has ended. You can no
                  longer submit a vote.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <h2 className="text-xl font-semibold mb-4">Candidates</h2>

        {candidates.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p>No candidates found for this election.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <Card
                key={candidate.id}
                className={`cursor-pointer border-2 ${
                  hasVoted
                    ? userVote === candidate.id
                      ? "border-green-500"
                      : "border-gray-200"
                    : selectedCandidate === candidate.id
                    ? "border-blue-500"
                    : "border-gray-200"
                }`}
                onClick={() => {
                  if (!hasVoted && isElectionActive) {
                    setSelectedCandidate(candidate.id);
                  }
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        hasVoted
                          ? userVote === candidate.id
                            ? "bg-green-500 text-white"
                            : "border border-gray-300"
                          : selectedCandidate === candidate.id
                          ? "bg-blue-500 text-white"
                          : "border border-gray-300"
                      }`}
                    >
                      {(hasVoted && userVote === candidate.id) ||
                      (!hasVoted && selectedCandidate === candidate.id) ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : null}
                    </div>
                    <div>
                      <h3 className="font-medium">{candidate.name}</h3>
                      <p className="text-sm text-gray-500">
                        {candidate.description || "No description provided."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!hasVoted && isElectionActive && (
          <div className="mt-6">
            <Button
              onClick={() => setConfirmDialogOpen(true)}
              disabled={!selectedCandidate || submitting}
              className="w-full"
            >
              {submitting ? "Submitting..." : "Submit Vote"}
            </Button>
          </div>
        )}

        <AlertDialog
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Your Vote</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to submit your vote? This action cannot be
                undone, and you cannot change your vote once submitted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleVote}>
                Yes, Submit My Vote
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
