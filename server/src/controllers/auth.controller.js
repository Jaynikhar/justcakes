import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/ApiResponse.js';
import { clearAuthCookie, setAuthCookie } from '../utils/generateToken.js';
import * as authService from '../services/auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.registerUser(req.body);
  setAuthCookie(res, token);
  return created(res, { user: user.toPublic(), token }, 'Welcome to Just Cakes');
});

export const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.loginUser(req.body);
  setAuthCookie(res, token);
  return ok(res, { user: user.toPublic(), token }, 'Signed in');
});

export const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  return ok(res, null, 'Signed out');
});

export const me = asyncHandler(async (req, res) => ok(res, { user: req.user.toPublic() }));
