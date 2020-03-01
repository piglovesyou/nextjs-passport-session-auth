import assert from 'assert';
import cookieSession from 'cookie-session';
import compose from './compose-middlewares';
import passport from './passport';

const middlewares = compose(
  passport.authenticate('github'),
  passport.session(),
  passport.initialize(),
  cookieSession(),
);

export async function handler(req: any, res: any) {
  // Run Express middlewares without polluting req and res💫
  const [reqExtra] = await middlewares(req, res);

  assert.strictEqual(req.user, undefined);

  res.end(`Hello, ${reqExtra.user.name}!`);
}

// How about making a common middleware decorator?

export function withPassport(handle) {
  return async function h(req, res) {
    await middlewares(req, res);

    // Note that "handler" uses original req and res
    handle(req, res);
  };
}

// export default function compose(...argsa: any[]) {
//   let arr: any[] = argsa || [];
//
//   return function f(...args) {
//     if (args.length) {
//       arr = [ ...arr, ...args ];
//       return f;
//     }
//     return arr.length;
//   };
// }
//
// const a = compose(2, 3, 4, 5);
// const b = a(7, 8, 9);
// const c = b();

// console.log(c);

// export default class X {
//   arr: any[];
//   constructor(...args: any[]) {
//     this.arr = [];
//     new Proxy(this, {
//       apply(target, _thisArg, argArray) {
//         if (argArray.length) {
//           return target.compose.apply(target, ...argArray);
//         }
//         return target.get();
//       }
//     })
//   }
//   compose(...args) {
//     if (!args.length) throw new Error('boom');
//     const [h, ...rest] = args;
//     this.arr.push(h);
//     return this.compose(...rest);
//   }
//   get() {
//     return this.arr.length;
//   }
// }

export default {};

// function f() {}
// const proxy = new Proxy(f, {
//   apply(_target, _thisArg, args) {
//     if (args.length) {
//       arr = [...arr, ...args];
//       return proxy;
//     }
//     return arr.length;
//   }
// })
// return proxy;

// const {createServer } = require('http');
//
// createServer(function(_req, res) {
//   const wres = new Proxy(res, {
//     get(t, p, r) {
//       const v = Reflect.get(t, p, r);
//       if (typeof v === 'function') return v.bind(t);
//       return v;
//     },
//   });
//   wres.end('yeah!');
// }).listen(3000);

// import http from 'http';
//
// http.createServer(function(_req, res) {
//   res.end('yeah!');
// }).listen(3000);

// import http from 'http';
//
// const server = http.createServer(function(_req, res) {
//   const wres = new Proxy(res, {});
//
//   wres.end('yeah!!!!!');
// });
//
// server.listen(3000);

// const o1 = {
//   a: '1',
//   b: 'b',
// };
//
// Object.defineProperty(o1, 'boom', {
//   get() {
//     return this.a;
//   },
// });
//
// // console.log(typeof o1.a);
// // console.log(Object.getOwnPropertyDescriptor(o1, 'a'));
// //
// // console.log(typeof o1.boom);
// // console.log(Object.getOwnPropertyDescriptor(o1, 'boom'));
//
// const p = new Proxy(o1, {
//   get: function(_target, _property, receiver) {
//     return function() {
//       return Reflect.get(_target, 'boom');
//     };
//   },
// });
//
// console.log(p.boooooooooom());
// // console.log(o1.boooooooooom);
