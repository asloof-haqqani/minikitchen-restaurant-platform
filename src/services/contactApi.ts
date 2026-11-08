import { apiUrl } from './api';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  id?: string;
  error?: string;
}

export const submitContactForm = async (
  formData: ContactFormData
): Promise<ContactResponse> => {
  const response = await fetch(apiUrl('/api/contact'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to submit contact message. Please try again.');
  }

  return data;
};
