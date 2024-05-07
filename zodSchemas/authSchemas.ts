import { z } from "zod";

export const authSchema = z.object({
  username: z
    .string({ required_error: "is required" })
    .min(4, { message: "must be at least 4 characters long." })
    .max(20),
  email: z.string({ required_error: "is required" }).email("must be valid"),
  password: z
    .string({ required_error: "is required" })
    .min(8, { message: "must be at least 8 characters long." }),
});

export const userRegisterSchema = z.object({
  body: authSchema.required(),
});

export const userLoginSchema = z.object({
  body: authSchema.omit({ username: true }).required(),
});

export const onBoardingSchema = z.object({
  body: z
    .object({
      journey: z.string().min(4, {
        message: "must be at least 4 characters",
      }),
      ambitions: z
        .string()
        .array()
        .nonempty({ message: "must choose at least one" }),
      tech: z
        .string()
        .array()
        .nonempty({ message: "must choose at least one" }),
      id: z.string({ required_error: "is required" }).length(36, {
        message: "Not a valid ID",
      }),
    })
    .required(),
});

export const queryParamsSchema = z.object({
  postType: z.string().optional(),
  page: z.string().optional(),
});

export const followSchema = z.object({
  followid: z.string(),
});
