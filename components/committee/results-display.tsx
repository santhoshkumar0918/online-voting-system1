// "use client";

// import { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import { supabase } from "@/lib/supabase";
// import { ElectionResult, Election, Candidate } from "@/lib/types";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import toast from "react-hot-toast";

// export function ResultsDisplay() {
//   const [elections, setElections] = useState<Election[]>([]);
//   const [selectedElection, setSelectedElection] = useState<string | null>(null);
//   const [results, setResults] = useState<ElectionResult[]>([]);
//   const [candidates, setCandidates] = useState<Candidate[]>([]);
//   const [totalVotes, setTotalVotes] = useState<number>(0);
//   const searchParams = useSearchParams();

//   useEffect(() => {
//     const fetchElections = async () => {
//       try {
//         const { data, error } = await supabase
//           .from("elections")
//           .select("*")
//           .eq("status", "completed")
//           .order("end_date", { ascending: false });

//         if (error) throw error;
//         setElections(data || []);

//         // If election ID is in URL params, select it
//         const electionId = searchParams.get("id");
//         if (electionId && data?.some((e) => e.id === electionId)) {
//           setSelectedElection(electionId);
//           fetchResults(electionId);
//         }
//       } catch (error) {
//         console.error("Error fetching elections:", error);
//         toast.error("Failed to load elections. Please try again.");
//       }
//     };

//     fetchElections();
//   }, [searchParams]);

//   const fetchResults = async (electionId: string) => {
//     try {
//       // Fetch candidates for this election
//       const { data: candidatesData, error: candidatesError } = await supabase
//         .from("candidates")
//         .select("*")
//         .eq("election_id", electionId);

//       if (candidatesError) throw candidatesError;
//       setCandidates(candidatesData || []);

//       // Count votes for each candidate
//       const { data: votesData, error: votesError } = (await supabase
//         .from("votes")
//         .select("candidate_id, count:count(*)", { count: "exact", head: false })
//         .eq("election_id", electionId)) as {
//         data: { candidate_id: string; count: string }[] | null;
//         error: any;
//       };

//       if (votesError) throw votesError;

//       // Format results
//       const formattedResults = candidatesData
//         .map((candidate) => {
//           const voteInfo = votesData?.find(
//             (v) => v.candidate_id === candidate.id
//           );
//           return {
//             candidate_id: candidate.id,
//             candidate_name: candidate.name,
//             vote_count: voteInfo ? parseInt(voteInfo.count) : 0,
//           };
//         })
//         .sort((a, b) => b.vote_count - a.vote_count);

//       setResults(formattedResults);
//       setTotalVotes(
//         formattedResults.reduce((sum, result) => sum + result.vote_count, 0)
//       );
//     } catch (error) {
//       console.error("Error fetching results:", error);
//       toast.error("Failed to load election results. Please try again.");
//     }
//   };

//   const handleElectionChange = (value: string) => {
//     setSelectedElection(value);
//     fetchResults(value);
//   };

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>Election Results</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             <div className="max-w-xs">
//               <Select
//                 value={selectedElection || ""}
//                 onValueChange={handleElectionChange}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select an election" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {elections.map((election) => (
//                     <SelectItem key={election.id} value={election.id}>
//                       {election.title}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {selectedElection && results.length > 0 ? (
//               <div className="space-y-6 mt-6">
//                 <div className="grid gap-4">
//                   {results.map((result, index) => (
//                     <div key={result.candidate_id} className="space-y-2">
//                       <div className="flex justify-between items-center">
//                         <div>
//                           <span className="font-medium">
//                             {result.candidate_name}
//                           </span>
//                           {index === 0 && (
//                             <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded">
//                               Winner
//                             </span>
//                           )}
//                         </div>
//                         <span className="text-sm font-medium">
//                           {result.vote_count} vote
//                           {result.vote_count !== 1 ? "s" : ""}
//                           {totalVotes > 0 &&
//                             ` (${Math.round(
//                               (result.vote_count / totalVotes) * 100
//                             )}%)`}
//                         </span>
//                       </div>
//                       <div className="w-full bg-gray-200 rounded-full h-2.5">
//                         <div
//                           className="bg-blue-600 h-2.5 rounded-full"
//                           style={{
//                             width:
//                               totalVotes > 0
//                                 ? `${(result.vote_count / totalVotes) * 100}%`
//                                 : "0%",
//                           }}
//                         ></div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//                 <div className="text-sm text-gray-500 pt-4 border-t">
//                   Total votes: {totalVotes}
//                 </div>
//               </div>
//             ) : selectedElection ? (
//               <div className="py-8 text-center text-gray-500">
//                 No votes recorded for this election yet.
//               </div>
//             ) : (
//               <div className="py-8 text-center text-gray-500">
//                 Select an election to view results.
//               </div>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
// components/committee/results-display.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ElectionResult, Election, Candidate } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";

export function ResultsDisplay() {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<string | null>(null);
  const [results, setResults] = useState<ElectionResult[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchElections = async () => {
      try {
        // Modified query - fetch all completed elections
        const { data, error } = await supabase
          .from("elections")
          .select("*")
          .eq("status", "completed")
          .order("end_date", { ascending: false });

        if (error) throw error;
        setElections(data || []);

        // If election ID is in URL params, select it
        const electionId = searchParams.get("id");
        if (electionId && data?.some((e) => e.id === electionId)) {
          setSelectedElection(electionId);
          fetchResults(electionId);
        }
      } catch (error) {
        console.error("Error fetching elections:", error);
        toast.error("Failed to load elections. Please try again.");
      }
    };

    fetchElections();
  }, [searchParams, toast]);

  const fetchResults = async (electionId: string) => {
    try {
      // Fetch candidates for this election
      const { data: candidatesData, error: candidatesError } = await supabase
        .from("candidates")
        .select("*")
        .eq("election_id", electionId);

      if (candidatesError) throw candidatesError;
      setCandidates(candidatesData || []);

      // Count votes for each candidate
      const candidateIds = candidatesData.map((c) => c.id);

      // For each candidate, count votes
      const resultsData = [];
      let totalVoteCount = 0;

      for (const candidate of candidatesData) {
        const { count, error } = await supabase
          .from("votes")
          .select("*", { count: "exact", head: true })
          .eq("election_id", electionId)
          .eq("candidate_id", candidate.id);

        if (error) throw error;

        const voteCount = count || 0;
        totalVoteCount += voteCount;

        resultsData.push({
          candidate_id: candidate.id,
          candidate_name: candidate.name,
          vote_count: voteCount,
        });
      }

      // Sort results by vote count (descending)
      resultsData.sort((a, b) => b.vote_count - a.vote_count);

      setResults(resultsData);
      setTotalVotes(totalVoteCount);
    } catch (error) {
      console.error("Error fetching results:", error);
      toast.error("Failed to load election results. Please try again.");
    }
  };

  const handleElectionChange = (value: string) => {
    setSelectedElection(value);
    fetchResults(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Election Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="max-w-xs">
              <Select
                value={selectedElection || ""}
                onValueChange={handleElectionChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an election" />
                </SelectTrigger>
                <SelectContent>
                  {elections.map((election) => (
                    <SelectItem key={election.id} value={election.id}>
                      {election.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedElection && results.length > 0 ? (
              <div className="space-y-6 mt-6">
                <div className="grid gap-4">
                  {results.map((result, index) => (
                    <div key={result.candidate_id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">
                            {result.candidate_name}
                          </span>
                          {index === 0 && (
                            <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded">
                              Winner
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-medium">
                          {result.vote_count} vote
                          {result.vote_count !== 1 ? "s" : ""}
                          {totalVotes > 0 &&
                            ` (${Math.round(
                              (result.vote_count / totalVotes) * 100
                            )}%)`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{
                            width:
                              totalVotes > 0
                                ? `${(result.vote_count / totalVotes) * 100}%`
                                : "0%",
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-500 pt-4 border-t">
                  Total votes: {totalVotes}
                </div>
              </div>
            ) : selectedElection ? (
              <div className="py-8 text-center text-gray-500">
                No votes recorded for this election yet.
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                Select an election to view results.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
