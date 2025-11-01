import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({ message: "Invalid or expired token" });

    console.log("✅ Decoded JWT:", decoded); // 👈 ADD THIS

    req.user = { userId: decoded.userId || decoded.id }; // ensure correct key
    console.log("Decoded JWT:", decoded);
    next();
  });
};
