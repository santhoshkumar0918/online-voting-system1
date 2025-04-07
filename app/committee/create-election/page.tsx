import { CreateElectionForm } from "@/components/committee/create-election-form";

export default function CreateElection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Create New Election
        </h2>
        <p className="text-muted-foreground">
          Set up a new election with title, description, date range, and
          candidates.
        </p>
      </div>
      <CreateElectionForm />
    </div>
  );
}
