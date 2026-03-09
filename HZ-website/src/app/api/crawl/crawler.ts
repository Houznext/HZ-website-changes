import * as cheerio from "cheerio";
import { NodeHtmlMarkdown } from "node-html-markdown";

interface Page {
  url: string;
  content: string;
}

class Crawler {
  private seen = new Set<string>();
  private pages: Page[] = [];
  private queue: { url: string; depth: number }[] = [];

  constructor(private maxDepth = 2, private maxPages = 1) {}

  async crawl(startUrl: string): Promise<Page[]> {
    console.log("Inside crawl.crawl");

    this.addToQueue(startUrl);

    while (this.shouldContinueCrawling()) {
      const { url, depth } = this.queue.shift()!;

      if (this.isTooDeep(depth) || this.isAlreadySeen(url)) continue;

      this.seen.add(url);

      const html = await this.fetchPage(url);

      this.pages.push({ url, content: this.parseHtml(html) });

      this.addNewUrlsToQueue(this.extractUrls(html, url), depth);
    }

    return this.pages;
  }

  private isTooDeep(depth: number) {
    return depth > this.maxDepth;
  }

  private isAlreadySeen(url: string) {
    return this.seen.has(url);
  }

  private shouldContinueCrawling() {
    return this.queue.length > 0 && this.pages.length < this.maxPages;
  }

  private addToQueue(url: string, depth = 0) {
    this.queue.push({ url, depth });
  }

  private addNewUrlsToQueue(urls: string[], depth: number) {
    this.queue.push(...urls.map((url) => ({ url, depth: depth + 1 })));
  }

  private async fetchPage(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      return await response.text();
    } catch (error) {
      console.error(`Failed to fetch ${url}: ${error}`);
      throw new Error(`Failed to fetch ${url}`);
    }
  }

  private parseHtml(html: string): string {
    const $ = cheerio.load(html);
    $("a").removeAttr("href");
    return NodeHtmlMarkdown.translate($.html());
  }

  private extractUrls(html: string, baseUrl: string): string[] {
    const $ = cheerio.load(html);
    const relativeUrls = $("a")
      .map((_, link) => $(link).attr("href"))
      .get() as string[];
    return relativeUrls.map(
      (relativeUrl) => new URL(relativeUrl, baseUrl).href
    );
  }
}

export { Crawler };
export type { Page };
