import { Formatter } from '../formatter';
import { Action } from '../../actions';
import { ActionDocumentationFormatter } from '../action-documentation-formatter';

describe('ActionDocumentationFormatter', () => {
  it('formats a NOP', async () => {
    const formatter: Formatter<Action> = new ActionDocumentationFormatter({
      leftPadding: '\t',
    });
    const action: Action = {
      apply: jest.fn(),
      description:
        'Does nothing. Use this when there is nothing to be done and you would like to wait a turn.',
      name: 'nop',
      examples: [
        {
          result: 'NOP',
        },
      ],
    };
    const prompt = await formatter.format(action);
    expect(prompt).toBe(`
	Action: nop()
		Description: Does nothing. Use this when there is nothing to be done and you would like to wait a turn.

		Example 0:
			YOU: nop()
			RESULT: NOP`);
  });

  it('formats a NOP with no examples', async () => {
    const formatter: Formatter<Action> = new ActionDocumentationFormatter({
      leftPadding: '\t',
    });
    const action: Action = {
      apply: jest.fn(),
      description:
        'Does nothing. Use this when there is nothing to be done and you would like to wait a turn.',
      name: 'nop',
    };
    const prompt = await formatter.format(action);
    expect(prompt).toBe(`
	Action: nop()
		Description: Does nothing. Use this when there is nothing to be done and you would like to wait a turn.`);
  });

  it('formats a search with several examples', async () => {
    const formatter = new ActionDocumentationFormatter({
      leftPadding: '\t',
    });
    const action: Action<'query'> = {
      apply: jest.fn(),
      description: 'Searches the internet with a given input.',
      name: 'search',
      arguments: [
        {
          name: 'query',
          description: 'The query that will be used to search the internet.',
        },
      ],
      examples: [
        {
          arguments: ['the culture series author'],
          result: 'Iain Banks',
        },
        {
          arguments: ['sister of Dipper Pines'],
          result: 'Mabel Pines',
        },
      ],
    };
    const prompt = await formatter.format(action);
    expect(prompt).toBe(`
	Action: search(query)
		Description: Searches the internet with a given input.
		Argument 0: query - The query that will be used to search the internet.
		Example 0:
			YOU: search("the culture series author")
			RESULT: Iain Banks
		Example 1:
			YOU: search("sister of Dipper Pines")
			RESULT: Mabel Pines`);
  });

  it('formats an addition operation with several examples', async () => {
    const formatter = new ActionDocumentationFormatter({
      leftPadding: '\t',
    });
    const action: Action<'a' | 'b'> = {
      apply: jest.fn(),
      description: 'Adds two numbers together.',
      name: 'add',
      arguments: [
        {
          name: 'a',
          description: 'The first number. Must be a valid base 10 number.',
          exampleInvalidValues: ['a24bcd', 'stuff', '#4', '2e22'],
          exampleValidValues: ['-5', '1', '0.24', '9102'],
        },
        {
          name: 'b',
          description: 'The second number. Must be a valid base 10 number.',
          exampleInvalidValues: ['a24bcd', 'stuff', '#4', '2e22'],
          exampleValidValues: ['-5', '1', '0.24', '9102'],
        },
      ],
      examples: [
        {
          arguments: ['2', '5'],
          result: '7',
        },
        {
          arguments: ['-5.5', '5.5'],
          result: '0',
        },
      ],
    };
    const prompt = await formatter.format(action);
    expect(prompt).toBe(`
	Action: add(a,b)
		Description: Adds two numbers together.
		Argument 0: a - The first number. Must be a valid base 10 number.
			Example valid values: "-5", "1", "0.24", "9102"
			Example invalid values: "a24bcd", "stuff", "#4", "2e22"
		Argument 1: b - The second number. Must be a valid base 10 number.
			Example valid values: "-5", "1", "0.24", "9102"
			Example invalid values: "a24bcd", "stuff", "#4", "2e22"
		Example 0:
			YOU: add("2","5")
			RESULT: 7
		Example 1:
			YOU: add("-5.5","5.5")
			RESULT: 0`);
  });

  it('formats an addition operation with several examples using updated argument definitions', async () => {
    const formatter = new ActionDocumentationFormatter({
      leftPadding: '\t',
    });
    const action: Action<'a' | 'b'> = {
      apply: jest.fn(),
      description: 'Adds two numbers together.',
      name: 'add',
      arguments: {
        a: {
          description: 'The first number. Must be a valid base 10 number.',
          exampleInvalidValues: ['a24bcd', 'stuff', '#4', '2e22'],
          exampleValidValues: ['-5', '1', '0.24', '9102'],
        },
        b: {
          description: 'The second number. Must be a valid base 10 number.',
          exampleInvalidValues: ['a24bcd', 'stuff', '#4', '2e22'],
          exampleValidValues: ['-5', '1', '0.24', '9102'],
        },
      },
      examples: [
        {
          arguments: ['2', '5'],
          result: '7',
        },
        {
          arguments: ['-5.5', '5.5'],
          result: '0',
        },
      ],
    };
    const prompt = await formatter.format(action);
    expect(prompt).toBe(`
	Action: add(a,b)
		Description: Adds two numbers together.
		Argument 0: a - The first number. Must be a valid base 10 number.
			Example valid values: "-5", "1", "0.24", "9102"
			Example invalid values: "a24bcd", "stuff", "#4", "2e22"
		Argument 1: b - The second number. Must be a valid base 10 number.
			Example valid values: "-5", "1", "0.24", "9102"
			Example invalid values: "a24bcd", "stuff", "#4", "2e22"
		Example 0:
			YOU: add("2","5")
			RESULT: 7
		Example 1:
			YOU: add("-5.5","5.5")
			RESULT: 0`);
  });

  it('formats a think operation that includes multiline and double quotes', async () => {
    const formatter = new ActionDocumentationFormatter({
      leftPadding: '\t',
    });

    const action: Action<'firstArgument'> = {
      apply: jest.fn(),
      description: 'Echoes a thought.',
      name: 'think',
      arguments: {
        firstArgument: {
          description: 'The thought to be thunk.',
          exampleValidValues: [
            'this is an argument \n with newlines and " double quotes',
          ],
          exampleInvalidValues: [
            'this is an argument \n with newlines and " double quotes',
          ],
        },
      },
      examples: [
        {
          arguments: ['2'],
          result: '7',
        },
        {
          arguments: ['5.5'],
          result: '0',
        },
      ],
    };
    const prompt = await formatter.format(action);
    expect(prompt).toBe(`
\tAction: think(firstArgument)
\t\tDescription: Echoes a thought.
\t\tArgument 0: firstArgument - The thought to be thunk.
\t\t\tExample valid values: "this is an argument \\n with newlines and \\" double quotes"
\t\t\tExample invalid values: "this is an argument \\n with newlines and \\" double quotes"
\t\tExample 0:
\t\t\tYOU: think("2")
\t\t\tRESULT: 7
\t\tExample 1:
\t\t\tYOU: think("5.5")
\t\t\tRESULT: 0`);
  });
});
