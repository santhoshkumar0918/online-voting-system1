export default authMiddleware({
  publicRoutes: [
    "/",
    "/voter/login",
    "/voter/signup",
    "/committee/login",
    "/committee/signup",
  ],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
