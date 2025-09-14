const { clerkClient } = require('@clerk/clerk-sdk-node');

const authenticateClerkToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access token required'
      });
    }

    const payload = await clerkClient.verifyToken(token);
    const clerkUser = await clerkClient.users.getUser(payload.sub);
    
    const user = {
      _id: clerkUser.id,
      id: clerkUser.id,
      username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] || 'user',
      email: clerkUser.emailAddresses[0]?.emailAddress,
      displayName: (clerkUser.firstName || '') + (clerkUser.lastName ? ` ${clerkUser.lastName}` : '') || clerkUser.username || 'User',
      avatarUrl: clerkUser.imageUrl,
      isVerified: clerkUser.publicMetadata?.isVerified || false
    };

    req.user = user;
    next();

  } catch (error) {
    console.error('Auth error:', error);
    return res.status(403).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
};

const optionalClerkAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const payload = await clerkClient.verifyToken(token);
        const clerkUser = await clerkClient.users.getUser(payload.sub);
        
        const user = {
          _id: clerkUser.id,
          id: clerkUser.id,
          username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] || 'user',
          email: clerkUser.emailAddresses[0]?.emailAddress,
          displayName: (clerkUser.firstName || '') + (clerkUser.lastName ? ` ${clerkUser.lastName}` : '') || clerkUser.username || 'User',
          avatarUrl: clerkUser.imageUrl,
          isVerified: clerkUser.publicMetadata?.isVerified || false
        };
        
        req.user = user;
      } catch (error) {
        // Silent fail for optional auth
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticateToken: authenticateClerkToken,
  optionalAuth: optionalClerkAuth
};
