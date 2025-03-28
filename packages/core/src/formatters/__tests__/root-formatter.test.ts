import { Action } from '../../actions';
import { ContextProviderDocumentation } from '../../common/types';
import { RootFormatter } from '../root-formatter';
import { ActionDocumentationFormatter } from '../action-documentation-formatter';
import { ContextProviderDocumentationFormatter } from '../context-provider-documentation-formatter';

describe('RootFormatter', () => {
  const availableActions: Action[] = [
    {
      name: 'nop',
      description: 'Does not do much',
      apply: jest.fn(),
    },
  ];

  const contextProviderDocumentations: ContextProviderDocumentation[] = [
    {
      key: 'date',
      description: 'The current date.',
      fieldDescriptions: {
        calendarDate: 'An ISO date.',
      },
      examples: [
        {
          example: {
            calendarDate: 'Nevebuary 32',
          },
          description: 'This is a dubious date.',
        },
      ],
    },
  ];

  const rootFormatter = new RootFormatter({
    availableActions,
    contextProviderDocumentations,
    actionDocumentationFormatter: new ActionDocumentationFormatter({
      leftPadding: '\t',
    }),
    contextProviderDocumentationFormatter:
      new ContextProviderDocumentationFormatter({
        leftPadding: '\t',
        objectSerializer: JSON.stringify,
      }),
    functionalInstructions: 'Do it. Do it now.',
    roleAssignmentDirective: 'You are a helpful robot in search of love.',
    serializer: JSON.stringify,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('formats a partial (the whole prompt minus the context)', async () => {
    expect.assertions(2);
    const result = await rootFormatter.formatPartial();
    expect(availableActions[0]?.apply).not.toHaveBeenCalled();
    expect(result).toBe(`
Role Assignment Directive - This is Your Objective; Select Actions to Accomplish Your Objective:
You are a helpful robot in search of love.

Available Actions - You MUST Select an Action from This List:

	Action: nop()
		Description: Does not do much

Context Object Components - This is the Information That will be Available to You After Each Action:

	Context Component: date
		Description: The current date.
		Field: calendarDate
			Description: An ISO date.
		Example 0:
			Example Context Component: {"date":{"calendarDate":"Nevebuary 32"}}
			Description: This is a dubious date.

Instructions - This is How You Execute Actions to Serve Your Role Assignment Directive:
Do it. Do it now.
`);
  });

  it('formats a whole prompt', async () => {
    expect.assertions(2);
    const result = await rootFormatter.format({
      date: {
        calendarDate: 'June 9',
      },
    });
    expect(availableActions[0]?.apply).not.toHaveBeenCalled();
    expect(result).toBe(`
Role Assignment Directive - This is Your Objective; Select Actions to Accomplish Your Objective:
You are a helpful robot in search of love.

Available Actions - You MUST Select an Action from This List:

\tAction: nop()
\t\tDescription: Does not do much

Context Object Components - This is the Information That will be Available to You After Each Action:

\tContext Component: date
\t\tDescription: The current date.
\t\tField: calendarDate
\t\t\tDescription: An ISO date.
\t\tExample 0:
\t\t\tExample Context Component: {"date":{"calendarDate":"Nevebuary 32"}}
\t\t\tDescription: This is a dubious date.

Instructions - This is How You Execute Actions to Serve Your Role Assignment Directive:
Do it. Do it now.

Current Context Object:
{"date":{"calendarDate":"June 9"}}`);
  });

  it('serializes a context object', () => {
    expect.assertions(1);
    const serializedContext = rootFormatter.serializeContext({
      key1: {
        item1: 'value',
      },
    });
    expect(serializedContext).toBe(
      '\nCurrent Context Object:\n{"key1":{"item1":"value"}}',
    );
  });
});
