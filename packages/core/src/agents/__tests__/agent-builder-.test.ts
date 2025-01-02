import { AgentBuilder } from '../agent-builder';
import { FakeChatModel } from '@langchain/core/utils/testing';
import { InvalidAgentParametersError } from '../../errors/agent-validation-error';

describe('AgentBuilder', () => {
  it('throws an InvalidAgentParametersError', async () => {
    const builder = new AgentBuilder({
      model: new FakeChatModel({}),
      roleAssignmentDirective: 'You are an agent. You do agent things',
    });
    await expect(builder.build()).resolves.toThrow(InvalidAgentParametersError);
  });
});
