import { z } from "zod";

export const idParameterSchema = z.object({
  params: z
    .object({
      id: z.string({ required_error: "is required" }).length(36, {
        message: "Not a valid ID",
      }),
    })
    .required(),
});

//general schema that has all fields, where necessary we take the required ones that we need for a specific validation.
export const generalPostSchema = z.object({
  title: z.string().min(4, { message: "must be at least 4 characters long." }),
  // type: z.string().min(4, { message: "must choose one." }),
  content: z
    .string()
    .min(4, { message: "must be at least 4 characters long." }),
  // tags: z.string().array().nonempty({ message: "must add at least one" }),
  authorId: z.string({ required_error: "is required" }).length(36, {
    message: "Not a valid ID",
  }),
});

export const postSchema = z.object({
  body: generalPostSchema.required(),
});

export const updatePostSchema = z.object({
  body: generalPostSchema.pick({ title: true, content: true }).required(),
});
