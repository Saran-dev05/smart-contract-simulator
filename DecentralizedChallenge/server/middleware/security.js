const rateLimit = require('express-rate-limit');

// Rate limiting
const createRateLimit = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: { success: false, error: message },
        standardHeaders: true,
        legacyHeaders: false,
    });
};

// General API rate limit
const apiLimiter = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // limit each IP to 100 requests per windowMs
    'Too many API requests from this IP, please try again later.'
);

// Strict rate limit for write operations
const strictLimiter = createRateLimit(
    60 * 1000, // 1 minute
    10, // limit each IP to 10 requests per minute
    'Too many write operations from this IP, please try again later.'
);

// Input validation middleware
const validateInput = (req, res, next) => {
    // Basic XSS protection
    const sanitizeString = (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    };

    // Recursively sanitize object
    const sanitizeObject = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;
        
        const sanitized = Array.isArray(obj) ? [] : {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === 'string') {
                    sanitized[key] = sanitizeString(obj[key]);
                } else if (typeof obj[key] === 'object') {
                    sanitized[key] = sanitizeObject(obj[key]);
                } else {
                    sanitized[key] = obj[key];
                }
            }
        }
        return sanitized;
    };

    // Sanitize request body
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }

    next();
};

// Authentication middleware (simplified)
const requireAuth = (req, res, next) => {
    const userAddress = req.headers['x-user-address'] || req.body.user || req.query.user;
    
    if (!userAddress) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }

    // Basic address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid user address format'
        });
    }

    req.userAddress = userAddress;
    next();
};

// CORS headers
const corsHeaders = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-address');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
};

// Security headers
const securityHeaders = (req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
};

// Request size limit
const requestSizeLimit = (req, res, next) => {
    const contentLength = req.headers['content-length'];
    const maxSize = 1024 * 1024; // 1MB

    if (contentLength && parseInt(contentLength) > maxSize) {
        return res.status(413).json({
            success: false,
            error: 'Request entity too large'
        });
    }

    next();
};

// Logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    });

    next();
};

// Error handling middleware
const errorHandler = (error, req, res, next) => {
    console.error('Security middleware error:', error);
    
    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: isDevelopment ? error.message : undefined
    });
};

// Apply all security middleware (without rate limiting for demo)
module.exports = (req, res, next) => {
    // Apply middleware in order
    corsHeaders(req, res, () => {
        securityHeaders(req, res, () => {
            requestSizeLimit(req, res, () => {
                validateInput(req, res, () => {
                    requestLogger(req, res, () => {
                        next();
                    });
                });
            });
        });
    });
};

// Export individual middleware for specific use
module.exports.requireAuth = requireAuth;
module.exports.validateInput = validateInput;
module.exports.apiLimiter = apiLimiter;
module.exports.strictLimiter = strictLimiter;
module.exports.errorHandler = errorHandler;
