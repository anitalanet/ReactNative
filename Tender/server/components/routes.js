import express from 'express';
import expressJwt from 'express-jwt';
import authRoutes from './auth/auth.routes';
import userRoutes from './user/user.routes';
import countryRoutes from './country/country.routes';
import categoryRoutes from './category/category.routes';
import serviceRoutes from './services/services.routes';
import tenderRoutes from './tender/tender.routes';
import notificationRoutes from './notification/notification.routes';
import supportRoutes from './support/support.routes';
import reviewRoutes from './review/review.routes';
import paymentsRoutes from './payments/payments.routes';
import config from '../config/env';

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

// mount auth routes at /auth
router.use('/api/auth', authRoutes);

// Validating all the APIs with jwt token.
router.use('/api', expressJwt({ secret: config.jwtSecret }));

// If jwt is valid, storing user data in local session.
router.use('/api', (req, res, next) => {
  const authorization = req.header('authorization');
  res.locals.session = JSON.parse(new Buffer((authorization.split(' ')[1]).split('.')[1], 'base64').toString()); // eslint-disable-line no-param-reassign
  next();
});

// mount user routes at /api/users
router.use('/api/users', userRoutes);

// mount country routes at /api/country
router.use('/api/country', countryRoutes);

// mount category routes at /api/category
router.use('/api/category', categoryRoutes);

// mount service routes at /api/service
router.use('/api/service', serviceRoutes);

// mount tender routes at /api/tender
router.use('/api/tender', tenderRoutes);

// mount notification routes at /api/notification
router.use('/api/notification', notificationRoutes);

// mount notification routes at /api/support
router.use('/api/support', supportRoutes);

// mount review routes at /api/review
router.use('/api/review', reviewRoutes);

// mount review routes at /api/payments
router.use('/api/payments', paymentsRoutes);

export default router;
