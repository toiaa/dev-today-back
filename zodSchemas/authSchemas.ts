import { z } from "zod";
export const userRegisterchema = z.object({
  body: z.object({
    username: z.string({ required_error: " is required" }).min(4).max(20),
    email: z
      .string({ required_error: "is required" })
      .email("Email must be valid"),
    password: z.string().min(8).max(10),
  }),
});

export const userLoginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(4, {
        message: "must be at least 4 characters",
      })
      .email("must be valid"),
    password: z
      .string({ required_error: "is required" })
      .min(4, { message: "must be at least 4 characters" }),
  }),
});
