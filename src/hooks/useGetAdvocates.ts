import useSWR from "swr";
import { AdvocatesInterface } from "../db/schema";

type Props = {
  search?: string;
  paginationParameters: {
    page: number;
    pageSize: number;
  };
};

interface AdvocatesResponse {
  data: AdvocatesInterface[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Fetches advocates with pagination and search support
export const useGetAdvocates = ({ search, paginationParameters }: Props) => {
  const parameters: Record<string, string> = {};

  if (paginationParameters.page) {
    parameters["page"] = paginationParameters.page.toString();
    parameters["limit"] = paginationParameters.pageSize.toString();
  }

  if (search) {
    parameters["search"] = search;
  }

  const queryString = new URLSearchParams(parameters).toString();
  const url = `/api/advocates${queryString ? `?${queryString}` : ""}`;

  const {
    data,
    isLoading: loading,
    error,
    isValidating,
    mutate: refetchAdvocates,
  } = useSWR<AdvocatesResponse>(url, fetcher);

  return {
    advocates: data?.data ?? [],
    meta: data?.meta ?? { total: 0, page: 1, limit: 10 },
    loading,
    isValidating,
    error,
    refetchAdvocates,
  };
};
