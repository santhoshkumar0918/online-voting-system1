import { ElectionList } from "@/components/committee/election-list";

export default function CommitteeDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Committee Dashboard
        </h2>
        <p className="text-muted-foreground">
          Manage elections, view results, and create new voting events.
        </p>
      </div>
      <ElectionList />
    </div>
  );
}
