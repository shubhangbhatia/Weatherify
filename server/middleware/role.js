function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires ${allowedRoles.join(' or ')} privileges.`
      });
    }

    next();
  };
}

const requireAdmin = authorizeRoles('admin');
const requireViewerOrAdmin = authorizeRoles('viewer', 'admin');

module.exports = {
  authorizeRoles,
  requireAdmin,
  requireViewerOrAdmin
};
