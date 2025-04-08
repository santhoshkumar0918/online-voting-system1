import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="mt-2 text-gray-600">
            Welcome back! Please sign in to continue.
          </p>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
