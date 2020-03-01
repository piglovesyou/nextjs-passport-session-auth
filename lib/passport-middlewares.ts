import cookieSession from 'cookie-session';
import { compose } from './compose-middlewares';
import passport from './passport';

export default compose(
  passport.session(),
  passport.initialize(),
  cookieSession({
    name: 'passportSession',
    signed: false,
    // domain: url.parse(req.url).host,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  }),
);
