import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VoterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Voting System - Voter</h1>
          <nav className="flex items-center gap-6">
            <Button variant="ghost" asChild>
              <Link href="/voter/dashboard">Dashboard</Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto py-8">{children}</main>
    </div>
  );
}
