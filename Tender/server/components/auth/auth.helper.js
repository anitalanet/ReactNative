import HTTPStatus from 'http-status';

function hasRole(roles) {
  return (req, res, next) => {
    const user = res.locals.session;
    if (!user) {
      return res.status(HTTPStatus.UNAUTHORIZED).send({ message: 'Unauthorized request' });
    }

    if (!roles.includes(user.role)) {
      return res.status(HTTPStatus.FORBIDDEN).send({ message: 'You are not authorized to 0perform this request' });
    }

    return next();
  };
}

export default { hasRole };
