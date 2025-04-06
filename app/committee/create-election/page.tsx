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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateElection() {
  const { user, isLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [candidates, setCandidates] = useState([{ name: "", description: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createSupabaseClient();
  const router = useRouter();
  //   const { toast } = useToast();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !user) {
      router.push("/committee/login");
    } else if (!isLoading && user && user.role !== "committee") {
      // Redirect if user is not a committee member
      router.push("/");
    }
  }, [user, isLoading, router]);

  const addCandidate = () => {
    setCandidates([...candidates, { name: "", description: "" }]);
  };

  const updateCandidate = (
    index: number,
    field: "name" | "description",
    value: string
  ) => {
    const newCandidates = [...candidates];
    newCandidates[index][field] = value;
    setCandidates(newCandidates);
  };

  const removeCandidate = (index: number) => {
    if (candidates.length === 1) {
      return; // Keep at least one candidate
    }
    const newCandidates = [...candidates];
    newCandidates.splice(index, 1);
    setCandidates(newCandidates);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !startDate || !endDate) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("End date must be after start date.");
      return;
    }

    if (candidates.some((c) => !c.name)) {
      toast.error("Please provide a name for each candidate.");
      return;
    }

    setSubmitting(true);

    try {
      // First, create the election
      const { data: electionData, error: electionError } = await supabase
        .from("elections")
        .insert({
          title,
          description,
          start_time: new Date(startDate).toISOString(),
          end_time: new Date(endDate).toISOString(),
          created_by: user!.id,
          is_active: true,
        })
        .select("id")
        .single();

      if (electionError) {
        throw new Error(electionError.message);
      }

      // Then, create the candidates
      const electionId = electionData.id;
      const candidatesToInsert = candidates.map((candidate) => ({
        election_id: electionId,
        name: candidate.name,
        description: candidate.description,
      }));

      const { error: candidatesError } = await supabase
        .from("candidates")
        .insert(candidatesToInsert);

      if (candidatesError) {
        throw new Error(candidatesError.message);
      }

      toast.success("Election created successfully!");
      router.push("/committee/dashboard");
    } catch (error: any) {
      console.error("Error creating election:", error);
      toast.error("Failed to create election. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
            Create New Election
          </h1>
          <Button variant="outline" size="sm" asChild>
            <Link href="/committee/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Election Details</CardTitle>
              <CardDescription>
                Enter the details for the new election.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title*</Label>
                <Input
                  id="title"
                  placeholder="Election title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of the election"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date*</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date*</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Candidates</CardTitle>
              <CardDescription>
                Add candidates for this election.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {candidates.map((candidate, index) => (
                <div key={index} className="p-4 border rounded-md">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">Candidate {index + 1}</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCandidate(index)}
                      disabled={candidates.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`candidate-name-${index}`}>Name*</Label>
                      <Input
                        id={`candidate-name-${index}`}
                        placeholder="Candidate name"
                        value={candidate.name}
                        onChange={(e) =>
                          updateCandidate(index, "name", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`candidate-desc-${index}`}>
                        Description
                      </Label>
                      <Input
                        id={`candidate-desc-${index}`}
                        placeholder="Brief description or platform"
                        value={candidate.description}
                        onChange={(e) =>
                          updateCandidate(index, "description", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addCandidate}
                className="w-full"
              >
                Add Another Candidate
              </Button>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating..." : "Create Election"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </main>
    </div>
  );
}
