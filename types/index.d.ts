import z from "zod";
import { userRegisterchema } from "../zodSchemas/authSchemas";

type UserRegister = z.infer<typeof userRegisterchema>;
