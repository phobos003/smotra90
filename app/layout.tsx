import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const YANDEX_METRIKA_ID = 109081934;

const inter = Inter({
  subsets: ["latin","cyrillic"],
  weight: ["400","500","600","700","800"],
  variable: "--font-apple"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://visota90.ru"),
  title: "Высота 90 — Смотровая площадка Москва-Сити",
  description: "Панорамная смотровая площадка на 90 этаже Москва-Сити. Виды на столицу с высоты 333 метров.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "Высота 90 — Смотровая площадка Москва-Сити",
    description: "Панорамная смотровая площадка на 90 этаже Москва-Сити.",
    url: "https://visota90.ru",
    siteName: "Высота 90",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Высота 90",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){
                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
              })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${YANDEX_METRIKA_ID}', 'ym');
              ym(${YANDEX_METRIKA_ID}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true});
            `,
          }}
        />
      </head>
      <body className={inter.variable}>
        {children}
        <noscript>
          <div>
            <img
              src={`https://mc.yandex.ru/watch/${YANDEX_METRIKA_ID}`}
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
      </body>
    </html>
  );
}
