"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Election } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";

export function ActiveElections() {
  const [elections, setElections] = useState<Election[]>([]);
  const [votedElections, setVotedElections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const fetchActiveElections = async () => {
      if (!user) return;
      try {
        const now = new Date().toISOString();
        // Fetch active elections
        const { data, error } = await supabase
          .from("elections")
          .select("*")
          .eq("status", "active")
          .lte("start_date", now)
          .gte("end_date", now);

        if (error) throw error;
        setElections(data || []);

        // Check which elections the user has already voted in
        if (data && data.length > 0) {
          const electionIds = data.map((e) => e.id);
          const { data: votesData, error: votesError } = await supabase
            .from("votes")
            .select("election_id")
            .eq("voter_id", user.id)
            .in("election_id", electionIds);

          if (votesError) throw votesError;
          setVotedElections(votesData?.map((v) => v.election_id) || []);
        }
      } catch (error) {
        console.error("Error fetching active elections:", error);
        toast.error("Failed to load active elections. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveElections();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Elections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (elections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Elections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            There are no active elections at the moment.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Elections</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {elections.map((election) => (
            <div
              key={election.id}
              className="flex justify-between items-center p-4 border rounded-lg"
            >
              <div>
                <h3 className="font-medium">{election.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Ends: {new Date(election.end_date).toLocaleDateString()}
                </p>
              </div>
              <Button
                onClick={() => router.push(`/voter/vote/${election.id}`)}
                disabled={votedElections.includes(election.id)}
              >
                {votedElections.includes(election.id)
                  ? "Already Voted"
                  : "Vote Now"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
