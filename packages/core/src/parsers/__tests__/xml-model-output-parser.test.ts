import { ModelOutputParser } from '../model-output-parser';
import { xmlModelOutputParser } from '../xml-model-output-parser';
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
    ['<output>nop()</output>', 'nop()'],
    ['<output>echo("1234","56\n78")</output>', 'echo("1234","56\n78")'],
    [
      '<output>render_svg("<svg width=\\"100\\" height=\\"150\\" xmlns=\\"http://www.w3.org/2000/svg\\"><ellipse cx=\\"50\\" cy=\\"75\\" rx=\\"40\\" ry=\\"60\\" fill=\\"#ADD8E6\\"/></svg>")</output>',
      'render_svg("<svg width=\\"100\\" height=\\"150\\" xmlns=\\"http://www.w3.org/2000/svg\\"><ellipse cx=\\"50\\" cy=\\"75\\" rx=\\"40\\" ry=\\"60\\" fill=\\"#ADD8E6\\"/></svg>")',
    ],
  ])(
    'successfully extracts an action from the model output "%s"',
    async (input, expected) => {
      const modelOutputParser: ModelOutputParser = xmlModelOutputParser;
      expect(xmlModelOutputParser.modelInstructions).toBeTruthy();
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
      const modelOutputParser: ModelOutputParser = xmlModelOutputParser;
      expect(xmlModelOutputParser.modelInstructions).toBeTruthy();
      await expect(modelOutputParser.parse(input)).rejects.toThrow(
        IncorrectOutputFormatError,
      );
    },
  );
});
