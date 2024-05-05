import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { StatusCodes } from "http-status-codes";

export function validate(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue) => {
          const label = issue.path.length > 1 ? issue.path[1] : issue.path[0];
          return { message: `${label}: ${issue.message}` };
        });
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "Invalid data", details: errorMessages });
      } else {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: "Internal Server Error" });
      }
    }
  };
}
