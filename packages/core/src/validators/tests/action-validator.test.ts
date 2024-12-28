import { Validator } from '../validator';
import { Action } from '../../actions';
import { ActionValidator } from '../action-validator';

describe('ActionValidator', () => {
  it('validates successfully when there are no examples', async () => {
    expect.assertions(2);
    const validator: Validator<Action> = new ActionValidator();
    const action: Action = {
      name: 'mock',
      apply: jest.fn(),
      arguments: [
        {
          name: 'arg1',
          description: 'bar',
        },
      ],
      description: 'baz',
    };
    const result = await validator.validate(action);
    expect(result.valid).toBeTruthy();
    expect(action.apply).not.toHaveBeenCalled();
  });

  it('validates successfully when there are correct examples', async () => {
    expect.assertions(2);
    const validator: Validator<Action> = new ActionValidator();
    const action: Action = {
      name: 'mock',
      apply: jest.fn(),
      arguments: [
        {
          name: 'arg1',
          description: 'bar',
        },
      ],
      examples: [
        {
          arguments: ['arg1 value'],
          result: 'this is a result',
        },
        {
          arguments: ['arg1 value 2'],
          result: 'this is another result',
        },
        {
          arguments: ['arg1 value 3'],
          result: 'this is a third result',
        },
      ],
      description: 'baz',
    };
    const result = await validator.validate(action);
    expect(result.valid).toBeTruthy();
    expect(action.apply).not.toHaveBeenCalled();
  });

  it('validates unsuccessfully when there is an incorrect example', async () => {
    expect.assertions(3);
    const validator: Validator<Action> = new ActionValidator();
    const action: Action = {
      name: 'mock',
      apply: jest.fn(),
      arguments: [
        {
          name: 'arg1',
          description: 'bar',
        },
      ],
      examples: [
        {
          arguments: ['arg1 value'],
          result: 'this is a result',
        },
        {
          arguments: ['arg1 value 2', 'arg2 value 1'],
          result: 'this is another result',
        },
        {
          arguments: ['arg1 value 3'],
          result: 'this is a third result',
        },
      ],
      description: 'baz',
    };
    const result = await validator.validate(action);
    expect(result.valid).toBeFalsy();
    if (!result.valid) {
      expect(result.reason).toBe(
        'Found an example with 2 argument(s) but 1 expected.',
      );
    }
    expect(action.apply).not.toHaveBeenCalled();
  });

  it('validates successfully when there are no arguments', async () => {
    expect.assertions(2);
    const validator: Validator<Action> = new ActionValidator();
    const action: Action = {
      name: 'mock',
      apply: jest.fn(),
      examples: [
        {
          result: 'this is a result',
        },
        {
          result: 'this is another result',
        },
        {
          result: 'this is a third result',
        },
      ],
      description: 'baz',
    };
    const result = await validator.validate(action);
    expect(result.valid).toBeTruthy();
    expect(action.apply).not.toHaveBeenCalled();
  });

  it('validates unsuccessfully when there is an incorrect example and no arguments', async () => {
    expect.assertions(3);
    const validator: Validator<Action> = new ActionValidator();
    const action: Action = {
      name: 'mock',
      apply: jest.fn(),
      examples: [
        {
          result: 'this is a result',
        },
        {
          result: 'this is another result',
        },
        {
          arguments: ['arg1 value 3'],
          result: 'this is a third result',
        },
      ],
      description: 'baz',
    };
    const result = await validator.validate(action);
    expect(result.valid).toBeFalsy();
    if (!result.valid) {
      expect(result.reason).toBe(
        'Found an example with 1 argument(s) but 0 expected.',
      );
    }
    expect(action.apply).not.toHaveBeenCalled();
  });
});
