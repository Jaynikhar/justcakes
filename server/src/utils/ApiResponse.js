export function sendSuccess(res, statusCode, data, message = 'OK', meta = undefined) {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

export const ok = (res, data, message = 'OK', meta) => sendSuccess(res, 200, data, message, meta);
export const created = (res, data, message = 'Created') => sendSuccess(res, 201, data, message);
