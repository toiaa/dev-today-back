import { Router, Request, Response } from "express";
import { validate, ValidationType } from "../middlewares/middleware";
import { prisma } from "../lib/prisma";
import { StatusCodes } from "http-status-codes";
import { TypedRequest, TypedRequestParams } from "zod-express-middleware";
import { ZodAny } from "zod";

import {
  groupSchema,
  groupUserSchema,
  idSchema,
  membersSchema,
} from "../lib/validations";
const router = Router();

// CREATE GROUP with the user id as a param
router.post(
  "/create/:id",
  validate(groupSchema, ValidationType.BODY),
  async (
    req: TypedRequest<typeof idSchema, typeof groupSchema, ZodAny>,
    res: Response,
  ) => {
    const { name, bio, profileImage, coverImage } = req.body;
    const userId = req.params.id;
    try {
      const group = await prisma.group.create({
        data: {
          name,
          bio,
          profileImage,
          coverImage,
          groupUser: {
            create: {
              userId,
              isAdmin: true,
              isCreator: true,
            },
          },
        },
      });
      return res.status(StatusCodes.OK).json({ id: group.id });
    } catch (error) {
      console.error(error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

// ADD MEMBERS TO A GROUP , with group id as a param, will be after pressing the create group button and then we will add the members ????
router.post(
  "/members/:id",
  validate(idSchema, ValidationType.PARAMS),
  validate(membersSchema, ValidationType.BODY),
  async (
    req: TypedRequest<typeof idSchema, typeof groupUserSchema, ZodAny>,
    res: Response,
  ) => {
    const groupId = req.params.id;
    const { members } = req.body;
    try {
      const group = await prisma.groupUser.create({
        data: members.map((member: any) => ({
          userId: member.userId,
          groupId,
          isAdmin: member.isAdmin,
        })),
      });
      return res.status(StatusCodes.OK).json({ id: group.id });
    } catch (error) {
      console.error(error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

// ADD ADMINS TO A GROUP , with group id as a param, will be after pressing the create group button and then we will add the members ????
// will this be the same route as the one to make someone an admin that is already a member or will i have to build another one
router.post(
  "/admins/:id",
  validate(idSchema, ValidationType.PARAMS),
  validate(membersSchema, ValidationType.BODY),
  async (
    req: TypedRequest<typeof idSchema, typeof groupUserSchema, ZodAny>,
    res: Response,
  ) => {
    const groupId = req.params.id;
    const { members } = req.body;
    try {
      const group = await prisma.groupUser.create({
        data: members.map((member: any) => ({
          userId: member.userId,
          groupId,
          isAdmin: true,
        })),
      });
      return res.status(StatusCodes.OK).json({ id: group.id });
    } catch (error) {
      console.error(error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);
// GET ADMINS
router.get(
  "/:id/admins",
  validate(idSchema, ValidationType.PARAMS),
  async (req: TypedRequestParams<typeof idSchema>, res: Response) => {
    const groupId = req.params.id;
    try {
      const admins = await prisma.groupUser.findMany({
        where: { groupId, isAdmin: true },
        include: {
          user: {
            select: {
              id: true,
              image: true,
              profile: true,
            },
          },
        },
      });
      if (admins) {
        return res.status(StatusCodes.OK).json(admins);
      }
    } catch (error) {
      console.error(error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server Error" });
    }
  },
);
// GET MEMBERS
router.get(
  "/:id/members",
  validate(idSchema, ValidationType.PARAMS),
  async (req: TypedRequestParams<typeof idSchema>, res: Response) => {
    const groupId = req.params.id;
    try {
      const members = await prisma.groupUser.findMany({
        where: { groupId },
        include: {
          user: {
            select: {
              id: true,
              image: true,
              profile: true,
            },
          },
        },
      });
      if (members) {
        return res.status(StatusCodes.OK).json(members);
      }
    } catch (error) {
      console.error(error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server Error" });
    }
  },
);

// GET SPECIFIC GROUP
// ask if i have to do other routes for the members, i did built one

router.get(
  "/:id",
  validate(idSchema, ValidationType.PARAMS),
  async (req: TypedRequestParams<typeof idSchema>, res: Response) => {
    const id = req.params.id;
    try {
      const group = await prisma.group.findUnique({
        where: { id },
        //      include: { groupUser: true }, only if i need the members and i will have to do it with pagination
      });
      if (group) {
        return res.status(StatusCodes.OK).json(group);
      }
    } catch (error) {
      console.error(error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server Error" });
    }
  },
);

// EDIT GROUP INFO route (not members and admins)
router.patch(
  "/:id",
  validate(idSchema, ValidationType.PARAMS),
  validate(groupSchema, ValidationType.BODY),
  async (
    req: TypedRequest<typeof idSchema, typeof groupSchema, ZodAny>,
    res: Response,
  ) => {
    const id = req.params.id;
    const { name, bio, profileImage, coverImage } = req.body;
    try {
      const groupUpdate = await prisma.group.update({
        where: { id },
        data: {
          name,
          bio,
          profileImage,
          coverImage,
        },
      });

      if (groupUpdate) {
        return res.status(StatusCodes.OK).json(groupUpdate);
      }
    } catch (error) {
      console.log(error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server Error" });
    }
  },
);

// JOIN GROUP route

// ask mateo : here i would need to ask if there is a way to stop users from joining a group if they are already in it or add a constraint in the model
// AND or id ANYONE can join or certain users,

router.post(
  "/:id/join",
  validate(idSchema, ValidationType.PARAMS),
  validate(idSchema, ValidationType.QUERY),
  async (req: TypedRequestParams<typeof idSchema>, res: Response) => {
    const groupId = req.params.id;
    const userId = req.query.id;
    try {
      /*   const existingGroup = await prisma.groupUser.findFirst({
            where: {
            groupId: groupId,
            userId: userId,
            },
        });

      if (existingGroup) {
        throw new Error("Group with this name already exists");
      } */
      const group = await prisma.groupUser.create({
        data: {
          userId: userId,
          groupId: groupId,
        },
      });
      return res.status(StatusCodes.OK).json(group);
    } catch (error) {
      console.error(error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

export default router;
