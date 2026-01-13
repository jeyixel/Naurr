import jwt from "jsonwebtoken";

// basically this function will verify the jwt token sent in the cookies
// and if valid, it will attach the user ID to the request object for further use
export const verifyToken = (req, res, next) => {
  const token = req.cookies?.jwt;
  if (!token) return res.status(401).json({ message: "You are not authenticated!" });

  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    if (err) return res.status(403).json({ message: "Token is not valid!" });
    req.userId = payload.id; // We attach the ID to the request
    next();
  });
};