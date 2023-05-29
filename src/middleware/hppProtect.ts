/**
 * A middleware that protects from HTTP parameter polution.
 * When it comes to an array parameter it replaces it with its first element
 *
 * @param req
 * @param res
 * @param next
 */
const hppProtect = (req, res, next) => {
  Object.keys(req.query).map((key) => {
    if (typeof req.query[key] !== "string") {
      if (Array.isArray(req.query[key])) {
        // Take only the first element if array
        req.query[key] = req.query[key][0];
      } else {
        return res.status(400).json({ error: "Bad parameters" });
      }
    }
  });
  next();
};

export default hppProtect;
