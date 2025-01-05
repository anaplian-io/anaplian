import { Action, InvalidArgumentError } from '../../actions';
import { ActionExecutor } from '../action-executor';
import {
  IncorrectActionUsageError,
  InvalidSyntaxError,
  NoSuchActionError,
} from '../../errors/agent-error';

describe('ActionExecutor', () => {
  it('successfully executes a command with no arguments', async () => {
    expect.assertions(2);
    const availableActions: Action[] = [
      {
        name: 'nop',
        description: 'Does nothing. Has no arguments.',
        apply: jest.fn().mockResolvedValue('return value'),
      },
    ];
    const executor = new ActionExecutor({
      availableActions,
    });
    const result = await executor.execute('nop()');
    expect(result).toBe('return value');
    expect(availableActions[0]!.apply).toHaveBeenCalledWith({});
  });

  it('successfully executes a command with two arguments', async () => {
    expect.assertions(2);
    const availableActions: Action[] = [
      {
        name: 'echo',
        description: 'Returns its arguments as a list',
        apply: jest
          .fn()
          .mockImplementation((input) =>
            Promise.resolve(Object.values(input).join(';')),
          ),
        arguments: [
          {
            name: 'arg1',
            description: 'foo',
          },
          {
            name: 'arg2',
            description: 'bar',
          },
        ],
      },
    ];
    const executor = new ActionExecutor({
      availableActions,
    });
    const result = await executor.execute(
      'echo("\\"Mistake Not...\\"","...my vast oceans of wrath\\n\\n")',
    );
    expect(result).toBe('"Mistake Not...";...my vast oceans of wrath\n\n');
    expect(availableActions[0]!.apply).toHaveBeenCalledWith({
      arg1: '"Mistake Not..."',
      arg2: '...my vast oceans of wrath\n\n',
    });
  });

  it('throws InvalidSyntaxError', async () => {
    expect.assertions(2);
    const availableActions: Action[] = [
      {
        name: 'echo',
        description: 'Returns its arguments as a list',
        apply: jest.fn(),
        arguments: [
          {
            name: 'arg1',
            description: 'foo',
          },
          {
            name: 'arg2',
            description: 'bar',
          },
        ],
      },
    ];
    const executor = new ActionExecutor({
      availableActions,
    });
    await expect(executor.execute('echo ("foo","bar")')).rejects.toThrow(
      InvalidSyntaxError,
    );
    expect(availableActions[0]!.apply).not.toHaveBeenCalled();
  });

  it('throws NoSuchActionError', async () => {
    expect.assertions(2);
    const availableActions: Action[] = [
      {
        name: 'echo',
        description: 'Returns its arguments as a list',
        apply: jest.fn(),
        arguments: [
          {
            name: 'arg1',
            description: 'foo',
          },
          {
            name: 'arg2',
            description: 'bar',
          },
        ],
      },
    ];
    const executor = new ActionExecutor({
      availableActions,
    });
    await expect(executor.execute('nop("foo","bar")')).rejects.toThrow(
      NoSuchActionError,
    );
    expect(availableActions[0]!.apply).not.toHaveBeenCalled();
  });

  it('throws IncorrectActionUsageError when no arguments provided', async () => {
    expect.assertions(2);
    const availableActions: Action[] = [
      {
        name: 'echo',
        description: 'Returns its arguments as a list',
        apply: jest.fn(),
        arguments: [
          {
            name: 'arg1',
            description: 'foo',
          },
          {
            name: 'arg2',
            description: 'bar',
          },
        ],
      },
    ];
    const executor = new ActionExecutor({
      availableActions,
    });
    await expect(executor.execute('echo()')).rejects.toThrow(
      IncorrectActionUsageError,
    );
    expect(availableActions[0]!.apply).not.toHaveBeenCalled();
  });

  it('throws IncorrectActionUsageError when too many arguments provided', async () => {
    expect.assertions(2);
    const availableActions: Action[] = [
      {
        name: 'nop',
        description: 'Does nothing.',
        apply: jest.fn(),
      },
    ];
    const executor = new ActionExecutor({
      availableActions,
    });
    await expect(executor.execute('nop("foo")')).rejects.toThrow(
      IncorrectActionUsageError,
    );
    expect(availableActions[0]!.apply).not.toHaveBeenCalled();
  });

  it('propagates InvalidArgumentError when thrown by the action', async () => {
    expect.assertions(2);
    const availableActions: Action[] = [
      {
        name: 'echo',
        description: 'Returns its arguments as a list',
        apply: jest.fn().mockRejectedValue(
          new InvalidArgumentError({
            name: 'arg1',
            description: 'foo',
          }),
        ),
        arguments: [
          {
            name: 'first',
            description: 'foo',
          },
          {
            name: 'second',
            description: 'bar',
          },
        ],
      },
    ];
    const executor = new ActionExecutor({
      availableActions,
    });
    await expect(executor.execute('echo("foo","bar")')).rejects.toThrow(
      InvalidArgumentError,
    );
    expect(availableActions[0]!.apply).toHaveBeenCalledWith({
      first: 'foo',
      second: 'bar',
    });
  });
});
