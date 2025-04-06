import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Online Voting System</h1>
          <p className="mt-2 text-gray-600">
            Secure, transparent, and easy-to-use voting platform
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-medium">For Voters</h2>
            <div className="flex space-x-2">
              <Button asChild className="w-full">
                <Link href="/voter/login">Login</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/voter/signup">Register</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-medium">For Election Committee</h2>
            <div className="flex space-x-2">
              <Button asChild className="w-full" variant="secondary">
                <Link href="/committee/login">Login</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/committee/signup">Register</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
          <p>Simple and secure voting system for your organization.</p>
        </div>
      </div>
    </main>
  );
}
