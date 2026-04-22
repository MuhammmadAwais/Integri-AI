import axios from 'axios';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const API_KEY = import.meta.env.VITE_BREVO_API_KEY;

interface MailParams {
  replyToEmail: string;
  replyToName?: string;
  templateId: number;
  params: {
    FNAME: string;
    EMAIL: string;
    SUBJECT: string;
    MESSAGE: string;
  };
}

export const sendEmail = async ({ replyToEmail, replyToName, templateId, params }: MailParams) => {
  if (!API_KEY) {
    console.error("Brevo API key is not defined in environment variables.");
    throw new Error("Brevo API key is not defined.");
  }

  const data = {
    sender: {
      name: "Integri Ltd",
      email: "info@integri.app"
    },
    to: [
      {
        email: "info@integri.app"
      }
    ],
    replyTo: {
      email: replyToEmail,
      name: replyToName || replyToEmail 
    },
    templateId: templateId,
    params: params
  };

  try {
    const response = await axios.post(BREVO_API_URL, data, {
      headers: {
        'Accept': 'application/json',
        'api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error: any) {
    console.error("Brevo email API error:", error?.response?.data || error);
    throw error;
  }
};
