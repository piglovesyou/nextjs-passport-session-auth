import {
  Handler,
  request as expressReqProto,
  response as expressResProto,
} from 'express';
import { NextApiRequest, NextApiResponse } from 'next';
import { promisify } from 'util';

// import {init as getExpressInitializer} from 'express/lib/middleware/init';
// const expressInit = getExpressInitializer(express());

type THandler<TReqExt = any, TResExt = any> = (
  req: NextApiRequest,
  res: NextApiResponse,
) => Promise<[TReqExt, TResExt]>;

interface TCompose {
  (): Handler;
  (h1: Handler): TCompose;
  (h1: Handler, h2: Handler): TCompose;
  (h1: Handler, h2: Handler, h3: Handler): TCompose;
  (h1: Handler, h2: Handler, h3: Handler, h4: Handler): TCompose;
  (h1: Handler, h2: Handler, h3: Handler, h4: Handler, h5: Handler): TCompose;
  (
    h1: Handler,
    h2: Handler,
    h3: Handler,
    h4: Handler,
    h5: Handler,
    h6: Handler,
  ): TCompose;
  (
    h1: Handler,
    h2: Handler,
    h3: Handler,
    h4: Handler,
    h5: Handler,
    h6: Handler,
    h7: Handler,
  ): TCompose;
  (
    h1: Handler,
    h2: Handler,
    h3: Handler,
    h4: Handler,
    h5: Handler,
    h6: Handler,
    h7: Handler,
    h8: Handler,
  ): TCompose;
  (
    h1: Handler,
    h2: Handler,
    h3: Handler,
    h4: Handler,
    h5: Handler,
    h6: Handler,
    h7: Handler,
    h8: Handler,
    h9: Handler,
  ): TCompose;
  (
    h1: Handler,
    h2: Handler,
    h3: Handler,
    h4: Handler,
    h5: Handler,
    h6: Handler,
    h7: Handler,
    h8: Handler,
    h9: Handler,
    h10: Handler,
  ): TCompose;
}

function getProxyGetter(
  disposor: Record<any, any>,
  expressProto: typeof expressReqProto | typeof expressResProto,
) {
  return function proxyGetter(target, property /*_receiver*/) {
    let obj: any;

    if (Reflect.has(disposor, property)) {
      // Arbitrary properties such as "session"
      obj = disposor;
    } else if (Reflect.has(target, property)) {
      // Access to the original http.IncomingMessage
      obj = target;
    } else if (Reflect.has(expressProto, property)) {
      // Access to express API.

      obj = expressProto;
    } else {
      throw new Error('What else?');
    }

    const value = Reflect.get(obj, property, obj);

    // Some functions internally expects original object, so we bind it.
    if (typeof value === 'function') return value.bind(target);

    return value;
  };
}

function getProxySetter(disposor: Record<any, any>) {
  return function proxySetter(target, property, value) {
    // "_header" etc.
    if (Reflect.has(target, property)) {
      return Reflect.set(target, property, value);
    }

    return Reflect.set(disposor, property, value);
  };
}

export default function createHandler<TReqExt = any, TResExt = any>(
  ...middlewares: Handler[]
) {
  const promisifiedMiddlewares = middlewares.map(m => promisify<any, any>(m));

  const handler: THandler<TReqExt, TResExt> = async (req, res) => {
    const reqDisposor = {} as TReqExt;
    const resDisposor = {} as TResExt;

    // Wrap req and res
    const wrappedReq = new Proxy(req, {
      get: getProxyGetter(reqDisposor, expressReqProto),
      set: getProxySetter(reqDisposor),
    });
    const wrappedRes = new Proxy(res, {
      get: getProxyGetter(resDisposor, expressResProto),
      set: getProxySetter(resDisposor),
    });

    // TODO: This goes wrong. Why?
    // expressInit(wrappedReq, wrappedRes, () => { throw new Error('Wait, who calls me?')});

    try {
      // Compose style from right to left
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

    return [reqDisposor, resDisposor];
  };

  return handler;
}

export const compose: TCompose = (...handlers) => {
  if (!handlers.length) throw new Error('boom');

  const f: TCompose = (...args) => {
    if (args.length) {
      // Use .call for typecheck
      return compose.call(this, ...args, ...handlers);
    }

    return createHandler(...handlers);
  };
  return f;
};
