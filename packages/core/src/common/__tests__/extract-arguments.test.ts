import { extractArguments } from '../extract-arguments';
import { Action, ActionArgument } from '../../actions';

describe('extractArguments', () => {
  it('should return an empty array if args is null or undefined', () => {
    expect(extractArguments(undefined)).toEqual([]);
  });

  it('should correctly extract arguments from an object', () => {
    const args = {
      arg1: {
        name: 'arg1',
        description: 'description1',
        exampleValidValues: ['value1'],
      },
      arg2: { name: 'arg2', description: 'description2' },
    };

    const expected: ActionArgument<string>[] = [
      {
        name: 'arg1',
        description: 'description1',
        exampleValidValues: ['value1'],
      },
      { name: 'arg2', description: 'description2' },
    ];

    expect(extractArguments(args)).toEqual(expected);
  });

  it('should handle an object with only one argument', () => {
    const args = {
      arg1: { name: 'arg1', description: 'description1' },
    };

    const expected: ActionArgument<string>[] = [
      { name: 'arg1', description: 'description1' },
    ];

    expect(extractArguments(args)).toEqual(expected);
  });

  it('should handle an object with no description or example values', () => {
    const args: Action<'arg2' | 'arg1'>['arguments'] = {
      arg1: {
        description: 'description1',
        exampleValidValues: ['value1'],
        exampleInvalidValues: ['value0'],
      },
      arg2: {
        description: 'description1',
        exampleValidValues: ['value1'],
        exampleInvalidValues: ['value0'],
      },
    };

    const expected: ActionArgument<'arg2' | 'arg1'>[] = [
      {
        name: 'arg1',
        description: 'description1',
        exampleValidValues: ['value1'],
        exampleInvalidValues: ['value0'],
      },
      {
        name: 'arg2',
        description: 'description1',
        exampleValidValues: ['value1'],
        exampleInvalidValues: ['value0'],
      },
    ];

    expect(extractArguments(args)).toEqual(expected);
  });
});
