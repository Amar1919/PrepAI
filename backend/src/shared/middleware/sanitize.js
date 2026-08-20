// express-mongo-sanitize is not compatible with Express 5 (req.query is
// read-only there). This lightweight alternative strips Mongo operator
// keys ($gt, $ne, etc.) and dotted paths from req.body only, which is
// the primary injection surface for this API (query/params are not
// interpolated directly into Mongo queries anywhere in this app).
function stripDangerousKeys(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(stripDangerousKeys);
    return obj;
  }

  if (obj && typeof obj === "object") {
    for (const key of Object.keys(obj)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete obj[key];
        continue;
      }
      stripDangerousKeys(obj[key]);
    }
  }

  return obj;
}

const sanitizeBody = (req, res, next) => {
  if (req.body) stripDangerousKeys(req.body);
  next();
};

module.exports = sanitizeBody;
