import axios from 'axios';
import { HttpGetAction } from '../http-get-action';

jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;

describe('HttpGetAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets the content of a web page', async () => {
    const httpGetAction = new HttpGetAction();
    axiosMock.get.mockResolvedValue({ data: 'foo' });
    await expect(
      httpGetAction.apply({ url: 'https://example.com' }),
    ).resolves.toBe('foo');
    expect(axiosMock.get).toHaveBeenCalledTimes(1);
    expect(axiosMock.get).toHaveBeenCalledWith('https://example.com', {
      responseType: 'text',
    });
  });

  it('throws an error', async () => {
    const httpGetAction = new HttpGetAction();
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
