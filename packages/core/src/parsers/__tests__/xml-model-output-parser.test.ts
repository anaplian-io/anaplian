import { ModelOutputParser } from '../model-output-parser';
import { XmlModelOutputParser } from '../xml-model-output-parser';
import { IncorrectOutputFormatError } from '../../errors/agent-error';

describe('XmlModelOutputParser', () => {
  it.each([
    [
      'Certainly! Here is the output: <output>test</output> Does that look correct?',
      'test',
    ],
    ['<output>123</output>', '123'],
    ['<output>hello world</output>', 'hello world'],
    ['<output>\nmultiline\n</output>', 'multiline'],
    ['<output><output>Inner text</output></output>', 'Inner text'],
    ['<output>nop()</output>', 'nop()'],
    ['<output>echo("1234","56\n78")</output>', 'echo("1234","56\n78")'],
  ])(
    'successfully extracts an action from the model output "%s"',
    async (input, expected) => {
      const modelOutputParser: ModelOutputParser = XmlModelOutputParser;
      expect(XmlModelOutputParser.modelInstructions).toBeTruthy();
      expect(await modelOutputParser.parse(input)).toBe(expected);
    },
  );

  it.each([
    '<output>Some text</outpt>',
    '<output />',
    '<output id="example">Some text</output>',
    '<OUTPUT>Some text</OUTPUT>',
    '<output>Some text',
  ])(
    'throws an error if an improperly formatted output was generated "%s"',
    async (input) => {
      const modelOutputParser: ModelOutputParser = XmlModelOutputParser;
      expect(XmlModelOutputParser.modelInstructions).toBeTruthy();
      await expect(modelOutputParser.parse(input)).rejects.toThrow(
        IncorrectOutputFormatError,
      );
    },
  );
});
