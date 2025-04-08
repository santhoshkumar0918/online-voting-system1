import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "active";

  try {
    const { data, error } = await supabase
      .from("elections")
      .select("*")
      .eq("status", status);

    if (error) throw error;

    return NextResponse.json({ elections: data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch elections" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, start_date, end_date, candidates } = body;

    // Basic validation
    if (
      !title ||
      !description ||
      !start_date ||
      !end_date ||
      !candidates ||
      candidates.length < 2
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert election
    const { data: election, error: electionError } = await supabase
      .from("elections")
      .insert({
        title,
        description,
        start_date,
        end_date,
        created_by: userId,
        status: "draft",
      })
      .select()
      .single();

    if (electionError) throw electionError;

    // Insert candidates
    const candidatesWithElectionId = candidates.map((candidate: any) => ({
      ...candidate,
      election_id: election.id,
    }));

    const { error: candidatesError } = await supabase
      .from("candidates")
      .insert(candidatesWithElectionId);

    if (candidatesError) throw candidatesError;

    return NextResponse.json(
      {
        success: true,
        election,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to create election" },
      { status: 500 }
    );
  }
}
