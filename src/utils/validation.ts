import { z } from "zod";

// UK postcode regex – supports common formats like SW1A 1AA, EC1A 1BB, etc.
const UK_POSTCODE_REGEX =
  /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

export const signupSchema = z.object({
  displayName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(30, "Name must be 30 characters or less"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password is too long"),
  postcode: z
    .string()
    .regex(UK_POSTCODE_REGEX, "Please enter a valid UK postcode"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const reportSchema = z.object({
  species: z.string().min(1, "Please select a species"),
  weightLb: z.number().min(0).max(200).optional(),
  weightOz: z.number().min(0).max(15).optional(),
  lengthInches: z.number().min(0).max(120).optional(),
  locationName: z.string().min(1, "Location is required"),
  notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
