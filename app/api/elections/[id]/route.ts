import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const electionId = params.id;

  try {
    // Get election details
    const { data: election, error: electionError } = await supabase
      .from("elections")
      .select("*")
      .eq("id", electionId)
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

    // Get candidates
    const { data: candidates, error: candidatesError } = await supabase
      .from("candidates")
      .select("*")
      .eq("election_id", electionId);

    if (candidatesError) throw candidatesError;

    // Check if user has already voted (for voters)
    const { data: userVote, error: voteError } = await supabase
      .from("votes")
      .select("id, candidate_id")
      .eq("election_id", electionId)
      .eq("voter_id", userId)
      .maybeSingle();

    if (voteError) throw voteError;

    return NextResponse.json({
      election,
      candidates,
      userVote: userVote || null,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch election details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const electionId = params.id;

  try {
    // Verify the user is the creator of the election (committee member)
    const { data: election, error: checkError } = await supabase
      .from("elections")
      .select("created_by")
      .eq("id", electionId)
      .single();

    if (checkError) {
      if (checkError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Election not found" },
          { status: 404 }
        );
      }
      throw checkError;
    }

    if (election.created_by !== userId) {
      return NextResponse.json(
        { error: "Unauthorized to modify this election" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;

    // Update election status
    const { data: updatedElection, error: updateError } = await supabase
      .from("elections")
      .update({ status })
      .eq("id", electionId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      election: updatedElection,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to update election" },
      { status: 500 }
    );
  }
}
