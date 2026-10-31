import { describe, expect, it } from 'vitest';
import { esc, hostOf } from './util';

describe('esc', () => {
  it('escapes & < > " and \'', () => {
    expect(esc(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
    expect(esc('<a href="x">T&C\'s</a>')).toBe('&lt;a href=&quot;x&quot;&gt;T&amp;C&#39;s&lt;/a&gt;');
  });
  it('leaves other text alone', () => {
    expect(esc('plain text 123 / é')).toBe('plain text 123 / é');
    expect(esc('')).toBe('');
  });
});

describe('hostOf', () => {
  it('returns the host for valid URLs, with port', () => {
    expect(hostOf('https://trading.nish.software/x/y?z=1')).toBe('trading.nish.software');
    expect(hostOf('http://localhost:5173/path')).toBe('localhost:5173');
  });
  it('returns the input for invalid URLs', () => {
    expect(hostOf('not a url')).toBe('not a url');
    expect(hostOf('/relative')).toBe('/relative');
  });
});
