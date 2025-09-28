import { ModelOutputParser } from './model-output-parser';
import { IncorrectOutputFormatError } from '../errors/agent-error';

const outputSelectionRegex = /<output>(.*?)<\/output>/s;

export const xmlModelOutputParser: ModelOutputParser = {
  modelInstructions:
    'Based on your current directive and the provided context object representing your current state,' +
    ' choose an action from the above list of actions, format the action according to its documentation,' +
    ' then surround it in the <output> (case-sensitive) XML tag. For example, to invoke an action called "foo"' +
    ' with no arguments your output would look like:\n' +
    "'''\n" +
    '<output>foo()</output>\n' +
    "'''\n" +
    'If you pass arguments to the action, ensure that they are enclosed in "". If your argument values contain ' +
    'quotation marks, escape them with \\". Use \\n to indicate a new line.' +
    'For example: \n' +
    "'''\n" +
    '<output>bar("I am considering the meaning of\\n \\"input\\"")</output>\n' +
    "'''\n" +
    'If you pass structured arguments (such as JSON) to an action, it must be stringified.' +
    'For example, to pass `{"baz": "foo"}`: \n' +
    "'''\n" +
    '<output>bar("{\"baz\": \"foo\"}")</output>\n' +
    "'''\n",
  parse: async (input) => {
    const match = input.match(outputSelectionRegex);
    if (match) {
      return match[1]!.trim();
    }
    throw new IncorrectOutputFormatError(
      'Failed to parse formatted result from <output> XML tag',
    );
  },
};
