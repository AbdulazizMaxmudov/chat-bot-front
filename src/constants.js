import { Leaf, Scale, FileText, HelpCircle } from 'lucide-react';

export const API_URL = import.meta.env.VITE_API_URL || '/api';

export function getWsUrl(wsPath) {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    const wsBase = apiUrl.replace(/^https/, 'wss').replace(/^http/, 'ws');
    return `${wsBase}${wsPath}`;
  }
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}/api${wsPath}`;
}

export const SOCIAL_LINKS = {
  phone: 'tel:+998712030022',
  email: 'mailto:info@ecoekspertiza.uz',
  telegram: 'https://t.me/ecoekspertiza',
  youtube: 'https://www.youtube.com/channel/UCk1-8z1uI0fWDQRniifg6xw',
  instagram: 'https://www.instagram.com/ecoekspertiza_uz/',
  location: "https://www.google.com/maps/search/Toshkent+sh.,+Mirzo+Ulug'bek+t.,+Sayram+5-tor+k.,+15-uy",
};

export const QUICK_ACTION_ICONS = [Leaf, Scale, FileText, HelpCircle];

export const LOTTIE_URLS = {
  style1: 'https://lottie.host/0641a64a-425c-406a-9e27-acb7871aad4f/LCAyTKu7tB.lottie',
  style2: 'https://lottie.host/28305e56-1b8c-41d7-91af-e6115f082a1a/k3QS5HSdgv.lottie',
  style3: 'https://lottie.host/0641a64a-425c-406a-9e27-acb7871aad4f/LCAyTKu7tB.lottie',
};
