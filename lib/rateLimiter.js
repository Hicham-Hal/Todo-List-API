import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56,
    message: { error: 'Too many requests, Please try again later' }
})