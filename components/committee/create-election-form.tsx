"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { PlusCircle, X } from "lucide-react";

const candidateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
});

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  start_date: z.string(),
  end_date: z.string(),
});

export function CreateElectionForm() {
  const [candidates, setCandidates] = useState<
    { name: string; description: string }[]
  >([]);
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
  });

  const addCandidate = () => {
    try {
      const result = candidateSchema.parse(newCandidate);
      setCandidates([...candidates, result]);
      setNewCandidate({ name: "", description: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid candidate",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    }
  };

  const removeCandidate = (index: number) => {
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (candidates.length < 2) {
      toast({
        title: "Not enough candidates",
        description: "You need at least 2 candidates for an election.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to create an election.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert election
      const { data: election, error: electionError } = await supabase
        .from("elections")
        .insert({
          title: values.title,
          description: values.description,
          start_date: new Date(values.start_date).toISOString(),
          end_date: new Date(values.end_date).toISOString(),
          created_by: user.id,
          status: "draft",
        })
        .select()
        .single();

      if (electionError) throw electionError;

      // Insert candidates
      const candidatesWithElectionId = candidates.map((candidate) => ({
        ...candidate,
        election_id: election.id,
      }));

      const { error: candidatesError } = await supabase
        .from("candidates")
        .insert(candidatesWithElectionId);

      if (candidatesError) throw candidatesError;

      toast({
        title: "Election created",
        description: "Your election has been created successfully.",
      });

      router.push("/committee/dashboard");
    } catch (error) {
      console.error("Error creating election:", error);
      toast({
        title: "Error",
        description:
          "There was an error creating the election. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Election Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Class President Election"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide details about this election..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Candidates</h3>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {candidates.map((candidate, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 border rounded"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{candidate.name}</p>
                        {candidate.description && (
                          <p className="text-sm text-gray-500">
                            {candidate.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCandidate(index)}
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <div className="grid grid-cols-[1fr,auto] gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Input
                          placeholder="Candidate Name"
                          value={newCandidate.name}
                          onChange={(e) =>
                            setNewCandidate({
                              ...newCandidate,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="Description (optional)"
                          value={newCandidate.description}
                          onChange={(e) =>
                            setNewCandidate({
                              ...newCandidate,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addCandidate}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Election"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
