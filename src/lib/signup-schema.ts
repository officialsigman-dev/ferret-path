import { z } from "zod";
import { INTEREST_VALUES, WISCONSIN_COUNTIES, WISCONSIN_ZIP_RE } from "./wisconsin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const countySet = new Set<string>(WISCONSIN_COUNTIES);
const interestSet = new Set<string>(INTEREST_VALUES);

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(255),
    role: z.enum(["teen_14_17", "student_18", "parent", "employer", "school_counselor"]),
    county: z.string().refine((v) => countySet.has(v), { message: "Choose a Wisconsin county." }),
    zip: z.string().trim().regex(WISCONSIN_ZIP_RE, { message: "Enter a 5-digit Wisconsin ZIP code." }),
    grade: z.enum(["9", "10", "11", "12", "not_sure"]).optional().nullable(),
    interest: z
      .string()
      .refine((v) => interestSet.has(v), { message: "Choose a valid interest." })
      .optional()
      .nullable(),
    company: z.string().trim().max(200).optional().nullable(),
    industry: z.string().trim().max(100).optional().nullable(),
    parentEmail: z.string().optional().nullable(),
    message: z.string().trim().max(1000).optional().nullable(),
    utmSource: z.string().max(100).optional().nullable(),
    utmMedium: z.string().max(100).optional().nullable(),
    utmCampaign: z.string().max(100).optional().nullable(),
    ref: z.string().max(200).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "teen_14_17") {
      const parentEmail = (data.parentEmail ?? "").trim();
      if (!parentEmail) {
        ctx.addIssue({
          code: "custom",
          path: ["parentEmail"],
          message: "A parent or guardian email is required for teens 14–17.",
        });
      } else if (!EMAIL_RE.test(parentEmail) || parentEmail.length > 255) {
        ctx.addIssue({
          code: "custom",
          path: ["parentEmail"],
          message: "Enter a valid parent or guardian email.",
        });
      }
    }
    if (data.role === "employer" && !(data.company ?? "").trim()) {
      ctx.addIssue({ code: "custom", path: ["company"], message: "Company name is required for employers." });
    }
    if ((data.role === "teen_14_17" || data.role === "student_18" || data.role === "parent") && !data.grade) {
      ctx.addIssue({ code: "custom", path: ["grade"], message: "Choose a grade." });
    }
  });

export type SignupInput = z.infer<typeof signupSchema>;
