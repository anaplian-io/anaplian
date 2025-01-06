import { AgentBuilder } from '../agents';
import { FakeLLM } from '@langchain/core/utils/testing';
import { NopAction, ThinkAction } from '../actions';
import {
  DateContextProvider,
  HistoryContextProvider,
  isHistoryContext,
} from '../contexts';
import { Context } from '../common';

describe('@anaplian/core', () => {
  const yieldToEventLoop = async () => {
    await new Promise((accept) => setImmediate(accept));
  };

  it('builds, runs, and shuts down an agent', async () => {
    expect.assertions(7);
    let finalContext: Context | undefined;
    const onFatal = jest.fn(() => Promise.resolve());
    const onStartIteration = jest.fn(() => Promise.resolve());
    const onEndIteration = jest.fn(() => Promise.resolve());
    const onShutdown = jest.fn((context) => {
      finalContext = context;
      return Promise.resolve();
    });
    const onInitialize = jest.fn(() => Promise.resolve());
    const fakeLlm = new FakeLLM({
      response:
        '<output>think("This is a thing that I have thought about")</output>',
    });
    const invokeSpy = jest.spyOn(fakeLlm, 'invoke');
    const agent = await new AgentBuilder({
      modelName: 'gpt-4o-mini',
      model: fakeLlm,
      roleAssignmentDirective: 'You are an agent. You do agent things.',
    })
      .addAction(new NopAction())
      .addAction(new ThinkAction())
      .addContextProvider(new DateContextProvider(), 0.5)
      .addContextProvider(new HistoryContextProvider({}), 99.5)
      .setOn('afterInitialize', onInitialize)
      .setOn('beforeIterationStart', onStartIteration)
      .setOn('afterIterationEnd', onEndIteration)
      .setOn('beforeShutdown', onShutdown)
      .setOn('fatalError', onFatal)
      .build();
    const runPromise = agent.run();
    await yieldToEventLoop();
    await agent.shutdown();
    await runPromise;
    expect(onFatal).not.toHaveBeenCalled();
    expect(onStartIteration).toHaveBeenCalledTimes(1);
    expect(onEndIteration).toHaveBeenCalledTimes(1);
    expect(onShutdown).toHaveBeenCalledTimes(1);
    expect(onInitialize).toHaveBeenCalledTimes(1);
    expect(invokeSpy).toHaveBeenCalledTimes(1);
    if (finalContext && isHistoryContext(finalContext.history)) {
      expect(finalContext.history.records[0]).toStrictEqual(
        expect.objectContaining({
          actionTaken: 'think("This is a thing that I have thought about")',
          result: 'This is a thing that I have thought about',
        }),
      );
    }
  });
});
