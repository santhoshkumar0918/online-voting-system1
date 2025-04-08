import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { election_id, candidate_id } = body;

    if (!election_id || !candidate_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if election is active
    const { data: election, error: electionError } = await supabase
      .from("elections")
      .select("status, start_date, end_date")
      .eq("id", election_id)
      .single();

    if (electionError) {
      if (electionError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Election not found" },
          { status: 404 }
        );
      }
      throw electionError;
    }

    const now = new Date();
    const startDate = new Date(election.start_date);
    const endDate = new Date(election.end_date);

    if (election.status !== "active" || now < startDate || now > endDate) {
      return NextResponse.json(
        { error: "Election is not currently active" },
        { status: 400 }
      );
    }

    // Check if user has already voted
    const { data: existingVote, error: checkError } = await supabase
      .from("votes")
      .select("id")
      .eq("election_id", election_id)
      .eq("voter_id", userId);

    if (checkError) throw checkError;

    if (existingVote && existingVote.length > 0) {
      return NextResponse.json(
        { error: "You have already voted in this election" },
        { status: 400 }
      );
    }

    // Register the vote
    const { data: vote, error: voteError } = await supabase
      .from("votes")
      .insert({
        election_id,
        voter_id: userId,
        candidate_id,
      })
      .select()
      .single();

    if (voteError) throw voteError;

    return NextResponse.json(
      {
        success: true,
        vote,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to register vote" },
      { status: 500 }
    );
  }
}
