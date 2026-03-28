import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { APP_CONFIG, ROUTES } from '@/lib/constants';

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

const defaultSEO = {
  title: APP_CONFIG.name,
  description: APP_CONFIG.description,
  image: '/og-image.jpg',
  type: 'website' as const,
  keywords: 'painel administrativo, gestão empresarial, novaesweb, lucas alencar',
  author: APP_CONFIG.author,
};

const getPageSEO = (pathname: string) => {
  const pageSEO: Record<string, Partial<SEOHeadProps>> = {
    [ROUTES.public.home]: {
      title: 'NovaesWeb - Painel Administrativo Premium',
      description: 'Sistema completo de gestão empresarial com arquitetura digital avançada. Desenvolvido por Architect CEO Lucas Alencar.',
      keywords: 'painel administrativo, gestão empresarial, arquitetura digital, novaesweb',
    },
    [ROUTES.public.cadastro]: {
      title: 'Cadastro - NovaesWeb',
      description: 'Cadastre-se e transforme sua gestão com o painel administrativo mais completo do mercado.',
      keywords: 'cadastro, registro, novaesweb, painel administrativo',
    },
    [ROUTES.public.agendar]: {
      title: 'Agendar Demonstração - NovaesWeb',
      description: 'Agende uma demonstração do nosso painel administrativo e veja como podemos transformar seu negócio.',
      keywords: 'demonstração, agendar, apresentação, novaesweb',
    },
    [ROUTES.public.funcionalidades]: {
      title: 'Funcionalidades - NovaesWeb',
      description: 'Conheça todas as funcionalidades do nosso painel administrativo premium.',
      keywords: 'funcionalidades, recursos, features, novaesweb',
    },
    [ROUTES.admin.dashboard]: {
      title: 'Painel Administrativo - NovaesWeb',
      description: 'Cabine de comando para gestão inteligente de seus ativos digitais.',
      keywords: 'admin, painel, dashboard, gestão',
      noIndex: true,
    },
    [ROUTES.client.dashboard]: {
      title: 'Portal Cliente - NovaesWeb',
      description: 'Acesse seus projetos, contratos e faturas em nosso portal exclusivo.',
      keywords: 'cliente, portal, projetos, contratos',
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
  const finalImage = image || defaultSEO.image;
  const finalKeywords = keywords || pageSEO.keywords || defaultSEO.keywords;
  const finalAuthor = author || pageSEO.author || defaultSEO.author;
  const finalCanonicalUrl = canonicalUrl || `${window.location.origin}${location.pathname}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : 'WebPage',
    name: finalTitle,
    description: finalDescription,
    image: finalImage,
    url: finalCanonicalUrl,
    author: {
      '@type': 'Person',
      name: finalAuthor,
    },
    publisher: {
      '@type': 'Organization',
      name: APP_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: '/logo.png',
      },
    },
    ...(publishedTime && { datePublished: publishedTime }),
    ...(modifiedTime && { dateModified: modifiedTime }),
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content={finalAuthor} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={finalCanonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={finalCanonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={APP_CONFIG.name} />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:creator" content="@novaesweb" />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#7b1fa2" />
      <meta name="msapplication-TileColor" content="#7b1fa2" />
      <meta name="application-name" content={APP_CONFIG.name} />
      <meta name="apple-mobile-web-app-title" content={APP_CONFIG.name} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href={import.meta.env.VITE_SUPABASE_URL} />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />
    </Helmet>
  );
}
