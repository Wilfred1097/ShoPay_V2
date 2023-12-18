// Combined middleware function to extract user role from the token and check for 'admin' role
const authenticateAndRequireAdmin = (req, res, next) => {
    const token = req.cookies.token;
  
    if (!token) {
      return res.status(401).json({ Error: "Unauthorized" });
    }
  
    jwt.verify(token, process.env.USER_TOKEN, (err, user) => {
      if (err) {
        return res.status(403).send('<h1>Forbidden - Admin access required</h1>');
      }
  
      // Check if the user has the 'admin' role
      if (user.userRole !== 'admin') {
        return res.status(403).send('<h1>Forbidden - Admin access required</h1>');
      }

      // Add the user role to the request object
      req.userRole = user.userRole;
      next();
    });
  };
  
  export { authenticateAndRequireAdmin };
  