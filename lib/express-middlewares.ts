import {
  Handler,
  request as expressReqProto,
  response as expressResProto,
} from 'express';
import { NextApiRequest, NextApiResponse } from 'next';
import { promisify } from 'util';

function getProxyGetter(
  expressProto: typeof expressReqProto | typeof expressResProto,
  target,
  property,
  receiver,
) {
  // Access to express API.
  if (Reflect.has(expressProto, property)) {
    const desc = Reflect.getOwnPropertyDescriptor(expressProto, property);

    // It defines getter function
    if (typeof desc.get === 'function') {
      return desc.get.bind(target);
    }

    // XXX: It seems express req doesn't have setter, do it?

    // Callable method
    if (typeof desc.value === 'function') {
      return desc.value.bind(target);
    }

    throw new Error('What others? Give me a PR!');
  }

  // Access to the original http.IncomingMessage
  return Reflect.get(target, property, receiver);
}

export default function expressMiddlewares(...middlewares: Handler[]) {
  const promisifiedMiddlewares = middlewares.map(promisify);

  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Wrap req and res
    const wrappedReq = new Proxy(req, {
      get: getProxyGetter.bind(expressReqProto),
    });
    const wrappedRes = new Proxy(res, {
      get: getProxyGetter.bind(expressResProto),
    });

    try {
      // Compose style
      for (
        let i = promisifiedMiddlewares.length - 1,
          m = promisifiedMiddlewares[i];
        i >= 0;
        m = promisifiedMiddlewares[--i]
      ) {
        await m(wrappedReq, wrappedRes);
      }
    } catch (e) {
      console.error(e);
      throw new Error('Error occurs during express middlewares processing');
    }
  };
}
