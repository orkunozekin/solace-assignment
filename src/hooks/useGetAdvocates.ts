import useSWR from "swr";
import { AdvocatesInterface } from "@/db/schema";
import { buildOrderParams, Order, toQueryString } from "@/util/tableUtil";

type Props = {
  paginationParameters?: {
    page: number;
    pageSize: number;
  };
  search?: string;
  orderInfo?: Order;
};

interface AdvocatesResponse {
  data: AdvocatesInterface[];
  meta: {
    total: number;
    page: number;
    limit: number;
    search?: string | null;
    sortBy?: string | null;
    sortOrder?: string;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useGetAdvocates = ({
  paginationParameters,
  search,
  orderInfo,
}: Props) => {
  const parameters: Record<string, string> = {};

  if (paginationParameters?.page) {
    parameters["page"] = paginationParameters.page.toString();
    parameters["limit"] = paginationParameters.pageSize.toString();
  }

  // handle order parameters
  const orderParams = buildOrderParams(orderInfo);
  if (orderParams) {
    parameters["sortBy"] = orderParams.order;
    parameters["sortOrder"] = orderParams.sort;
  }

  if (search) {
    parameters["search"] = search;
  }

  // attach search parameters to URL
  const queryString = toQueryString(parameters);
  const url = `/api/advocates?${queryString}`;

  const {
    data,
    isLoading,
    error,
    isValidating,
    mutate: refetchAdvocates,
  } = useSWR<AdvocatesResponse>(url, fetcher);

  return {
    advocates: data?.data ?? [],
    meta: data?.meta ?? { total: 0, page: 1, limit: 10 },
    isLoading,
    error,
    isValidating,
    refetchAdvocates,
  };
};
