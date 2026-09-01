export const META_API = "https://graph.facebook.com/v20.0";
export const META_TIMEOUT_MS = 15_000;
export const EMPTY_FALLBACK = "-";

export type TemplateSnapshot = {
  template_name: string;
  language: string;
  body: string;
  variables: string[] | null;
  header_type?: string | null;
  header_format?: string | null;
};

export type SendResult =
  | { ok: true; id: string; requestPayload: any; responsePayload: any }
  | {
      ok: false;
      error: string;
      code?: number;
      status?: number;
      requestPayload: any;
      responsePayload: any;
    };

export function metaAuthHeader(accessToken: string) {
  const token = accessToken.trim();
  return token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}`;
}

export async function sendMetaTemplate(opts: {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  template: TemplateSnapshot;
  variables: Record<string, string>;
  mediaUrl?: string | null;
}): Promise<SendResult & { emptyVarIndices?: string[] }> {
  const vars = opts.template.variables ?? [];
  const emptyVarIndices: string[] = [];
  const parameters = vars.map((idx) => {
    const raw = (opts.variables[idx] ?? "").toString();
    if (raw.trim() === "") {
      emptyVarIndices.push(idx);
      return { type: "text", text: EMPTY_FALLBACK };
    }
    return { type: "text", text: raw };
  });

  const components: any[] = [];
  if (parameters.length) {
    components.push({ type: "body", parameters });
  }
  if (opts.template.header_type === "IMAGE" && opts.mediaUrl) {
    components.push({
      type: "header",
      parameters: [
        {
          type: "image",
          image: { link: opts.mediaUrl },
        },
      ],
    });
  }

  const resolvedLanguage = (opts.template.language ?? "").trim();
  if (!resolvedLanguage) {
    return {
      ok: false,
      error: `Template language is empty for "${opts.template.template_name}". Cannot build a valid Meta payload — re-sync your templates.`,
      requestPayload: { template_name: opts.template.template_name, to: opts.to },
      responsePayload: { error: "missing_language" },
      emptyVarIndices,
    };
  }

  const body = {
    messaging_product: "whatsapp",
    to: opts.to,
    type: "template",
    template: {
      name: opts.template.template_name,
      language: { code: resolvedLanguage },
      components,
    },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), META_TIMEOUT_MS);
  try {
    const res = await fetch(`${META_API}/${opts.phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: metaAuthHeader(opts.accessToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const text = await res.text();
    let json: any = {};
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }

    if (!res.ok) {
      const errMsg = json?.error?.message ?? `Meta API returned HTTP ${res.status}`;
      return {
        ok: false,
        error: errMsg,
        code: json?.error?.code,
        status: res.status,
        requestPayload: body,
        responsePayload: json,
        emptyVarIndices,
      };
    }

    const messageId = json?.messages?.[0]?.id;
    if (!messageId) {
      return {
        ok: false,
        error: "Meta API response did not contain a message ID",
        status: res.status,
        requestPayload: body,
        responsePayload: json,
        emptyVarIndices,
      };
    }

    return {
      ok: true,
      id: messageId,
      requestPayload: body,
      responsePayload: json,
      emptyVarIndices,
    };
  } catch (e: any) {
    clearTimeout(timer);
    return {
      ok: false,
      error: e.message || "Request timed out",
      requestPayload: body,
      responsePayload: { error: e.message },
      emptyVarIndices,
    };
  }
}

export async function sendMetaFreeform(opts: {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  type: "text" | "image" | "document" | "audio" | "video";
  body?: string | null;
  mediaUrl?: string | null;
}): Promise<SendResult> {
  let messagePayload: any = {};
  if (opts.type === "text") {
    messagePayload = {
      type: "text",
      text: {
        preview_url: false,
        body: opts.body || "",
      },
    };
  } else {
    // image, document, audio, video
    const mediaObj: any = { link: opts.mediaUrl || "" };
    if (opts.type === "document" && opts.body) {
      mediaObj.filename = opts.body; // use text as filename
    }
    messagePayload = {
      type: opts.type,
      [opts.type]: mediaObj,
    };
  }

  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: opts.to,
    ...messagePayload,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), META_TIMEOUT_MS);
  try {
    const res = await fetch(`${META_API}/${opts.phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: metaAuthHeader(opts.accessToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const text = await res.text();
    let json: any = {};
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }

    if (!res.ok) {
      const errMsg = json?.error?.message ?? `Meta API returned HTTP ${res.status}`;
      return {
        ok: false,
        error: errMsg,
        code: json?.error?.code,
        status: res.status,
        requestPayload: body,
        responsePayload: json,
      };
    }

    const messageId = json?.messages?.[0]?.id;
    if (!messageId) {
      return {
        ok: false,
        error: "Meta API response did not contain a message ID",
        status: res.status,
        requestPayload: body,
        responsePayload: json,
      };
    }

    return {
      ok: true,
      id: messageId,
      requestPayload: body,
      responsePayload: json,
    };
  } catch (e: any) {
    clearTimeout(timer);
    return {
      ok: false,
      error: e.message || "Request timed out",
      requestPayload: body,
      responsePayload: { error: e.message },
    };
  }
}
