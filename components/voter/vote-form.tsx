"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Candidate } from "@/lib/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";

interface VoteFormProps {
  electionId: string;
  candidates: Candidate[];
}

export function VoteForm({ electionId, candidates }: VoteFormProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const handleSubmit = async () => {
    if (!selectedCandidate) {
      toast.error("Please select a candidate to vote for.");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to vote.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if user has already voted
      const { data: existingVote, error: checkError } = await supabase
        .from("votes")
        .select("id")
        .eq("election_id", electionId)
        .eq("voter_id", user.id);

      if (checkError) throw checkError;

      if (existingVote && existingVote.length > 0) {
        toast.error("You have already cast your vote in this election.");
        router.push("/voter/dashboard");
        return;
      }

      // Submit the vote
      const { error } = await supabase.from("votes").insert({
        election_id: electionId,
        voter_id: user.id,
        candidate_id: selectedCandidate,
      });

      if (error) throw error;

      toast.success("Your vote has been successfully recorded.");

      router.push("/voter/dashboard");
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast.error("There was an error submitting your vote. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cast Your Vote</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedCandidate || ""}
          onValueChange={setSelectedCandidate}
        >
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedCandidate(candidate.id)}
              >
                <RadioGroupItem value={candidate.id} id={candidate.id} />
                <div className="flex-1">
                  <Label
                    htmlFor={candidate.id}
                    className="text-base font-medium cursor-pointer"
                  >
                    {candidate.name}
                  </Label>
                  {candidate.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {candidate.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <div className="flex space-x-4 w-full">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/voter/dashboard")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={!selectedCandidate || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Vote"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
