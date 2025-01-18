import axios from 'axios';
import { HttpGetMarkdownAction } from '../http-get-markdown-action';

jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;

describe('HttpGetMarkdownAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets the content of a web page as markdown', async () => {
    const httpGetAction = new HttpGetMarkdownAction({});
    axiosMock.get.mockResolvedValue({
      data:
        '' +
        '<html><p><ul>' +
        '<li>Item 1</li>' +
        '<li>Item 2</li>' +
        '<li>Item 3</li>' +
        '</ul></p></html>',
    });
    await expect(
      httpGetAction.apply({ url: 'https://example.com' }),
    ).resolves.toBe('*   Item 1\n*   Item 2\n*   Item 3');
    expect(axiosMock.get).toHaveBeenCalledTimes(1);
    expect(axiosMock.get).toHaveBeenCalledWith('https://example.com', {
      responseType: 'text',
    });
  });

  it('throws an error', async () => {
    const httpGetAction = new HttpGetMarkdownAction({});
    axiosMock.get.mockRejectedValue(new Error('Could not find address'));
    await expect(
      httpGetAction.apply({ url: 'https://example.com' }),
    ).resolves.toBe('Error: Could not find address');
    expect(axiosMock.get).toHaveBeenCalledTimes(1);
    expect(axiosMock.get).toHaveBeenCalledWith('https://example.com', {
      responseType: 'text',
    });
  });
});
