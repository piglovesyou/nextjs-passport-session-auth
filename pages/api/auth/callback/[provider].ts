import cookieSession from 'cookie-session';
import passport from '../../../../lib/passport';
import { compose } from '../../../../lib/compose-middlewares';
// import compose from '../../../../lib/passport-middlewares';

export default compose(
  passport.authenticate('github', {
    failureRedirect: '/auth',
    successRedirect: '/',
  }),
  passport.session(),
  passport.initialize(),
  cookieSession({
    name: 'passportSession',
    signed: false,
    // domain: url.parse(req.url).host,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  }),
)();
