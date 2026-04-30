import demoAcaiImage from "@/assets/public-demos/demo-acai.jpg";
import demoAcaiPremiumImage from "@/assets/public-demos/demo-acai-premium.jpg";
import demoHamburgueriaImage from "@/assets/public-demos/demo-hamburgueria.jpg";
import demoLojaImage from "@/assets/public-demos/demo-loja-cama-mesa-banho.jpg";
import demoPetShopImage from "@/assets/public-demos/demo-pet-shop.jpg";
import demoPizzariaImage from "@/assets/public-demos/demo-pizzaria.jpg";
import demoSushiImage from "@/assets/public-demos/demo-sushi.jpg";

export interface PublicDemoSite {
  id: string;
  icon: string;
  title: string;
  segment: string;
  description: string;
  link: string;
  image: string;
}

export const PUBLIC_DEMO_SITES: PublicDemoSite[] = [
  {
    id: "loja-cama-mesa-banho",
    icon: "LOJA",
    title: "Loja - Cama, Mesa e Banho",
    segment: "Loja virtual",
    description:
      "Site moderno para loja virtual, com apresentacao de produtos e foco em vendas online.",
    link: "https://bem-me-quer-show.vercel.app/",
    image: demoLojaImage,
  },
  {
    id: "pizzaria",
    icon: "PIZZA",
    title: "Pizzaria",
    segment: "Cardapio para delivery",
    description:
      "Cardapio digital com pedidos rapidos direto pelo WhatsApp.",
    link: "https://pizzariafogo.vercel.app/",
    image: demoPizzariaImage,
  },
  {
    id: "acai",
    icon: "ACAI",
    title: "Acai",
    segment: "Delivery simples",
    description:
      "Sistema de pedidos simples e rapido, ideal para delivery.",
    link: "https://demoacai.vercel.app/",
    image: demoAcaiImage,
  },
  {
    id: "acai-premium",
    icon: "ACAI PRO",
    title: "Acai (Modelo Premium)",
    segment: "Cardapio premium",
    description:
      "Cardapio digital moderno, com layout otimizado para pedidos rapidos e experiencia simples para o cliente.",
    link: "https://acai-fast-revamp26.vercel.app/",
    image: demoAcaiPremiumImage,
  },
  {
    id: "hamburgueria",
    icon: "BURGER",
    title: "Hamburgueria",
    segment: "Cardapio interativo",
    description:
      "Cardapio interativo com layout moderno e foco em conversao de pedidos.",
    link: "https://olympus-burger-menu.vercel.app/",
    image: demoHamburgueriaImage,
  },
  {
    id: "pet-shop",
    icon: "PET",
    title: "Pet Shop",
    segment: "Site vitrine",
    description:
      "Site vitrine com foco em apresentacao de servicos e contato rapido pelo WhatsApp.",
    link: "https://canoas-pet-showcase.vercel.app/",
    image: demoPetShopImage,
  },
  {
    id: "sushi",
    icon: "SUSHI",
    title: "Sushi",
    segment: "Cardapio digital",
    description:
      "Cardapio digital moderno com visual profissional e foco em pedidos rapidos.",
    link: "https://sushi-lemon-xi.vercel.app/",
    image: demoSushiImage,
  },
];
