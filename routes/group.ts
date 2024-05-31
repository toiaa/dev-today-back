import { Router, Response } from "express";
import { validate, ValidationType } from "../middlewares/middleware";
import { prisma } from "../lib/prisma";
import { StatusCodes } from "http-status-codes";
import {
  TypedRequest,
  TypedRequestBody,
  TypedRequestParams,
} from "zod-express-middleware";
import { ZodAny } from "zod";

import {
  editGroupSchema,
  groupSchema,
  adminUserSchema,
  idSchema,
  groupMembersQuery,
  joinGroupSchema,
} from "../lib/validations";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const router = Router();

router.post(
  "/create",
  validate(groupSchema, ValidationType.BODY),
  async (req: TypedRequestBody<typeof groupSchema>, res: Response) => {
    const { name, bio, profileImage, coverImage, creatorId, members } =
      req.body;
    try {
      const group = await prisma.group.create({
        data: {
          name,
          bio,
          profileImage: profileImage || "",
          coverImage,
          creatorId, // what about the creators name?
          groupUser: {
            create: [
              {
                userId: creatorId,
                isAdmin: true,
              },
              ...members,
            ],
          },
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

// GET GROUP INFO route
router.get(
  "/:id",
  validate(idSchema, ValidationType.PARAMS),
  async (req: TypedRequestParams<typeof idSchema>, res: Response) => {
    const id = req.params.id;
    try {
      const group = await prisma.group.findUnique({
        where: { id },
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
// GET ADMINS pagination 5
router.get(
  "/:id/admins",
  validate(idSchema, ValidationType.PARAMS),
  validate(groupMembersQuery, ValidationType.QUERY),
  async (
    req: TypedRequest<typeof idSchema, typeof groupMembersQuery, ZodAny>,
    res: Response,
  ) => {
    const groupId = req.params.id;
    const pageSize = 10;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    try {
      const skip = (page - 1) * pageSize;

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
        skip,
        take: pageSize,
      });
      console.log(admins); // i want to check but dont have enough admins or users
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
// GET MEMBERS pagination 10
router.get(
  "/:id/members",
  validate(idSchema, ValidationType.PARAMS),
  validate(groupMembersQuery, ValidationType.QUERY),
  async (
    req: TypedRequest<typeof idSchema, typeof groupMembersQuery, ZodAny>,
    res: Response,
  ) => {
    const groupId = req.params.id;
    const pageSize = 10;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    try {
      const skip = (page - 1) * pageSize;
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
        skip,
        take: pageSize,
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
// ADD ADMINS, GROUP MEMBERS will become admins
router.patch(
  "/:id/add-admin",
  validate(idSchema, ValidationType.PARAMS),
  validate(adminUserSchema, ValidationType.BODY),
  async (
    req: TypedRequest<typeof idSchema, typeof adminUserSchema, ZodAny>,
    res: Response,
  ) => {
    const groupId = req.params.id;
    const { memberId, creatorId } = req.body;
    try {
      const group = await prisma.group.findUnique({
        where: { id: groupId, creatorId },
        include: { groupUser: true },
      });

      if (group?.creatorId !== creatorId) {
        // is this necesary since im searching for the group that the user created ?????
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "You are not allowed to add admins" });
      }

      const groupUser = await prisma.groupUser.update({
        where: { userId_groupId: { userId: memberId, groupId } },
        data: { isAdmin: true },
      });

      console.log(groupUser);

      return res.status(StatusCodes.OK).json({ user: groupUser });
    } catch (error) {
      console.error(error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);
// EDIT GROUP (not members and admins only group info)
router.patch(
  "/:id",
  validate(idSchema, ValidationType.PARAMS),
  validate(editGroupSchema, ValidationType.BODY),
  async (
    req: TypedRequest<typeof idSchema, typeof editGroupSchema, ZodAny>,
    res: Response,
  ) => {
    const groupId = req.params.id;
    const { name, bio, profileImage, coverImage, userId } = req.body;
    try {
      const group = await prisma.group.findUnique({
        where: { id: groupId, creatorId: userId },
        include: { groupUser: true },
      });

      if (group?.creatorId !== userId) {
        // is this necesary? im already searching for the group that the user created ?????
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "You are not allowed to edit the group" });
      }
      const groupUpdate = await prisma.group.update({
        where: { id: groupId },
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

router.post(
  "/:id/join",
  validate(idSchema, ValidationType.PARAMS),
  validate(joinGroupSchema, ValidationType.BODY),
  async (req: any, res: Response) => {
    const groupId = req.params.id;
    const userId = req.body.adminId;
    const newMember = req.body.newMember;
    const { memberId, isAdmin } = newMember;
    try {
      if (userId === memberId) {
        const relationCreated = await prisma.groupUser.create({
          data: {
            userId: userId,
            groupId: groupId,
          },
        });
        console.log(relationCreated);
      } else {
        const groupAdmin = await prisma.group.findUnique({
          where: { id: groupId },
          include: {
            groupUser: { where: { userId: memberId, isAdmin } },
          }, // enough to validate ???
        });

        if (!groupAdmin) {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "Not allowed to add members" });
        }
        const relationCreated = await prisma.groupUser.create({
          data: {
            userId: userId,
            groupId: groupId,
          },
        });
        console.log(relationCreated);
      }

      return res.status(StatusCodes.OK).json({ message: "User joined group" });
    } catch (error) {
      console.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return res
            .status(StatusCodes.CONFLICT)
            .json({ message: "User already in group" });
        }
      }
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

// delete user from group
router.delete(
  "/:id/leave",
  validate(idSchema, ValidationType.PARAMS),
  validate(joinGroupSchema, ValidationType.BODY),
  async (req: any, res: Response) => {
    const groupId = req.params.id;
    const userId = req.body.adminId;
    const newMember = req.body.newMember;
    const { memberId, isAdmin } = newMember;
    try {
      if (userId === memberId) {
        await prisma.groupUser.delete({
          where: {
            userId_groupId: {
              groupId: groupId,
              userId: userId,
            },
          },
        }); // enough to validate ???
      } else {
        const groupAdmin = await prisma.group.findUnique({
          where: { id: groupId },
          include: {
            groupUser: { where: { userId: memberId, isAdmin: true } },
          },
        });

        if (!groupAdmin) {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "Not allowed to add members" });
        }
        await prisma.groupUser.delete({
          where: {
            userId_groupId: {
              groupId: groupId,
              userId: memberId,
            },
          },
        });
      }
      return res.status(StatusCodes.OK).json({ message: "User joined group" });
    } catch (error) {
      console.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "Group does not exist" });
        }
      }
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

// delete group:
router.delete(
  ":/id",
  validate(idSchema, ValidationType.PARAMS),
  validate(idSchema, ValidationType.BODY),
  async (req: TypedRequest<typeof idSchema, typeof idSchema, ZodAny>, res) => {
    const groupId = req.params.id;
    const creatorId = req.body.creatorId;
    try {
      const group = await prisma.group.findUnique({
        where: { creatorId, id: groupId },
      }); // enough to validate ???

      if (!group) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: " Not Allowed " });
      }

      const groupDeleted = await prisma.group.delete({
        where: { id: groupId },
      });
      console.log("this group was deleted", groupDeleted);
      return res.status(StatusCodes.OK).json(group);
    } catch (error) {
      console.error(error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);
// return all groups the user is in (names in a string array)
router.get(
  "/user/:id",
  validate(idSchema, ValidationType.PARAMS),
  async (req: TypedRequestParams<typeof idSchema>, res: Response) => {
    const userId = req.params.id;
    try {
      const groups = await prisma.groupUser.findMany({
        where: { userId },
        include: {
          group: true,
        },
      });

      const groupIds = groups.map((data) => data.group.name); // return names? or return each group in an array

      return res.status(StatusCodes.OK).json(groupIds);
    } catch (error) {
      console.error(error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

export default router;
// check if error is a prisma error: check MJS code
