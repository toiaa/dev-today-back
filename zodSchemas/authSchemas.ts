import { z } from "zod";
export const userRegisterchema = z.object({
  body: z.object({
    username: z
      .string()
      .min(4, { message: "must be at least 4 characters long." })
      .max(20),
    email: z.string({ required_error: "is required" }).email("must be valid"),
    password: z
      .string()
      .min(8, { message: "must be at least 8 characters long." })
      .max(10),
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
      .min(8, { message: "must be at least 8 characters long." }),
  }),
});

export const onBoardingSchema = z.object({
  body: z.object({
    journey: z.string().min(4, {
      message: "must be at least 4 characters",
    }),
    ambitions: z
      .string()
      .array()
      .nonempty({ message: "must choose at least one" }),
    tech: z.string().array().nonempty({ message: "must choose at least one" }),
  }),
});
