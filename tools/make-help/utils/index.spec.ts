import { add, greet, meaning } from './';

describe('Utils module', () => {
  it('adds', () => {
    expect(add(2, 3)).toEqual(5);
  });
  it('greets', () => {
    expect(greet('worldz')).toEqual('index says: hello to worldzdsf');
  });
  it('meaning', () => {
    expect(meaning.life).toEqual(42);
  });
});
