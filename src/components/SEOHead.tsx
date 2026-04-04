import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { APP_CONFIG, ROUTES } from '@/lib/constants';
import { PUBLIC_SUPABASE_CONFIG } from '@/integrations/supabase/public-config';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  keywords?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
}

const ABSOLUTE_SITE_URL = APP_CONFIG.siteUrl.replace(/\/+$/, '');

const defaultSEO = {
  title: 'NovaesWeb — Criamos Sites para Negócios Alavancar no Digital',
  description: APP_CONFIG.description,
  image: '/novaesweb-google-image.png',
  type: 'website' as const,
  keywords: 'criamos sites para negocios, alavancar no digital, sites profissionais, desenvolvimento web, sistemas premium, automação digital, novaesweb, sites que vendem',
  author: APP_CONFIG.author,
};

const toAbsoluteUrl = (value: string) => {
  if (/^https?:\/\//i.test(value)) return value;
  const normalizedPath = value.startsWith('/') ? value : `/${value}`;
  return `${ABSOLUTE_SITE_URL}${normalizedPath}`;
};

const getPageSEO = (pathname: string) => {
  const pageSEO: Record<string, Partial<SEOHeadProps>> = {
    [ROUTES.public.home]: {
      title: 'NovaesWeb — Criamos Sites para Negócios Alavancar no Digital',
      description: 'Criamos sites profissionais que alavancam negócios no digital. Transforme sua presença online em uma máquina de vendas com sistemas premium e automação inteligente.',
      keywords: 'criamos sites para negocios, alavancar no digital, sites profissionais, desenvolvimento web, sistemas premium, automação digital, novaesweb, sites que vendem',
    },
    [ROUTES.public.cadastro]: {
      title: 'Solicite seu Diagnóstico - NovaesWeb',
      description: 'Solicite seu diagnóstico com a NovaesWeb e receba uma estrutura recomendada para vender mais no digital com site, gestão e automação.',
      keywords: 'diagnostico digital, cadastro novaesweb, solicitar proposta, site profissional, automacao whatsapp',
    },
    [ROUTES.public.funcionalidades]: {
      title: 'Funcionalidades - NovaesWeb',
      description: 'Conheça as funcionalidades da NovaesWeb para sites profissionais, gestão de clientes, automação no WhatsApp e operação digital.',
      keywords: 'funcionalidades novaesweb, automacao whatsapp, painel administrativo, gestao digital',
    },
    '/landing': {
      title: 'Landing Page para Conversão - NovaesWeb',
      description: 'Landing pages com estrutura profissional para captar leads, acelerar o atendimento e converter mais pelo WhatsApp.',
      keywords: 'landing page, captacao de leads, conversao whatsapp, novaesweb',
      noIndex: true,
    },
  };

  return pageSEO[pathname] || {};
};

export default function SEOHead({
  title,
  description,
  image,
  type = 'website',
  keywords,
  author,
  publishedTime,
  modifiedTime,
  noIndex = false,
  canonicalUrl,
}: SEOHeadProps) {
  const location = useLocation();
  const pageSEO = getPageSEO(location.pathname);

  const finalTitle = title || pageSEO.title || defaultSEO.title;
  const finalDescription = description || pageSEO.description || defaultSEO.description;
  const finalImage = image || pageSEO.image || defaultSEO.image;
  const finalKeywords = keywords || pageSEO.keywords || defaultSEO.keywords;
  const finalAuthor = author || pageSEO.author || defaultSEO.author;
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isClientRoute = location.pathname.startsWith('/cliente');
  const isResellerRoute = location.pathname.startsWith('/revenda');
  const derivedNoIndex = noIndex || pageSEO.noIndex || isAdminRoute || isClientRoute || isResellerRoute;
  const finalCanonicalUrl = canonicalUrl || `${ABSOLUTE_SITE_URL}${location.pathname}`;
  const finalImageUrl = toAbsoluteUrl(finalImage);
  const finalLogoUrl = toAbsoluteUrl('/novaesweb-google-image.png');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': location.pathname === '/' ? 'WebSite' : type === 'article' ? 'Article' : 'WebPage',
    name: finalTitle,
    description: finalDescription,
    image: finalImageUrl,
    url: finalCanonicalUrl,
    author: {
      '@type': 'Organization',
      name: finalAuthor,
    },
    publisher: {
      '@type': 'Organization',
      name: APP_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: finalLogoUrl,
      },
    },
    ...(location.pathname === '/' && {
      potentialAction: {
        '@type': 'SearchAction',
        target: `${ABSOLUTE_SITE_URL}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    }),
    ...(publishedTime && { datePublished: publishedTime }),
    ...(modifiedTime && { dateModified: modifiedTime }),
  };

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content={finalAuthor} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content={derivedNoIndex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large'} />

      <link rel="canonical" href={finalCanonicalUrl} />

      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImageUrl} />
      <meta property="og:url" content={finalCanonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={APP_CONFIG.name} />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:image:alt" content={finalTitle} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImageUrl} />
      <meta name="twitter:creator" content="@novaesweb" />

      <meta name="theme-color" content="#7b1fa2" />
      <meta name="msapplication-TileColor" content="#7b1fa2" />
      <meta name="application-name" content={APP_CONFIG.name} />
      <meta name="apple-mobile-web-app-title" content={APP_CONFIG.name} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      <link rel="icon" type="image/png" href="/novaesweb-google-image.png" />
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/novaesweb-google-image.png" />

      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href={import.meta.env.VITE_SUPABASE_URL || PUBLIC_SUPABASE_CONFIG.url} />

      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />
    </Helmet>
  );
}
