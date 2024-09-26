import { add, greet, meaning } from './main';

describe('Main', () => {
  it('adds', () => {
    expect(add(2, 3)).toEqual(5);
  });
  it('greets', () => {
    expect(greet('world')).toEqual('main says: hello to world');
  });
});
