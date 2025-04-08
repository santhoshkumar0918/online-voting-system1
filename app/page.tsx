import { Button } from "@/components/ui/button";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Home() {
  const user = await currentUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Simple Voting System</h1>
        <p className="text-xl text-gray-600">Secure and easy online voting</p>
      </div>

      <div className="flex gap-4">
        {user ? (
          <Button asChild>
            <Link href="/voter/dashboard">Go to Dashboard</Link>
          </Button>
        ) : (
          <>
            <Button asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
