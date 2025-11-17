import { ZodError } from "zod";

export const validate = (schema) => (req, res, next) => {
  try {
    // Parse request with schema
    const result = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    // Attach clean validated data
    req.validated = result;
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        data: err.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      });
    }
    next(err);
  }
};
