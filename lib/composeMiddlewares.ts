import { Handler } from 'express';
import { NextApiRequest, NextApiResponse } from 'next';
import { promisify } from 'util';
import redirect from 'micro-redirect';

export default function composeMiddleware(...ms: Handler[]) {
  const promisifiedMiddlewares = ms.map(promisify);
  return async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
    ...restArgs: any[]
  ) {
    if (!res.redirect) {
      // passport.js needs res.redirect:
      // https://github.com/jaredhanson/passport/blob/1c8ede/lib/middleware/authenticate.js#L261
      // Monkey-patch res.redirect to emulate express.js's res.redirect,
      // since it doesn't exist in micro. default redirect status is 302
      // as it is in express. https://expressjs.com/en/api.html#res.redirect
      res.redirect = (location: string) => redirect(res, 302, location);
    }
  };
}
