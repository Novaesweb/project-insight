import type { NavigateFunction } from "react-router-dom";

import { scrollTo } from "@/lib/utils";

export interface SiteNavLink {
  href: string;
  label: string;
}

export interface SiteCompanyLink {
  href?: string;
  id?: string;
  label: string;
}

export const siteNavLinks: SiteNavLink[] = [
  { href: "#o-que-fazemos", label: "O Que Fazemos" },
  { href: "#como-funciona", label: "Como Funciona" },
  { href: "#automacao", label: "Automação" },
  { href: "#planos", label: "Planos" },
  { href: "/nichos", label: "Nichos" },
  { href: "/sobre", label: "Sobre" },
  { href: "#contato", label: "Contato" },
];

export const siteCompanyLinks: SiteCompanyLink[] = [
  { href: "/sobre", label: "Sobre a NovaesWeb" },
  { id: "quem-somos", label: "Quem Somos" },
  { id: "diferenciais", label: "Diferenciais" },
];

interface HandleSiteNavigationOptions {
  href?: string;
  id?: string;
  locationPathname: string;
  navigate: NavigateFunction;
  onOpenModal: (id: string) => void;
  closeMenu?: (value: boolean) => void;
  setActiveSection?: (value: string) => void;
}

export function handleSiteNavigation({
  href,
  id,
  locationPathname,
  navigate,
  onOpenModal,
  closeMenu,
  setActiveSection,
}: HandleSiteNavigationOptions) {
  if (href?.startsWith("/")) {
    closeMenu?.(false);
    setActiveSection?.(href);
    navigate(href);
    return;
  }

  if (id) {
    closeMenu?.(false);
    onOpenModal(id);
    return;
  }

  if (!href) return;

  if (locationPathname !== "/") {
    closeMenu?.(false);
    setActiveSection?.(href);
    navigate(`/${href}`);
    return;
  }

  setActiveSection?.(href);
  scrollTo(href, closeMenu);
}
