import { z } from "zod";
export const postSchema = z.object({
  body: z
    .object({
      title: z
        .string()
        .min(4, { message: "must be at least 4 characters long." }),
      type: z.string().min(4, { message: "must choose one." }),

      content: z
        .string()
        .min(4, { message: "must be at least 4 characters long." }),
      tags: z.string().array().nonempty({ message: "must add at least one" }),
    })
    .required(),
});

export const idParameterSchema = z.object({
  params: z
    .object({
      id: z.string({ required_error: "is required" }).length(36, {
        message: "Not a valid ID",
      }),
    })
    .required(),
});
