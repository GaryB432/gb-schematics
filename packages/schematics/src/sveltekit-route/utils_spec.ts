import { makeTestRoute } from './utils.js';

describe('utils', () => {
  it('makes route a', async () => {
    expect(makeTestRoute('/', 'd')).toEqual('/d');
  });
  it('makes route b', async () => {
    expect(makeTestRoute('/a/b/c', 'd')).toEqual('/a/b/c/d');
  });
  it('makes route c', async () => {
    expect(makeTestRoute('a/b/c', 'd')).toEqual('/a/b/c/d');
  });
  it('makes route d', async () => {
    expect(makeTestRoute('c', 'd')).toEqual('/c/d');
  });
  it('makes route e', async () => {
    expect(makeTestRoute('[c]', 'd')).toEqual('/_c_/d');
  });
  it('makes route f', async () => {
    expect(makeTestRoute('b/[c]', 'd')).toEqual('/b/_c_/d');
  });
  it('makes bracket route', async () => {
    expect(makeTestRoute('/a/b/c', '[testid]')).toEqual('/a/b/c/_testid_');
  });
  it('makes multi bracket route', async () => {
    expect(makeTestRoute('/a/[b]/c', '[testid]')).toEqual('/a/_b_/c/_testid_');
  });
});
