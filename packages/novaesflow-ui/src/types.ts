import type { CSSProperties } from "react";

export interface NovaesFlowPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  monthlyPrice?: number;
  badge?: string;
  features?: string[];
  highlight?: string;
  ctaLabel?: string;
  emphasis?: "default" | "exclusive";
}

export interface NovaesFlowExtra {
  id: string;
  name: string;
  price: number;
  description: string;
  monthlyPrice?: number;
  category?: string;
  highlight?: string;
}

export interface NovaesFlowField {
  id: string;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "textarea";
  required?: boolean;
  maxLength?: number;
}

export interface NovaesFlowInitialSelection {
  planId?: string | null;
  extraIds?: string[];
  fields?: Record<string, string>;
}

export interface NovaesFlowSelection {
  selectedPlan: NovaesFlowPlan | null;
  selectedExtras: NovaesFlowExtra[];
  fieldValues: Record<string, string>;
  totals: {
    setup: number;
    recurring: number;
    selectedCount: number;
  };
}

export interface NovaesFlowFinishPayload extends NovaesFlowSelection {
  planId: string | null;
  extraIds: string[];
  submittedAt: string;
  theme: string;
  version: string;
}

export interface NovaesFlowConfig {
  theme?: "cyber-neon" | string;
  colors?: [string, string, string];
  locale?: string;
  currency?: string;
  title?: string;
  subtitle?: string;
  plans: NovaesFlowPlan[];
  extras?: NovaesFlowExtra[];
  fields?: NovaesFlowField[];
  initialSelection?: NovaesFlowInitialSelection;
  className?: string;
  style?: CSSProperties;
  onChange?: (selection: NovaesFlowSelection) => void;
  onFinish?: (payload: NovaesFlowFinishPayload) => void | Promise<void>;
}
