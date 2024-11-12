import Header from "@/components/header";
import "./globals.css";
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/footer/footer";
import NextTopLoader from "nextjs-toploader";

export const metadata = {
  title: "Prositty",
  description:
    "Prositty is a website where you can recommend your favorite places, share them with friends, and view other Reccommendations",
};

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  style: "normal",
  display: "swap",
  variable: "--font-poppins",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable}`}>
      <meta
        name="format-detection"
        content="telephone=no, date=no, email=no, address=no"
      />
      <body>
        <NextTopLoader color="hsl(var(--primary))" showSpinner={false} />
        <Header />
        <div className="min-h-screen bg-background antialiased">{children}</div>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
