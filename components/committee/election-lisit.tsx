"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Election } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast"; // Changed from shadcn toast
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export function ElectionList() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const fetchElections = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("elections")
          .select("*")
          .eq("created_by", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setElections(data || []);
      } catch (error) {
        console.error("Error fetching elections:", error);
        // Changed to react-hot-toast
        toast.error("Failed to load elections. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, [user]);

  const handleStatusChange = async (
    id: string,
    newStatus: Election["status"]
  ) => {
    // Show loading toast
    const loadingToast = toast.loading("Updating status...");

    try {
      const { error } = await supabase
        .from("elections")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setElections(
        elections.map((election) =>
          election.id === id ? { ...election, status: newStatus } : election
        )
      );

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`Election status changed to ${newStatus}.`);
    } catch (error) {
      console.error("Error updating status:", error);

      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      toast.error("Failed to update status. Please try again.");
    }
  };

  const getStatusBadge = (status: Election["status"]) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (elections.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No elections found. Create your first election!
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push("/committee/create-election")}
          >
            Create Election
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Elections</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {elections.map((election) => (
              <TableRow key={election.id}>
                <TableCell className="font-medium">{election.title}</TableCell>
                <TableCell>{getStatusBadge(election.status)}</TableCell>
                <TableCell>
                  {new Date(election.start_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(election.end_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {election.status === "draft" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(election.id, "active")
                        }
                      >
                        Activate
                      </Button>
                    )}
                    {election.status === "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(election.id, "completed")
                        }
                      >
                        Complete
                      </Button>
                    )}
                    {election.status === "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/committee/results?id=${election.id}`)
                        }
                      >
                        View Results
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
