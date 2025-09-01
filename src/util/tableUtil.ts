import { Key, SortOrder } from "antd/lib/table/interface";

export type Order = {
  order: undefined | SortOrder;
  columnKey: undefined | Key;
};

/**
 * Transform ant.design table sorting parameters into request query parameters.
 * @param order Order object to use to build parameters
 * @returns Order query parameters in an object
 */
export const buildOrderParams = (order?: Order) => {
  if (!order) return null;
  if (order?.columnKey) {
    const label = order.columnKey.toString();
    const direction = order.order === "ascend" ? "asc" : "desc";
    return { order: label, sort: direction };
  }
};

/**
 * Provide the SortOrder value for populating defaultSortOrder.
 * @param columnKeyName string value that matches the column's columnKey value
 * @returns SortOrder or undefined depending on whether the specified column is
 *  actively being sorted.
 */
export const sortState = (
  orderInfo: Order | undefined,
  columnKeyName: string
) => {
  return orderInfo?.columnKey?.toString() === columnKeyName
    ? orderInfo.order
    : undefined;
};

/**
 * Build a string containing the given query parameters.
 * @param parameters Record containing the query parameter keys and values.
 * @returns string with the query parameters from the Record.
 */
export function toQueryString(parameters: Record<string, string>): string {
  return Object.entries(parameters)
    .map((kv) => kv.map(encodeURIComponent).join("="))
    .join("&");
}
