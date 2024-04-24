import z from "zod";
import {
  userRegisterchema,
  userLoginSchema,
  onBoardingSchema,
} from "../zodSchemas/authSchemas";
import { postSchema } from "../zodSchemas/postSchemas";

type UserRegisterType = z.infer<typeof userRegisterchema>;
type UserLoginType = z.infer<typeof userLoginSchema>;
type OnBoardingType = z.infer<typeof onBoardingSchema>;
type PostType = z.inder<typeof postSchema>;
