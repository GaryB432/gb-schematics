import { add, greet, meaning } from './index';

describe('Index', () => {
  it('adds', () => {
    expect(add(2, 3)).toEqual(5);
  });
  it('greets', () => {
    expect(greet('world')).toEqual('index says: hello to world');
  });
  it('meaning', () => {
    expect(meaning.life).toEqual(42);
  });
});
