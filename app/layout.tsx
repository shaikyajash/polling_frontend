import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthInitializer from "@/components/auth/AuthInitializer";
import { getSession } from "@/lib/auth-actions";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Polling App",
  description: "Secure Polling App with Passkeys",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const user = await getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthInitializer user={user} />
        <Navbar />
        <main>
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
