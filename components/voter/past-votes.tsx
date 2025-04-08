"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";

interface VoteHistory {
  election_title: string;
  election_end_date: string;
  candidate_name: string;
  voted_at: string;
}

export function PastVotes() {
  const [pastVotes, setPastVotes] = useState<VoteHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const fetchPastVotes = async () => {
      if (!user) return;
      try {
        // Join votes with elections and candidates to get complete information
        const { data, error } = await supabase
          .rpc("get_voter_history", { user_id: user.id })
          .order("voted_at", { ascending: false });

        if (error) throw error;
        setPastVotes(data || []);
      } catch (error) {
        console.error("Error fetching past votes:", error);
        toast.error("Failed to load your voting history. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPastVotes();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Voting History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (pastVotes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Voting History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            You haven't voted in any elections yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Voting History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pastVotes.map((vote, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <h3 className="font-medium">{vote.election_title}</h3>
              <div className="text-sm mt-1">
                <p>
                  You voted for:{" "}
                  <span className="font-medium">{vote.candidate_name}</span>
                </p>
                <p className="text-muted-foreground mt-1">
                  Voted on: {new Date(vote.voted_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
