import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState, type CSSProperties } from "react";

import type {
  NovaesFlowConfig,
  NovaesFlowField,
  NovaesFlowFinishPayload,
  NovaesFlowPlan,
} from "./types";
import { useRollingNumber } from "./hooks/useRollingNumber";
import {
  buildNovaesFlowFinishPayload,
  buildNovaesFlowSelection,
  computeNovaesFlowTotals,
  formatNovaesFlowCurrency,
} from "./utils/finance";
import { sanitizeNovaesFlowFieldValue, sanitizeNovaesFlowFields } from "./utils/sanitize";

const DEFAULT_COLORS: [string, string, string] = ["#8A2BE2", "#FF0000", "#FF007F"];

const DEFAULT_FIELDS: NovaesFlowField[] = [
  { id: "name", label: "Seu nome", placeholder: "Quem está fechando esta proposta?", required: true },
  { id: "company", label: "Empresa", placeholder: "Nome da empresa ou projeto" },
  { id: "email", label: "E-mail", placeholder: "voce@empresa.com", type: "email", required: true },
  { id: "phone", label: "WhatsApp", placeholder: "(11) 99999-9999", type: "tel" },
  {
    id: "brief",
    label: "Contexto do projeto",
    placeholder: "Descreva o cenário, objetivo e urgência da proposta.",
    type: "textarea",
    maxLength: 900,
  },
];

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function buildInitialFieldValues(fields: NovaesFlowField[], initial?: Record<string, string>) {
  return fields.reduce<Record<string, string>>((accumulator, field) => {
    accumulator[field.id] = initial?.[field.id] ?? "";
    return accumulator;
  }, {});
}

function isExclusivePlan(plan: NovaesFlowPlan | null) {
  if (!plan) return false;
  if (plan.emphasis === "exclusive") return true;
  return ["custom", "sob-medida", "sob_medida", "exclusive"].some((token) =>
    plan.id.toLowerCase().includes(token),
  );
}

export function NovaesFlowBuilder({ config }: { config: NovaesFlowConfig }) {
  const prefersReducedMotion = useReducedMotion();
  const colors = config.colors ?? DEFAULT_COLORS;
  const fields = config.fields?.length ? config.fields : DEFAULT_FIELDS;
  const initialPlanId = config.initialSelection?.planId ?? config.plans[0]?.id ?? null;
  const initialExtraIds = config.initialSelection?.extraIds ?? [];

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(initialPlanId);
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>(initialExtraIds);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(
    buildInitialFieldValues(fields, config.initialSelection?.fields),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selection = useMemo(
    () =>
      buildNovaesFlowSelection(config.plans, config.extras ?? [], selectedPlanId, selectedExtraIds, fieldValues),
    [config.extras, config.plans, fieldValues, selectedExtraIds, selectedPlanId],
  );

  const computed = useMemo(
    () => computeNovaesFlowTotals(config.plans, config.extras ?? [], selectedPlanId, selectedExtraIds),
    [config.extras, config.plans, selectedExtraIds, selectedPlanId],
  );

  const animatedSetup = useRollingNumber(selection.totals.setup, prefersReducedMotion ? 0 : 450);
  const animatedRecurring = useRollingNumber(selection.totals.recurring, prefersReducedMotion ? 0 : 450);
  const exclusivePlan = isExclusivePlan(computed.selectedPlan);

  useEffect(() => {
    config.onChange?.(selection);
  }, [config, selection]);

  const themeStyle = useMemo(
    () =>
      ({
        "--nf-color-1": colors[0],
        "--nf-color-2": colors[1],
        "--nf-color-3": colors[2],
        "--nf-surface-glow": exclusivePlan
          ? "rgba(255, 0, 127, 0.34)"
          : "rgba(138, 43, 226, 0.28)",
      }) as CSSProperties,
    [colors, exclusivePlan],
  );

  const handleFieldChange = (field: NovaesFlowField, nextValue: string) => {
    setFieldValues((current) => ({
      ...current,
      [field.id]: sanitizeNovaesFlowFieldValue(field, nextValue),
    }));
  };

  const handleToggleExtra = (extraId: string) => {
    setSelectedExtraIds((current) =>
      current.includes(extraId)
        ? current.filter((item) => item !== extraId)
        : [...current, extraId],
    );
  };

  const handleSubmit = async () => {
    const cleanedFieldValues = sanitizeNovaesFlowFields(fields, fieldValues);
    const nextSelection = buildNovaesFlowSelection(
      config.plans,
      config.extras ?? [],
      selectedPlanId,
      selectedExtraIds,
      cleanedFieldValues,
    );
    const payload: NovaesFlowFinishPayload = buildNovaesFlowFinishPayload(
      nextSelection,
      selectedPlanId,
      selectedExtraIds,
      config.theme ?? "cyber-neon",
    );

    setIsSubmitting(true);

    try {
      await config.onFinish?.(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className={cx("nf-root", exclusivePlan && "nf-root--exclusive", config.className)}
      style={{ ...themeStyle, ...config.style }}
    >
      <div className="nf-shell">
        <header className="nf-hero">
          <div className="nf-hero__copy">
            <span className="nf-kicker">NovaesFlow UI</span>
            <h1>{config.title ?? "Monte sua proposta com um fluxo neon plug-and-play"}</h1>
            <p>
              {config.subtitle ??
                "Selecione o plano, ative extras, ajuste o contexto e entregue o payload final para o seu backend com um callback seguro."}
            </p>
          </div>

          <div className="nf-hero__meta">
            <div className="nf-chip">Core universal</div>
            <div className="nf-chip">Supabase opcional</div>
            <div className="nf-chip">Cyber-neon</div>
          </div>
        </header>

        <div className="nf-layout">
          <div className="nf-main">
            <section className="nf-panel">
              <div className="nf-section-heading">
                <div>
                  <span className="nf-eyebrow">Passo 1</span>
                  <h2>Escolha o plano base</h2>
                </div>
                <p>O componente nunca carrega preços hardcoded. Tudo vem da configuração que você fornece.</p>
              </div>

              <div className="nf-plan-grid">
                {config.plans.map((plan) => {
                  const selected = selectedPlanId === plan.id;
                  const formattedSetup = formatNovaesFlowCurrency(
                    plan.price,
                    config.locale,
                    config.currency,
                  );
                  const formattedRecurring = formatNovaesFlowCurrency(
                    plan.monthlyPrice ?? 0,
                    config.locale,
                    config.currency,
                  );

                  return (
                    <button
                      key={plan.id}
                      type="button"
                      className={cx("nf-plan-card", selected && "is-selected")}
                      onClick={() => setSelectedPlanId(plan.id)}
                    >
                      <div className="nf-plan-card__top">
                        <div>
                          <span className="nf-plan-badge">{plan.badge ?? "Plano"}</span>
                          <strong>{plan.name}</strong>
                        </div>
                        {plan.highlight ? <span className="nf-plan-highlight">{plan.highlight}</span> : null}
                      </div>
                      <p className="nf-plan-description">{plan.description}</p>
                      <div className="nf-price-stack">
                        <span className="nf-price">{formattedSetup}</span>
                        <span className="nf-price-caption">setup inicial</span>
                      </div>
                      {(plan.monthlyPrice ?? 0) > 0 ? (
                        <div className="nf-plan-recurring">+ {formattedRecurring} recorrente</div>
                      ) : (
                        <div className="nf-plan-recurring nf-plan-recurring--muted">Sem recorrência fixa</div>
                      )}
                      {plan.features?.length ? (
                        <ul className="nf-feature-list">
                          {plan.features.slice(0, 4).map((feature) => (
                            <li key={feature}>{feature}</li>
                          ))}
                        </ul>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="nf-panel">
              <div className="nf-section-heading">
                <div>
                  <span className="nf-eyebrow">Passo 2</span>
                  <h2>Ative módulos extras</h2>
                </div>
                <p>Os cards respondem com glow e pulso quando selecionados.</p>
              </div>

              <div className="nf-extra-grid">
                {(config.extras ?? []).map((extra) => {
                  const active = selectedExtraIds.includes(extra.id);
                  return (
                    <button
                      key={extra.id}
                      type="button"
                      className={cx("nf-extra-card", active && "is-active")}
                      onClick={() => handleToggleExtra(extra.id)}
                    >
                      <div className="nf-extra-card__header">
                        <span>{extra.name}</span>
                        <span className="nf-extra-check" aria-hidden="true">
                          {active ? "●" : "○"}
                        </span>
                      </div>
                      <p>{extra.description}</p>
                      <div className="nf-extra-prices">
                        <strong>{formatNovaesFlowCurrency(extra.price, config.locale, config.currency)}</strong>
                        {(extra.monthlyPrice ?? 0) > 0 ? (
                          <span>
                            + {formatNovaesFlowCurrency(extra.monthlyPrice ?? 0, config.locale, config.currency)}
                            /mês
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="nf-panel">
              <div className="nf-section-heading">
                <div>
                  <span className="nf-eyebrow">Passo 3</span>
                  <h2>Contexto do lead</h2>
                </div>
                <p>Os campos são saneados antes de sair do componente. Scripts e HTML não vão para o payload.</p>
              </div>

              <div className="nf-form-grid">
                {fields.map((field) => {
                  const value = fieldValues[field.id] ?? "";

                  if (field.type === "textarea") {
                    return (
                      <label key={field.id} className="nf-field nf-field--full">
                        <span>
                          {field.label}
                          {field.required ? " *" : ""}
                        </span>
                        <textarea
                          value={value}
                          placeholder={field.placeholder}
                          onChange={(event) => handleFieldChange(field, event.target.value)}
                          rows={5}
                        />
                      </label>
                    );
                  }

                  return (
                    <label key={field.id} className="nf-field">
                      <span>
                        {field.label}
                        {field.required ? " *" : ""}
                      </span>
                      <input
                        type={field.type ?? "text"}
                        value={value}
                        placeholder={field.placeholder}
                        onChange={(event) => handleFieldChange(field, event.target.value)}
                      />
                    </label>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="nf-summary">
            <div className="nf-summary__panel">
              <div className="nf-summary__header">
                <span className="nf-eyebrow">Resumo em tempo real</span>
                <h2>Proposta ativa</h2>
              </div>

              <div className="nf-summary__total">
                <span>Total inicial</span>
                <strong>{formatNovaesFlowCurrency(animatedSetup, config.locale, config.currency)}</strong>
                <small>
                  {selection.totals.recurring > 0
                    ? `${formatNovaesFlowCurrency(animatedRecurring, config.locale, config.currency)} recorrente`
                    : "Sem mensalidade fixa"}
                </small>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={computed.selectedPlan?.id ?? "none"}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.22 }}
                  className="nf-summary__selection"
                >
                  <div className="nf-summary-line">
                    <span>Plano</span>
                    <strong>{computed.selectedPlan?.name ?? "Nenhum selecionado"}</strong>
                  </div>
                  <div className="nf-summary-line">
                    <span>Extras ativos</span>
                    <strong>{selection.selectedExtras.length}</strong>
                  </div>
                  <div className="nf-summary-line">
                    <span>Módulos selecionados</span>
                    <strong>{selection.totals.selectedCount}</strong>
                  </div>
                </motion.div>
              </AnimatePresence>

              {selection.selectedExtras.length ? (
                <div className="nf-summary__stack">
                  {selection.selectedExtras.map((extra) => (
                    <div className="nf-summary-pill" key={extra.id}>
                      <span>{extra.name}</span>
                      <strong>{formatNovaesFlowCurrency(extra.price, config.locale, config.currency)}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="nf-summary__empty">Nenhum extra ativo.</div>
              )}

              <button type="button" className="nf-submit" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Processando..." : "Finalizar proposta"}
              </button>

              <p className="nf-summary__footer">
                O callback <code>onFinish</code> recebe apenas o payload sanitizado. Integrações sensíveis ficam no backend.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
