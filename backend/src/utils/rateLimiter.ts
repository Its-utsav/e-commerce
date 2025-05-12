import rateLimit from "express-rate-limit";

const isDevEnv = process.env.NODE_ENV === "DEV";

if (isDevEnv) {
    console.log("All Rate limiting Begin skiped , Only for Development");
} else {
    console.log("All Rate limiting Begin Applyied ");
}

const devPass = (_req: any, _res: any, next: any) => next();

const authLimiter = isDevEnv
    ? devPass
    : rateLimit({
          windowMs: 15 * 60 * 1000, // 15 Min -> 15 min 60 second 1000 milisecond
          limit: 10, // In 15 min window from single IP 10 request shoudl be accepted
      });

const userLimiter = isDevEnv
    ? devPass
    : rateLimit({
          windowMs: 15 * 60 * 1000,
          limit: 50,
      });

const userPasswordChangeLimiter = isDevEnv
    ? devPass
    : rateLimit({
          windowMs: 15 * 60 * 1000,
          limit: 5,
      });

const refreshTokenLimiter = isDevEnv
    ? devPass
    : rateLimit({
          windowMs: 60 * 60 * 1000,
          limit: 5,
      });
/**
 * @description Rate Limiting for public routes , which are the most accesible to the most of the user
 */
const generalLimiter = isDevEnv
    ? devPass
    : rateLimit({
          windowMs: 10 * 60 * 1000,
          limit: 25,
      });

const adminLimiter = isDevEnv
    ? devPass
    : rateLimit({
          windowMs: 10 * 60 * 1000,
          limit: 1000,
      });

const cartLimiter = isDevEnv
    ? devPass
    : rateLimit({
          windowMs: 10 * 60 * 1000,
          limit: 10,
      });

const merchantLimiter = isDevEnv
    ? devPass
    : rateLimit({
          windowMs: 10 * 60 * 1000,
          limit: 20,
      });
const orderLimiter = isDevEnv
    ? devPass
    : rateLimit({
          windowMs: 10 * 60 * 1000,
          limit: 15,
      });

export {
    authLimiter,
    userLimiter,
    userPasswordChangeLimiter,
    refreshTokenLimiter,
    generalLimiter,
    adminLimiter,
    cartLimiter,
    merchantLimiter,
    orderLimiter,
};
