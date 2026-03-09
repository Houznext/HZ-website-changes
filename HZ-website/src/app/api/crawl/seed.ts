export default async function seed(indexName: string, maxPages: number) {
    const { Crawler } = await import("./crawler");
    const crawler = new Crawler(maxPages);
    return await crawler.crawl("https://www.onecasa.com/");
}