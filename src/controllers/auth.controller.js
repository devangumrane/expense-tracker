import { registerUser, loginUser, getUserById } from "../services/auth/auth.service.js";

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const result = await registerUser({ email, password, name });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
