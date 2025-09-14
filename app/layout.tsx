import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pandal-Hopper",
  description: "made with ❤️",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className='dark hydrated'>
    <body>
       {children}
      </body>
    </html>
  );
}
