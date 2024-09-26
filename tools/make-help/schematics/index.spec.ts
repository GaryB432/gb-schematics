import { add, greet, meaning } from './';

describe('Schematics module', () => {
  it('adds', () => {
    expect(add(2, 3)).toEqual(5);
  });
  it('greets', () => {
    expect(greet('world')).toEqual('index says: hello to worldx');
  });
  it('meaning', () => {
    expect(meaning.life).toEqual(42);
  });
});
