import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://unma.ac.id"),
  title: "Survei Peminatan Studi ke Perguruan Tinggi - Universitas Majalengka",
  description:
    "Survei peminatan siswa untuk melanjutkan studi ke perguruan tinggi bersama Universitas Majalengka (UNMA) - Kampus Bernas Berkualitas.",
  keywords: [
    "Survei Peminatan Studi",
    "Universitas Majalengka",
    "UNMA",
    "Perguruan Tinggi Majalengka",
    "Bernas Berkualitas",
  ],
  authors: [{ name: "Universitas Majalengka", url: "https://unma.ac.id" }],
  icons: {
    icon: [
      {
        url: "/icon.png",
        sizes: "64x64",
        type: "image/png",
      },
      {
        url: "/favicon.ico",
        sizes: "32x32",
      },
      {
        url: "https://unma.ac.id/wp-content/uploads/2023/03/Logo-Universitas-Majalengka.png",
        sizes: "any",
      },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Survei Peminatan Melanjutkan Studi - Universitas Majalengka",
    description:
      "Sampaikan rencana studi dan kebutuhan informasi pendidikan tinggi Anda bersama Universitas Majalengka - Kampus Bernas Berkualitas.",
    url: "https://unma.ac.id",
    siteName: "Universitas Majalengka",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Survei Peminatan Studi Universitas Majalengka",
      },
      {
        url: "https://unma.ac.id/wp-content/uploads/2023/03/Logo-Universitas-Majalengka.png",
        width: 800,
        height: 800,
        alt: "Logo Universitas Majalengka",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Survei Peminatan Studi ke Perguruan Tinggi - Universitas Majalengka",
    description:
      "Sampaikan rencana studi dan kebutuhan informasi pendidikan tinggi Anda bersama Universitas Majalengka.",
    images: ["/images/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Mencegah unhandledRejection & error dari ekstensi browser (seperti Urban VPN Proxy / 200.js)
                  window.addEventListener('unhandledrejection', function(event) {
                    var r = event.reason;
                    var text = (r && (r.stack || r.message)) || String(r || '');
                    if (
                      text.indexOf('chrome-extension://') !== -1 ||
                      text.indexOf('moz-extension://') !== -1 ||
                      text.indexOf('eppiocemhmnlbhjplcgkofciiegomcon') !== -1 ||
                      text.indexOf('M_ID') !== -1
                    ) {
                      event.preventDefault();
                      event.stopImmediatePropagation();
                    }
                  }, true);

                  window.addEventListener('error', function(event) {
                    var text = (event.filename || '') + ' ' + (event.message || '') + ' ' + ((event.error && event.error.stack) || '');
                    if (
                      text.indexOf('chrome-extension://') !== -1 ||
                      text.indexOf('moz-extension://') !== -1 ||
                      text.indexOf('eppiocemhmnlbhjplcgkofciiegomcon') !== -1 ||
                      text.indexOf('M_ID') !== -1
                    ) {
                      event.preventDefault();
                      event.stopImmediatePropagation();
                    }
                  }, true);

                  var origSet = Element.prototype.setAttribute;
                  Element.prototype.setAttribute = function(name, val) {
                    if (name === 'bis_skin_checked' || name === 'bis_register' || (name && name.indexOf('__processed_') === 0)) return;
                    return origSet.apply(this, arguments);
                  };

                  var obs = new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      var m = mutations[i];
                      if (m.attributeName && (m.attributeName === 'bis_skin_checked' || m.attributeName === 'bis_register' || m.attributeName.indexOf('__processed_') === 0)) {
                        m.target.removeAttribute(m.attributeName);
                      }
                    }
                  });
                  if (document.documentElement) {
                    obs.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['bis_skin_checked', 'bis_register'] });
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
