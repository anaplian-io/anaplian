import { ThinkAction } from '../think-action';

describe('ThinkAction', () => {
  it('echoes the input to the output', async () => {
    const action: ThinkAction = new ThinkAction();
    await expect(
      action.apply({
        thought:
          'I’m very important. I have many leather-bound books and my apartment smells of rich mahogany.',
      }),
    ).resolves.toBe(
      'I’m very important. I have many leather-bound books and my apartment smells of rich mahogany.',
    );
  });
});
