import { NopAction } from '../nop-action';

describe('NopAction', () => {
  it('does not do anything', async () => {
    await expect(new NopAction().apply()).resolves.toBe('No action was taken.');
  });
});
