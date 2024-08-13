export const APP_PORT = parseInt(process.env.APP_PORT) || 3000;
export const APP_URL = process.env.APP_URL || `http://localhost:3000`;

export default () => ({
  APP_PORT,
  APP_URL
});
