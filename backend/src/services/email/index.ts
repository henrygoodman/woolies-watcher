import { MailcoachService } from './MailcoachService';
import { EmailService } from './EmailService';

let emailService: EmailService;

/**
 * Initialize the email service based on environment variables or configuration.
 */
export const initMailer = () => {
  const selectedService = process.env.EMAIL_SERVICE || 'mailcoach';

  switch (selectedService.toLowerCase()) {
    case 'mailcoach':
      emailService = new MailcoachService();
      console.log('Mailer initialized with Mailcoach.');
      break;
    default:
      throw new Error(`Unsupported email service: ${selectedService}`);
  }
};

export const getEmailService = (): EmailService => {
  if (!emailService) {
    throw new Error(
      'Mailer has not been initialized. Call initMailer() first.'
    );
  }
  return emailService;
};
