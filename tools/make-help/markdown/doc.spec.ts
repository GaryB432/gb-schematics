import { Doc } from './doc';

describe('Doc', () => {
  let doc: Doc;

  beforeEach(() => {
    doc = new Doc(2);
  });
  it('adds', () => {
    expect(doc.add(3)).toEqual(5);
  });
  it('greets', () => {
    expect(doc.greet('world')).toEqual('Doc says: hello to world');
  });
});
