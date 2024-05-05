import { z } from "zod";
export const userRegisterSchema = z.object({
  body: z
    .object({
      username: z
        .string()
        .min(4, { message: "must be at least 4 characters long." })
        .max(20),
      email: z.string({ required_error: "is required" }).email("must be valid"),
      password: z
        .string()
        .min(8, { message: "must be at least 8 characters long." })
        .max(10),
    })
    .required(),
});

export const userLoginSchema = z.object({
  body: z
    .object({
      email: z
        .string({ required_error: "is required" })
        .min(4, {
          message: "must be at least 4 characters",
        })
        .email("must be valid"),
      password: z
        .string({ required_error: "is required" })
        .min(8, { message: "must be at least 8 characters long." }),
    })
    .required(),
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
