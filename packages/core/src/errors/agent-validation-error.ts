import { AnaplianBaseError } from './anaplian-base-error';

export class AgentValidationError extends AnaplianBaseError {}
export class InvalidAgentParametersError extends AgentValidationError {}
export class InvalidActionError extends AgentValidationError {}
