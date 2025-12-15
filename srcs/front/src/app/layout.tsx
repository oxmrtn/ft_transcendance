
import "./globals.css";
import { GeistSans } from "geist/font/sans";

export const metadata = {
  title: "VersuS Code",
  description: "VersuS Code",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={GeistSans.className}>
        {children}
      </body>
    </html>
  );
}
