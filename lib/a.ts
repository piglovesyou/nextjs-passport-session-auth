const o1 = {
  a: '1',
  b: 'b',
};

Object.defineProperty(o1, 'boom', {
  get() {
    return 'blaaa';
  },
});
console.log(typeof o1.a);
console.log(Object.getOwnPropertyDescriptor(o1, 'a'));

console.log(typeof o1.boom);
console.log(Object.getOwnPropertyDescriptor(o1, 'boom'));

const p = new Proxy(o1, {
  get: function(_target, _property, receiver) {
    return Reflect;
  },
});

console.log(p.boooooooooom);
