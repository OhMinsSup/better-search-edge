import hash from "stable-hash";
import { CATEGORY_GROUP_CODE, MAX_SIZE, UPSTREAM_TIMEOUT } from "./constants";
import type {
  MakeSearchParams,
  SearchParams,
  SearchResult,
} from "./search.types";

export const makeSearch = ({
  namespace,
  cacheFirst,
  apiKey,
}: MakeSearchParams) => {
  async function* search({
    keyword,
    category,
    sort,
    offset = 0,
  }: SearchParams) {
    let page = (offset / MAX_SIZE + 1) | 1;
    let iterCount = offset;
    console.debug("page", page);

    if (!keyword) {
      throw new Error("keyword is required");
    }

    if (/[\%\=\>\<\[\]]/.test(keyword)) {
      throw new Error("keyword must not contain special characters");
    }

    if (category && !CATEGORY_GROUP_CODE.includes(category)) {
      throw new Error("category must be one of CATEGORY_GROUP_CODE");
    }

    if (sort && !["accuracy", "distance"].includes(sort)) {
      throw new Error("sort must be one of 'accuracy' or 'distance'");
    }

    const queryKeys = [keyword] as string[];
    if (category) queryKeys.push(category);

    if (sort) queryKeys.push(sort);

    console.debug(`Start iteration from ${offset}`);
    while (true) {
      let result: SearchResult | null = null;
      const cacheKey = `location:${hash(queryKeys)}:${page}:result`;
      if (cacheFirst) {
        const cache = await namespace.get<any>(cacheKey, {
          type: "json",
        });
        if (cache) {
          console.log(`Cache hit: ${cacheKey}`);
          result = cache;
        }
      } else {
        console.log("Ignore cache");
      }

      console.log("result", result);
      if (!result) {
        const url = new URL(
          "https://dapi.kakao.com/v2/local/search/keyword.json"
        );
        url.searchParams.set("query", keyword);
        if (category) {
          url.searchParams.set("category_group_code", category);
        }
        if (sort) {
          url.searchParams.set("sort", sort);
        }

        url.searchParams.set("size", MAX_SIZE.toString());
        url.searchParams.set("page", page.toString());

        const timeoutController = new AbortController();
        // @ts-ignore
        setTimeout(() => timeoutController.abort(), UPSTREAM_TIMEOUT);

        const headerInit = new Headers();
        headerInit.set("Authorization", `KakaoAK ${apiKey}`);

        console.info("Send request to the API");
        console.debug("URL: %s", url.toString());
        const response = await fetch(url.toString(), {
          method: "GET",
          headers: headerInit,
          signal: timeoutController.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Unexpected error response from upstream, status: ${response.status}, text: ${response.statusText}`
          );
        }

        const body = (await response.json()) as SearchResult;

        await namespace.put(cacheKey, JSON.stringify(body), {
          expirationTtl: 60 * 60 * 24 * 30,
        });

        console.log(`Cache written: ${cacheKey}`);

        result = body;
      }

      const { documents } = result;

      for (const document of documents) {
        iterCount += 1;
        yield document;
        console.debug(`location %i %o`, iterCount, document);
      }

      const totalCount = +result.meta.total_count;
      const maxPage = Math.ceil(totalCount / MAX_SIZE);

      if (iterCount >= totalCount) {
        break;
      }

      if (page++ >= maxPage) {
        break;
      }
    }
    console.debug("End iteration");
  }

  return search;
};
