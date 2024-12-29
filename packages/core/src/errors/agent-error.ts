import { AnaplianBaseError } from './anaplian-base-error';

export class AgentError extends AnaplianBaseError {}
export class NoSuchActionError extends AgentError {}
export class InvalidSyntaxError extends AgentError {}
export class IncorrectActionUsageError extends AgentError {}
