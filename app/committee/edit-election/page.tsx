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
import { Election, Candidate } from "@/types/database.types";
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

export default function EditElection({ params }: { params: { id: string } }) {
  const { user, isLoading } = useAuth();
  const [election, setElection] = useState<Election | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [candidates, setCandidates] = useState<
    (Candidate & { isNew?: boolean })[]
  >([]);
  const [removedCandidateIds, setRemovedCandidateIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const supabase = createSupabaseClient();
  const router = useRouter();
  //   const { toast } = useToast();
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
          toast.error(
            "An error occurred while fetching election data. Please try again."
          );

          router.push("/committee/dashboard");
          return;
        }

        // Update state with election data
        setElection(electionData as Election);
        setTitle(electionData.title);
        setDescription(electionData.description || "");
        setStartDate(
          new Date(electionData.start_time).toISOString().slice(0, 16)
        );
        setEndDate(new Date(electionData.end_time).toISOString().slice(0, 16));
        setIsActive(electionData.is_active);

        // Fetch candidates
        const { data: candidatesData, error: candidatesError } = await supabase
          .from("candidates")
          .select("*")
          .eq("election_id", electionId)
          .order("name");

        if (candidatesError) {
          throw new Error(candidatesError.message);
        }

        setCandidates(candidatesData as Candidate[]);
      } catch (error: any) {
        toast.error(
          error.message || "An error occurred while fetching election data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchElectionData();
  }, [user, electionId, supabase, router, toast]);

  const addCandidate = () => {
    setCandidates([
      ...candidates,
      {
        id: `new-${Date.now()}`, // Temporary ID for new candidates
        election_id: electionId,
        name: "",
        description: "",
        created_at: new Date().toISOString(),
        isNew: true,
      },
    ]);
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
    const candidateToRemove = candidates[index];

    // If it's not a new candidate, add to removed list
    if (!candidateToRemove.isNew) {
      setRemovedCandidateIds([...removedCandidateIds, candidateToRemove.id]);
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
      // Update the election
      const { error: electionError } = await supabase
        .from("elections")
        .update({
          title,
          description,
          start_time: new Date(startDate).toISOString(),
          end_time: new Date(endDate).toISOString(),
          is_active: isActive,
        })
        .eq("id", electionId);

      if (electionError) {
        throw new Error(electionError.message);
      }

      // Delete removed candidates
      if (removedCandidateIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("candidates")
          .delete()
          .in("id", removedCandidateIds);

        if (deleteError) {
          throw new Error(deleteError.message);
        }
      }

      // Update existing candidates and add new ones
      for (const candidate of candidates) {
        if (candidate.isNew) {
          // Add new candidate
          const { error: addError } = await supabase.from("candidates").insert({
            election_id: electionId,
            name: candidate.name,
            description: candidate.description,
          });

          if (addError) {
            throw new Error(addError.message);
          }
        } else {
          // Update existing candidate
          const { error: updateError } = await supabase
            .from("candidates")
            .update({
              name: candidate.name,
              description: candidate.description,
            })
            .eq("id", candidate.id);

          if (updateError) {
            throw new Error(updateError.message);
          }
        }
      }

      toast.success("Election updated successfully!");
      router.push("/committee/dashboard");
    } catch (error: any) {
      toast.error(
        error.message || "An error occurred while updating the election."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteElection = async () => {
    setSubmitting(true);
    try {
      // First delete candidates
      const { error: candidatesError } = await supabase
        .from("candidates")
        .delete()
        .eq("election_id", electionId);

      if (candidatesError) {
        throw new Error(candidatesError.message);
      }

      // Then delete votes
      const { error: votesError } = await supabase
        .from("votes")
        .delete()
        .eq("election_id", electionId);

      if (votesError) {
        throw new Error(votesError.message);
      }

      // Finally delete the election
      const { error: electionError } = await supabase
        .from("elections")
        .delete()
        .eq("id", electionId);

      if (electionError) {
        throw new Error(electionError.message);
      }

      toast.success("Election deleted successfully!");
      router.push("/committee/dashboard");
    } catch (error: any) {
      toast.error(
        error.message || "An error occurred while deleting the election."
      );
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
        <p>Election not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Edit Election
          </h1>
          <div className="flex space-x-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDialogOpen(true)}
            >
              Delete Election
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/committee/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Election Details</CardTitle>
              <CardDescription>
                Update the details for this election.
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
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Label htmlFor="isActive">Active (visible to voters)</Label>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Candidates</CardTitle>
              <CardDescription>
                Update candidates for this election.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {candidates.map((candidate, index) => (
                <div key={candidate.id} className="p-4 border rounded-md">
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
                        value={candidate.description || ""}
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
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </form>

        <AlertDialog
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the election and all associated
                candidates and votes. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteElection}
                className="bg-red-600 hover:bg-red-700"
              >
                Yes, Delete Election
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
