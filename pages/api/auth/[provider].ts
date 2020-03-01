import passport from '../../../lib/passport';
import compose from '../../../lib/passport-middlewares';

export default compose(passport.authenticate('github'))();
