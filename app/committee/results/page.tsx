import { ResultsDisplay } from "@/components/committee/results-display";

export default function Results() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Election Results</h2>
        <p className="text-muted-foreground">
          View and analyze the results of completed elections.
        </p>
      </div>
      <ResultsDisplay />
    </div>
  );
}
