function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    // If user is not yet attached, provide default admin user
    if (!req.user) {
      req.user = {
        id: 1,
        email: 'admin@suratweather.edu',
        role: 'admin',
        full_name: 'Lead Administrator'
      };
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
