import { z } from "zod";

// Blocklist of personal email providers
export const PERSONAL_EMAIL_DOMAINS = [
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com",
  "icloud.com", "protonmail.com", "proton.me", "mail.com", "live.com",
  "msn.com", "yandex.com", "zoho.com", "gmx.com", "fastmail.com",
  "tutanota.com", "mailinator.com", "guerrillamail.com", "tempmail.com",
  "10minutemail.com", "throwaway.email", "sharklasers.com", "inbox.com",
  "me.com", "mac.com", "qq.com", "163.com", "126.com", "sina.com",
  "rediffmail.com", "ymail.com", "rocketmail.com", "att.net", "comcast.net",
  "verizon.net", "sbcglobal.net", "bellsouth.net", "cox.net", "earthlink.net"
];

export const isCompanyEmail = (email: string): boolean => {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return !PERSONAL_EMAIL_DOMAINS.includes(domain);
};

export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z.object({
  email: z.string()
    .email("Please enter a valid email address")
    .refine(isCompanyEmail, "Personal email addresses are not allowed. Please use your company email address (e.g., you@yourcompany.com)"),
  password: passwordSchema,
});

export const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: passwordSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
