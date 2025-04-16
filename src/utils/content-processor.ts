/**
 * Utility for processing XML and HTML content for safe storage
 */
export class ContentProcessor {
  /**
   * Encode XML or HTML content to Base64 for safe storage
   * @param content Raw XML or HTML content
   * @returns Base64 encoded string or undefined if input is undefined
   */
  public static encodeContent(content: string | undefined): string | undefined {
    if (!content) return undefined;
    return Buffer.from(content).toString('base64');
  }

  /**
   * Decode Base64-encoded XML or HTML content
   * @param encodedContent Base64 encoded string
   * @returns Original XML or HTML content or undefined if input is undefined
   */
  public static decodeContent(encodedContent: string | undefined): string | undefined {
    if (!encodedContent) return undefined;
    return Buffer.from(encodedContent, 'base64').toString();
  }

  /**
   * Process an array of content items, encoding each non-empty item
   * @param items Array of content items
   * @returns Array of encoded content items
   */
  public static encodeArray(items: string[] | undefined): string[] | undefined {
    if (!items) return undefined;
    return items.map(item => item ? this.encodeContent(item) : undefined).filter(Boolean) as string[];
  }
}
