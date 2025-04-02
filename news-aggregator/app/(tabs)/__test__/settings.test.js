import { toggleBoolean, handleClearCache } from '../settingsFn';

describe('Settings Utilities', () => {
  test('toggleBoolean should invert boolean value', () => {
    expect(toggleBoolean(true)).toBe(false);
    expect(toggleBoolean(false)).toBe(true);
  });

});
