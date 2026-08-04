import type { IconType } from "react-icons";
import {
  FaFacebook,
  FaInstagram,
  FaGoogle,
  FaGlobe,
  FaPhone,
  FaTriangleExclamation,
  FaLink,
} from "react-icons/fa6";
import { FaTripadvisor } from "react-icons/fa";

export type PredefinedButtonType =
  | "facebook"
  | "instagram"
  | "google_reviews"
  | "tripadvisor"
  | "report_issue"
  | "website"
  | "phone";

export type ButtonType = PredefinedButtonType | "custom";

export const PREDEFINED_BUTTON_TYPES: Record<
  PredefinedButtonType,
  {
    label: string;
    icon: IconType;
    urlPlaceholder: string;
    isPhone?: boolean;
    /** Mène vers une page interne (ex: formulaire de signalement) plutôt que vers un lien fourni par le commerçant. */
    isInternal?: boolean;
  }
> = {
  facebook: {
    label: "Facebook",
    icon: FaFacebook,
    urlPlaceholder: "https://facebook.com/votre-page",
  },
  instagram: {
    label: "Instagram",
    icon: FaInstagram,
    urlPlaceholder: "https://instagram.com/votre-compte",
  },
  google_reviews: {
    label: "Avis Google",
    icon: FaGoogle,
    urlPlaceholder: "https://g.page/r/votre-lien-avis",
  },
  tripadvisor: {
    label: "TripAdvisor",
    icon: FaTripadvisor,
    urlPlaceholder: "https://tripadvisor.fr/votre-fiche",
  },
  report_issue: {
    label: "Signaler un problème",
    icon: FaTriangleExclamation,
    urlPlaceholder: "(non utilisé — mène vers un formulaire automatique)",
    isInternal: true,
  },
  website: {
    label: "Site web",
    icon: FaGlobe,
    urlPlaceholder: "https://votre-site.fr",
  },
  phone: {
    label: "Téléphone",
    icon: FaPhone,
    urlPlaceholder: "0102030405",
    isPhone: true,
  },
};

export const CUSTOM_BUTTON_ICON: IconType = FaLink;

export function isPredefinedButtonType(
  type: string
): type is PredefinedButtonType {
  return Object.prototype.hasOwnProperty.call(PREDEFINED_BUTTON_TYPES, type);
}

export function isInternalButtonType(type: string): boolean {
  return isPredefinedButtonType(type) && !!PREDEFINED_BUTTON_TYPES[type].isInternal;
}

export function getButtonIcon(type: string): IconType {
  if (isPredefinedButtonType(type)) {
    return PREDEFINED_BUTTON_TYPES[type].icon;
  }
  return CUSTOM_BUTTON_ICON;
}

export function getButtonDefaultLabel(type: ButtonType): string {
  if (isPredefinedButtonType(type)) {
    return PREDEFINED_BUTTON_TYPES[type].label;
  }
  return "";
}

/** Builds the href to use for a button, formatting phone numbers as tel: links. */
export function getButtonHref(type: string, url: string): string {
  if (isPredefinedButtonType(type) && PREDEFINED_BUTTON_TYPES[type].isPhone) {
    const digits = url.replace(/[^\d+]/g, "");
    return `tel:${digits}`;
  }
  return url;
}

const ALLOWED_URL_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

/**
 * Rejects unsafe schemes (javascript:, data:, vbscript:, ...) in
 * merchant-supplied links, since these are rendered as raw <a href> on the
 * public page and would otherwise run in every visitor's browser.
 */
export function isSafeButtonUrl(type: string, url: string): boolean {
  if (isPredefinedButtonType(type) && PREDEFINED_BUTTON_TYPES[type].isPhone) {
    return /^[\d\s()+.-]+$/.test(url);
  }
  try {
    return ALLOWED_URL_PROTOCOLS.has(new URL(url).protocol);
  } catch {
    return false;
  }
}
