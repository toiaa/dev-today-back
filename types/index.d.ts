import z from "zod";
import {
  userRegisterSchema,
  userLoginSchema,
  onBoardingSchema,
} from "../zodSchemas/authSchemas";
import { postSchema } from "../zodSchemas/postSchemas";

type UserRegisterType = z.infer<typeof userRegisterSchema>;
type UserLoginType = z.infer<typeof userLoginSchema>;
type OnBoardingType = z.infer<typeof onBoardingSchema>;
type PostType = z.inder<typeof postSchema>;
