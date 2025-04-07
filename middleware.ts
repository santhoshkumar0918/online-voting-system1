import { clerkClient, ClerkProvider } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default ClerkProvider({
  publicRoutes: ["/"],
  async afterAuth(auth, req) {
    // Redirect to sign in if not authenticated and trying to access a private route
    if (!auth.userId && !auth.isPublicRoute) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // If authenticated but accessing root, redirect based on role
    if (auth.userId && req.nextUrl.pathname === "/") {
      try {
        const user = await clerkClient.users.getUser(auth.userId);

        // Check user public metadata for role
        const role = (user.publicMetadata.role as string) || "voter";

        if (role === "committee") {
          return NextResponse.redirect(
            new URL("/committee/dashboard", req.url)
          );
        } else {
          return NextResponse.redirect(new URL("/voter/dashboard", req.url));
        }
      } catch (error) {
        console.error("Error in middleware:", error);
        return NextResponse.next();
      }
    }

    // Committee route protection
    if (auth.userId && req.nextUrl.pathname.startsWith("/committee")) {
      try {
        const user = await clerkClient.users.getUser(auth.userId);
        const role = (user.publicMetadata.role as string) || "voter";

        if (role !== "committee") {
          return NextResponse.redirect(new URL("/voter/dashboard", req.url));
        }
      } catch (error) {
        console.error("Error in middleware:", error);
      }
    }

    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
