/** Fill these through environment variables (see .env.example). They appear in the legal pages and footer. */
export const COMPANY = import.meta.env.VITE_COMPANY_NAME || 'ShopEase';
export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || 'support@your-domain.com';
export const COMPANY_ADDRESS = import.meta.env.VITE_COMPANY_ADDRESS || '';
/** Set VITE_LEGAL_REVIEWED=true once a lawyer has checked the text; it hides the "template" warning. */
export const LEGAL_REVIEWED = import.meta.env.VITE_LEGAL_REVIEWED === 'true';
export const LEGAL_UPDATED = '6 October 2026';
