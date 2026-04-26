import { Html, Head, Main, NextScript } from 'next/document'

const GTM_ID = 'GTM-W3H233L8'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Favicons */}
        <link rel="icon" type="image/png" sizes="192x192" href="/images/Houznext%20Logo.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/Houznext%20Logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/Houznext%20Logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/Houznext%20Logo.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0f2a44" />

        {/* Google AdSense */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_DATA_ADD_CLIENT}`}
          crossOrigin="anonymous"
        />

        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `,
          }}
        />
      </Head>
      <body>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
