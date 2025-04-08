import { ActiveElections } from "@/components/voter/active-elections";
import { PastVotes } from "@/components/voter/past-votes";

export default function VoterDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Voter Dashboard</h2>
        <p className="text-muted-foreground">
          View active elections and your voting history.
        </p>
      </div>
      <ActiveElections />
      <PastVotes />
    </div>
  );
}
