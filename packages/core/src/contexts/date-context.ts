import { ContextProvider } from './context';

/** @see {isDateContext} ts-auto-guard:type-guard */
export type DateContext = {
  readonly isoDate: string;
  readonly epochTimeMilliseconds: number;
};

/**
 * Provides the current date to the agent. Dates are given as UTC ISO dates and epoch times in milliseconds.
 */
export class DateContextProvider
  implements ContextProvider<'date', DateContext>
{
  public readonly getNextContext = async (): Promise<DateContext> =>
    this.getInitialContext();
  public readonly getInitialContext = async (): Promise<DateContext> => {
    const date = new Date();
    return {
      isoDate: date.toISOString(),
      epochTimeMilliseconds: date.getTime(),
    };
  };
  public readonly key = 'date';
  public readonly description = 'Gives the current date. Use this as your reference for the current time. This always uses the UTC time zone.';
  public readonly fieldDescriptions = {
    isoDate: 'The current date in ISO format.',
    epochTimeMilliseconds: 'The current epoch time in milliseconds since January 1, 1970 UTC.',
  };
  public readonly examples = [
    {
      example: {
        isoDate: '2024-06-09T20:58:46.000Z',
        epochTimeMilliseconds: 1717966726000,
      },
      description: 'A date representing June 9, 2024.',
    },
  ];
}
