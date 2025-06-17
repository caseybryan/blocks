const { setCookie, getCookie } = require('./game');

describe('cookie helpers', () => {
  beforeEach(() => {
    // Reset document.cookie before each test
    document.cookie = '';
  });

  test('setCookie stores value', () => {
    setCookie('test', 'value', 1);
    expect(document.cookie).toContain('test=value');
  });

  test('getCookie retrieves value', () => {
    document.cookie = 'foo=bar';
    expect(getCookie('foo')).toBe('bar');
  });
});
