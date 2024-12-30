import { ContextProvider } from '../../contexts';
import { ContextProviderDocumentationFormatter } from '../context-provider-documentation-formatter';

describe('ContextProviderDocumentationFormatter', () => {
  it('formats context documentation with examples', async () => {
    expect.assertions(3);
    const formatter = new ContextProviderDocumentationFormatter({
      leftPadding: '\t',
      objectSerializer: JSON.stringify,
    });
    const contextProvider: ContextProvider<
      'foo',
      {
        readonly firstField: string;
        readonly secondField: string;
      }
    > = {
      description: 'This is a really swell piece of context.',
      examples: [
        {
          example: {
            firstField: 'bar',
            secondField: 'baz',
          },
          description: 'A typical example of this context partial.',
        },
      ],
      fieldDescriptions: {
        firstField:
          'This is the first field provided with the context partial.',
        secondField:
          'This is the second field provided with the context partial.',
      },
      getInitialContext: jest.fn(),
      getNextContext: jest.fn(),
      key: 'foo',
    };
    const prompt = await formatter.format(contextProvider);
    expect(contextProvider.getNextContext).not.toHaveBeenCalled();
    expect(contextProvider.getInitialContext).not.toHaveBeenCalled();
    expect(prompt).toBe(`
	Context Component: foo
		Description: This is a really swell piece of context.
		Field: firstField
			Description: This is the first field provided with the context partial.
		Field: secondField
			Description: This is the second field provided with the context partial.
		Example 0:
			Example Context Component: {"foo":{"firstField":"bar","secondField":"baz"}}
			Description: A typical example of this context partial.`);
  });

  it('formats context documentation with no examples', async () => {
    expect.assertions(3);
    const formatter = new ContextProviderDocumentationFormatter({
      leftPadding: '\t',
      objectSerializer: JSON.stringify,
    });
    const contextProvider: ContextProvider<
      'foo',
      {
        readonly firstField: string;
        readonly secondField: string;
      }
    > = {
      description: 'This is a really swell piece of context.',
      fieldDescriptions: {
        firstField:
          'This is the first field provided with the context partial.',
        secondField:
          'This is the second field provided with the context partial.',
      },
      getInitialContext: jest.fn(),
      getNextContext: jest.fn(),
      key: 'foo',
    };
    const prompt = await formatter.format(contextProvider);
    expect(contextProvider.getNextContext).not.toHaveBeenCalled();
    expect(contextProvider.getInitialContext).not.toHaveBeenCalled();
    expect(prompt).toBe(`
	Context Component: foo
		Description: This is a really swell piece of context.
		Field: firstField
			Description: This is the first field provided with the context partial.
		Field: secondField
			Description: This is the second field provided with the context partial.`);
  });
});
