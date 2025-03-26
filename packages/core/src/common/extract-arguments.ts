import { Action, ActionArgument } from '../actions';

export const extractArguments = (
  args: Action['arguments'],
): ActionArgument<string>[] =>
  args && !Array.isArray(args)
    ? Object.entries(args).map((entry) => ({
        name: entry[0],
        ...entry[1],
      }))
    : args || [];
