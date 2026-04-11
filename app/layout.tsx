import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin","cyrillic"],
  weight: ["400","500","600","700","800"],
  variable: "--font-apple"
});

export const metadata: Metadata = {
  title: "Высота 90 — Смотровая площадка Москва-Сити",
  description: "Панорамная смотровая площадка на 90 этаже Москва-Сити.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.variable}>
        {children}
      </body>
    </html>
  );
}
