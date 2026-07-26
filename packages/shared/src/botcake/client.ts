/**
 * Cliente del API publico de Botcake (WABA Milito Life).
 *
 * El psid de un cliente de WhatsApp es deterministico: "wa_" + numero sin
 * "+" (ej. +573132947776 → wa_573132947776), asi que se puede iniciar
 * conversacion con cualquier telefono usando una plantilla aprobada —
 * validado con el spike del 2026-07-25.
 */

const BOTCAKE_BASE = "https://botcake.io/api/public_api/v1";

type BotcakeConfig = {
  pageId: string;
  accessToken: string;
};

function getConfig(): BotcakeConfig | null {
  const pageId = process.env.BOTCAKE_WABA_PAGE_ID;
  const accessToken = process.env.BOTCAKE_ACCESS_TOKEN;
  if (!pageId || !accessToken) return null;
  return { pageId, accessToken };
}

/** +573132947776 → wa_573132947776 */
export function telefonoAPsid(telefonoE164: string): string {
  return `wa_${telefonoE164.replace(/\D/g, "")}`;
}

export type PlantillaCategoria = "UTILITY" | "MARKETING" | "AUTHENTICATION";

export type EnviarPlantillaParams = {
  telefonoE164: string;
  templateId: string;
  categoria: PlantillaCategoria;
  idioma?: string;
  /** Params posicionales del BODY: {"1": "Johan", "2": "Milito Life", ...} */
  variables: Record<string, string>;
};

export type BotcakeResultado = { success: boolean; error?: string };

/**
 * Envia una plantilla de WhatsApp aprobada via
 * POST /pages/{page_id}/flows/send_content.
 */
export async function enviarPlantilla({
  telefonoE164,
  templateId,
  categoria,
  idioma = "es",
  variables,
}: EnviarPlantillaParams): Promise<BotcakeResultado> {
  const config = getConfig();
  if (!config) {
    return { success: false, error: "Faltan BOTCAKE_WABA_PAGE_ID / BOTCAKE_ACCESS_TOKEN" };
  }

  const params = Object.entries(variables).map(([indice, value]) => ({
    key: `{{${indice}}}`,
    value,
  }));

  const body = {
    psid: telefonoAPsid(telefonoE164),
    data: {
      version: "v2",
      content: {
        messages: [
          {
            type: "whatsapp_message_template",
            template_id: templateId,
            category: categoria,
            language: idioma,
            components: [{ type: "BODY", params }],
          },
        ],
      },
    },
  };

  try {
    const res = await fetch(
      `${BOTCAKE_BASE}/pages/${config.pageId}/flows/send_content`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "access-token": config.accessToken,
        },
        body: JSON.stringify(body),
      },
    );

    const json = (await res.json().catch(() => null)) as
      | { success?: boolean; message?: string }
      | null;

    if (!res.ok || !json?.success) {
      return {
        success: false,
        error: json?.message ?? `HTTP ${res.status}`,
      };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Ejecuta un flow existente de Botcake sobre un cliente.
 *
 * Se usa para acciones que el API publico no expone directamente: por
 * ejemplo aplicar una etiqueta, que solo se puede hacer desde dentro de un
 * flow. El flow se arma una vez en la UI de Botcake y aqui solo se dispara.
 */
export async function enviarFlow(
  telefonoE164: string,
  flowId: number,
): Promise<BotcakeResultado> {
  const config = getConfig();
  if (!config) {
    return { success: false, error: "Faltan BOTCAKE_WABA_PAGE_ID / BOTCAKE_ACCESS_TOKEN" };
  }

  try {
    const res = await fetch(
      `${BOTCAKE_BASE}/pages/${config.pageId}/flows/send_flow`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "access-token": config.accessToken,
        },
        body: JSON.stringify({
          psid: telefonoAPsid(telefonoE164),
          flow_id: flowId,
        }),
      },
    );
    const json = (await res.json().catch(() => null)) as
      | { success?: boolean; message?: string }
      | null;
    if (!res.ok || !json?.success) {
      return { success: false, error: json?.message ?? `HTTP ${res.status}` };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Envia un mensaje de texto libre (solo valido dentro de la ventana de 24h
 * desde el ultimo mensaje del cliente). Base para el agente de IA
 * conversacional.
 */
export async function enviarTexto(
  telefonoE164: string,
  texto: string,
): Promise<BotcakeResultado> {
  const config = getConfig();
  if (!config) {
    return { success: false, error: "Faltan BOTCAKE_WABA_PAGE_ID / BOTCAKE_ACCESS_TOKEN" };
  }

  const body = {
    psid: telefonoAPsid(telefonoE164),
    data: {
      version: "v2",
      content: {
        messages: [{ type: "text", text: texto }],
      },
    },
  };

  try {
    const res = await fetch(
      `${BOTCAKE_BASE}/pages/${config.pageId}/flows/send_content`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "access-token": config.accessToken,
        },
        body: JSON.stringify(body),
      },
    );
    const json = (await res.json().catch(() => null)) as
      | { success?: boolean; message?: string }
      | null;
    if (!res.ok || !json?.success) {
      return { success: false, error: json?.message ?? `HTTP ${res.status}` };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
