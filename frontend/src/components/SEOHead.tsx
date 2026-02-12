import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: string;
}

const SITE_NAME = 'Darcy Aviation';
const BASE_URL = 'https://darcy-aviation-production.up.railway.app';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

export default function SEOHead({
  title,
  description = 'Premier flight training and aircraft maintenance at Danbury Municipal Airport (KDXR), Connecticut. Discovery flights, Private Pilot through Commercial licenses, and FAA-certified maintenance.',
  path = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Flight Training & Maintenance | Danbury, CT`;
  const url = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="geo.region" content="US-CT" />
      <meta name="geo.placename" content="Danbury" />
    </Helmet>
  );
}
