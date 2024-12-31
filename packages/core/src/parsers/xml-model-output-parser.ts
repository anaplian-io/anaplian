import { ModelOutputParser } from './model-output-parser';
import { IncorrectOutputFormatError } from '../errors/agent-error';

const outputSelectionRegex = /<output>([^<]*)<\/output>/;

export const XmlModelOutputParser: ModelOutputParser = {
  modelInstructions:
    'Based on your current directive and the provided context object representing your current state,' +
    ' choose an action from the above list of actions, format the action according to its documentation,' +
    ' then surround it in the <output> (case sensitive) XML tag. For example, your output may look like:\n' +
    "'''\n" +
    '<output>nop()</output>\n' +
    "'''\n" +
    'This example would invoke the "nop" action with no arguments.',
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
