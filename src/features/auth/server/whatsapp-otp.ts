import { Textbee, TextbeeError } from "@textbee/sdk";

type SendOtpInput = {
  phoneNumber: string;
  code: string;
};

function maskPhoneNumber(phoneNumber: string) {
  const visible = phoneNumber.slice(-4);
  return `${"*".repeat(Math.max(0, phoneNumber.length - 4))}${visible}`;
}

async function sendViaMetaWhatsApp({ phoneNumber, code }: SendOtpInput) {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_OTP_TEMPLATE_NAME;

  if (!token || !phoneNumberId) {
    throw new Error(
      "WhatsApp provider 'meta' requires WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID",
    );
  }

  // Template is recommended for production WhatsApp Business API.
  const to = phoneNumber.replace(/^\+/, "");
  const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;
  const body = templateName
    ? {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: process.env.WHATSAPP_OTP_TEMPLATE_LANG ?? "en" },
          components: [
            {
              type: "body",
              parameters: [{ type: "text", text: code }],
            },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [{ type: "text", text: code }],
            },
          ],
        },
      }
    : {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: `Your Mandaozi verification code is: ${code}` },
      };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `WhatsApp send failed (${res.status}): ${detail.slice(0, 300)}`,
    );
  }
}

async function sendViaTextbeeSms({ phoneNumber, code }: SendOtpInput) {
  const apiKey = process.env.TEXTBEE_API_KEY;
  const deviceId = process.env.TEXTBEE_DEVICE_ID;
  const baseUrl = process.env.TEXTBEE_BASE_URL;

  if (!apiKey) {
    throw new Error("SMS provider 'textbee' requires TEXTBEE_API_KEY");
  }

  const textbee = new Textbee({
    apiKey,
    ...(baseUrl ? { baseUrl } : {}),
  });

  try {
    await textbee.sendSms({
      recipients: [phoneNumber],
      message: `Kode verifikasi Mandaozi Anda: ${code}`,
      ...(deviceId ? { deviceId } : {}),
    });
  } catch (error) {
    if (error instanceof TextbeeError) {
      const detail =
        typeof error.body === "string"
          ? error.body
          : JSON.stringify(error.body ?? "");
      throw new Error(
        `SMS send failed (${error.status}): ${detail.slice(0, 300)}`,
      );
    }
    throw error;
  }
}

function resolveOtpProvider() {
  const explicit = process.env.OTP_PROVIDER?.toLowerCase().trim();
  if (explicit) return explicit;

  // Backward-compatible fallback
  const wa = process.env.WHATSAPP_PROVIDER?.toLowerCase().trim();
  if (wa) return wa === "meta" ? "whatsapp-meta" : wa;

  return "console";
}

export async function sendAuthOtp(input: SendOtpInput) {
  const provider = resolveOtpProvider();

  if (
    provider === "textbee-sms" ||
    provider === "textbee" ||
    provider === "sms" ||
    provider === "twilio-sms" // backward-compatible alias
  ) {
    await sendViaTextbeeSms(input);
    return;
  }

  if (
    provider === "whatsapp-meta" ||
    provider === "meta" ||
    provider === "whatsapp"
  ) {
    await sendViaMetaWhatsApp(input);
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "OTP_PROVIDER is not configured for production. Set OTP_PROVIDER=textbee-sms or whatsapp-meta and provider credentials.",
    );
  }

  console.info(
    `[auth][dev-otp] OTP for ${maskPhoneNumber(input.phoneNumber)}: ${input.code}`,
  );
}

// Backward-compatible export (WhatsApp implementation remains available).
export async function sendWhatsAppOtp(input: SendOtpInput) {
  await sendViaMetaWhatsApp(input);
}
