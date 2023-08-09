import { CATEGORY_GROUP_CODE } from "./constants";

export type CategoryGroupCode = (typeof CATEGORY_GROUP_CODE)[number];

export type SearchParams = {
  keyword: string;
  category?: CategoryGroupCode;
  sort?: "accuracy" | "distance";
  offset?: number;
};

export type MakeSearchParams = {
  apiKey: string;
  namespace: KVNamespace;
  cacheFirst?: boolean;
};

export type SearchResult = {
  documents: Document[];
  meta: Meta;
};

export type Document = {
  address_name: string;
  category_group_code: string;
  category_group_name: string;
  category_name: string;
  distance: string;
  id: string;
  phone: string;
  place_name: string;
  place_url: string;
  road_address_name: string;
  x: string;
  y: string;
};

export type Meta = {
  is_end: boolean;
  pageable_count: number;
  same_name: SameName;
  total_count: number;
};

export type SameName = {
  keyword: string;
  region: any[];
  selected_region: string;
};

export type ErrorMetadata = {}