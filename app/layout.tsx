import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Brayn — A little clarity for your creative work",
  description:
    "Your personal creative workspace. Projects, plans and presentations, together.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
