import { z } from "zod";
export const userRegistrationSchema = z.object({
  username: z.string().min(4).max(20),
  email: z.string().email(),
  password: z.string().min(8).max(10),
});
