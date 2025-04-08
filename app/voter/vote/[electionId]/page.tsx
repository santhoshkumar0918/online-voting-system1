"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { VoteForm } from "@/components/voter/vote-form";
import { Election, Candidate } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";

export default function VotePage() {
  const { electionId } = useParams();
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const fetchElectionData = async () => {
      if (!user) return;

      try {
        // Fetch election details
        const { data: electionData, error: electionError } = await supabase
          .from("elections")
          .select("*")
          .eq("id", electionId)
          .single();

        if (electionError) throw electionError;

        setElection(electionData);

        // Check if election is active
        const now = new Date();
        const startDate = new Date(electionData.start_date);
        const endDate = new Date(electionData.end_date);

        if (
          electionData.status !== "active" ||
          now < startDate ||
          now > endDate
        ) {
          toast.error("This election is not currently active for voting.");
          router.push("/voter/dashboard");
          return;
        }

        // Fetch candidates
        const { data: candidatesData, error: candidatesError } = await supabase
          .from("candidates")
          .select("*")
          .eq("election_id", electionId);

        if (candidatesError) throw candidatesError;
        setCandidates(candidatesData || []);

        // Check if the user has already voted
        const { data: voteData, error: voteError } = await supabase
          .from("votes")
          .select("id")
          .eq("election_id", electionId)
          .eq("voter_id", user.id);

        if (voteError) throw voteError;
        setHasVoted(voteData && voteData.length > 0);
      } catch (error) {
        console.error("Error fetching election data:", error);
        toast.error("Failed to load election data. Please try again.");
        router.push("/voter/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchElectionData();
  }, [electionId, user, router]);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!election) {
    return <div className="text-center py-12">Election not found.</div>;
  }

  if (hasVoted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Already Voted</CardTitle>
          <CardDescription>
            You have already cast your vote in this election.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Thank you for participating in this election.</p>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => router.push("/voter/dashboard")}
          >
            Return to Dashboard
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{election.title}</h2>
        <p className="text-muted-foreground">
          Cast your vote in this election. You can only vote once.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Election Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{election.description}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Start Date:</span>{" "}
              {new Date(election.start_date).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">End Date:</span>{" "}
              {new Date(election.end_date).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>

      <VoteForm electionId={electionId as string} candidates={candidates} />
    </div>
  );
}
