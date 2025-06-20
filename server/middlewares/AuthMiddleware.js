const jwt = require('jsonwebtoken');

// Middleware to authenticate users
const authenticate = (req, res, next) => {
    // Log the incoming request and check for token
    console.log('Incoming request for authentication:', req.method, req.url);
    
    const token = req.header("Authorization")?.split(" ")[1]; // Ensure "Bearer <token>" format
    console.log('Authorization token:', token ? '[TOKEN PRESENT]' : '[NO TOKEN]');
    
    if (!token) {
        console.log('No token found. Access denied.');
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        // Decode and verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);

        req.user = { id: decoded.id, roleName: decoded.roleName };
        console.log(`User authenticated: ${req.user.id}, Role: ${req.user.roleName}`);
        
        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        res.status(400).json({ message: "Invalid token." });
    }
}; 

// Middleware to authorize roles
// Sai ở đây
const authorize = (allowedRoles) => (req, res, next) => {
    // Log user role and allowed roles for the request
    console.log('Authorizing user with role:', req.user.roleName);
    console.log('Allowed roles for this route:', allowedRoles.join(', '));

    if (!allowedRoles.includes(req.user.roleName)) {
        console.log('Access denied: User role not authorized.');
        return res.status(403).json({ message: "Access denied" });
    }

    console.log('User authorized, proceeding to the next middleware.');
    next();
};


module.exports = { authenticate, authorize };
