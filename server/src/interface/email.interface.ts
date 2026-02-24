export interface otpEmailTemplateArgs {
  otp: string;
  userName?: string;
}

export interface welcomeEmailTemplateArgs {
  userName?: string;
  dashboardUrl?: string;
}
export interface resetPasswordRequestEmailTemplateArgs {
  userName?: string;
  resetLink?: string;
  expiresIn?: string;
  supportUrl?: string;
}
export interface resetPasswordEmailTemplateArgs {
  userName?: string;
  loginUrl?: string;
  supportUrl?: string;
}
