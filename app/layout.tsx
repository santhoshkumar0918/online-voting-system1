// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import "./globals.css";
// import { AuthProvider } from "@/context/auth-context";
// import { Toaster } from "react-hot-toast";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Online Voting System",
//   description: "Secure and simple online voting system",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <AuthProvider>
//           {children}
//           <Toaster position="top-right" />
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }

import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <ClerkProvider>
        <body>{children}</body>
      </ClerkProvider>
    </html>
  );
}
