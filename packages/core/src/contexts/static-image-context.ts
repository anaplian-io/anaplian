import { Image } from '../common';
import { ContextProvider } from './context';

export interface StaticImageContextProviderProps {
  /**
   * Array of images to pass to the model.
   */
  readonly images: Image[];
}

/**
 * Includes a set of static and unchanging images in the model context.
 * Note that images are not counted towards the context provider token size
 * since images tokens cannot be counted prior to inference. Please ensure
 * that your agent has token padding large enough to accommodate all images.
 * The default number of padding tokens is 5% of the total context window size.
 */
export class StaticImageContextProvider
  implements ContextProvider<'staticImages'>
{
  constructor(private readonly props: StaticImageContextProviderProps) {}
  public readonly getNextContext: ContextProvider<'staticImages'>['getNextContext'] =
    async (props) => this.getInitialContext(props);
  public readonly getInitialContext: ContextProvider<'staticImages'>['getInitialContext'] =
    async () => ({
      IMAGES: this.props.images,
    });
  public readonly key = 'staticImages';
  public readonly description =
    'Provides static images to the context. These will not change between iterations.';
  public readonly fieldDescriptions: ContextProvider<'staticImages'>['fieldDescriptions'] =
    {};
}
