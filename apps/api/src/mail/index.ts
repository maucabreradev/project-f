export const mail = {
  sendConfirmation: async (email: string, token: string) => {
    // TODO: implement with Resend
    console.log(`[MAIL] Confirmation to ${email}: ${token}`);
  },
  sendPasswordReset: async (email: string, token: string) => {
    // TODO: implement with Resend
    console.log(`[MAIL] Password reset to ${email}: ${token}`);
  },
  sendEmailChange: async (email: string, token: string) => {
    // TODO: implement with Resend
    console.log(`[MAIL] Email change to ${email}: ${token}`);
  },
};