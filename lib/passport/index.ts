import passport from 'passport';
import { Profile } from 'passport-github';
import github from './github';

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Github profile is serialized
// and deserialized.
passport.serializeUser((user: Profile, done) => {
  const { id, displayName, username, profileUrl, photos } = user;
  done(null, {
    id,
    displayName,
    username,
    profileUrl,
    photos,
  });
});

passport.deserializeUser(async (serializedUser, done) => {
  if (!serializedUser) {
    return done(new Error(`User not found: ${serializedUser}`));
  }

  done(null, serializedUser);
});

passport.use(github);

export default passport;
