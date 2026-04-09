import type { Metadata } from "next";
import { Montserrat, Manrope } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin","cyrillic"],
  weight: ["600","700","800"],
  variable: "--font-heading"
});

const manrope = Manrope({
  subsets: ["latin","cyrillic"],
  weight: ["400","500","600"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "Высота 90 — Смотровая площадка Москва-Сити",
  description: "Панорамная смотровая площадка на 90 этаже Москва-Сити.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${montserrat.variable} ${manrope.variable}`}>
        {children}
      </body>
    </html>
  );
}
