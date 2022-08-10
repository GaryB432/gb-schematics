import { makeTestRoute } from './utils';

describe('utils', () => {
  it('makes route', async () => {
    expect(makeTestRoute('a/b/c', 'd')).toEqual('a/b/c/d');
  });
});
