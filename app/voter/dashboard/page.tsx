"use client";

import { useState } from "react";
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
import { Election } from "@/types/database.types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function VoterDashboard() {
  const { user, isLoading, userRole } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || userRole !== "voter")) {
      redirect("/voter/login");
    }
  }, [isLoading, user, userRole]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Voter Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              Logged in as {user.name}
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Elections</h2>
          {fetchingElections ? (
            <p>Loading elections...</p>
          ) : elections.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p>No active elections found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {elections.map((election) => {
                const hasVoted = votedElections.includes(election.id);
                const isActive = new Date(election.end_time) > new Date();

                return (
                  <Card key={election.id}>
                    <CardHeader>
                      <CardTitle>{election.title}</CardTitle>
                      <CardDescription>
                        {new Date(election.start_time).toLocaleDateString()} -{" "}
                        {new Date(election.end_time).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>
                        {election.description || "No description provided."}
                      </p>
                      <div className="mt-2">
                        {hasVoted ? (
                          <p className="text-green-600 font-medium">
                            You have voted in this election
                          </p>
                        ) : !isActive ? (
                          <p className="text-gray-600 font-medium">
                            This election has ended
                          </p>
                        ) : null}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        variant={hasVoted ? "outline" : "default"}
                        disabled={hasVoted || !isActive}
                        asChild
                      >
                        <Link href={`/voter/election/${election.id}`}>
                          {hasVoted ? "View Your Vote" : "Vote Now"}
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
