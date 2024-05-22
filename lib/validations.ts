import { z } from "zod";
import { PostType } from "@prisma/client";

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

export const userRegisterSchema = authSchema.required();

export const userLoginSchema = authSchema.omit({ username: true }).required();

export const emailSchema = authSchema.pick({ email: true });

export const idSchema = z.object({
  id: z.string({ required_error: "is required" }).length(36, {
    message: "Not a valid ID",
  }),
});

export const generalPostSchema = z.object({
  title: z.string().min(4, { message: "must be at least 4 characters long." }),
  // type: z.string().min(4, { message: "must choose one." }),
  content: z
    .string()
    .min(4, { message: "must be at least 4 characters long." }),
  // tags: z.string().array().nonempty({ message: "must add at least one" }),
  type: z.nativeEnum(PostType),
  authorId: z.string({ required_error: "is required" }).length(36, {
    message: "Not a valid ID",
  }),
  groupId: z.string().min(4),
  tags: z.string().array(),
});

export const postSchema = generalPostSchema.required();

export const updatePostSchema = generalPostSchema
  .pick({ title: true, content: true })
  .required();

export const userPostsQuery = z.object({
  postType: z.nativeEnum(PostType).optional(),
  page: z.string().optional(),
});

export const viewerIdSchema = z.object({
  viewerId: z
    .string()
    .length(36, {
      message: "Not a valid ID",
    })
    .optional(),
});

export const followViewerIdSchema = z
  .object({
    viewerId: z.string().length(36, {
      message: "Not a valid ID",
    }),
  })
  .required();

export const onBoardingSchema = z
  .object({
    journey: z.string().min(4, {
      message: "must be at least 4 characters",
    }),
    ambitions: z
      .string()
      .array()
      .nonempty({ message: "must choose at least one" }),
    tech: z.string().array().nonempty({ message: "must choose at least one" }),
    id: z.string({ required_error: "is required" }).length(36, {
      message: "Not a valid ID",
    }),
  })
  .required();

export const profileSchema = z.object({
  name: z.string().optional(),
  bio: z
    .string()
    .max(130, {
      message: "maximum of 130 characters",
    })
    .optional(),
  githubLink: z.string().optional(),
  githubHandle: z.string().optional(),
  linkedinLink: z.string().optional(),
  linkedinHandle: z.string().optional(),
  xProfileLink: z.string().optional(),
  xProfileHandle: z.string().optional(),
  instagramLink: z.string().optional(),
  instagramHandle: z.string().optional(),
});

export const userGroupQuery = z.object({
  page: z.string().optional(),
});

export const likerIdSchema = z.object({
  likerId: z.string({ required_error: "is required" }).length(36, {
    message: "Not a valid ID",
  }),
});
