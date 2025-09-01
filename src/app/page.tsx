"use client";

import { useState, useMemo, useCallback } from "react";
import { Table, Pagination, Tag } from "antd";
import Search from "antd/lib/input/Search";
import { useGetAdvocates } from "@/hooks/useGetAdvocates";
import { AdvocatesInterface } from "@/db/schema";

const { Column } = Table;

export default function Home() {
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { advocates, meta, loading, error } = useGetAdvocates({
    search: searchText,
    paginationParameters: {
      page: currentPage,
      pageSize: pageSize,
    },
  });

  const handleSearch = useCallback((searchTerm: string) => {
    setSearchText(searchTerm);
    //let's reset to first page after searching
    setCurrentPage(1);
  }, []);

  const debouncedSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (searchTerm: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleSearch(searchTerm);
      }, 500);
    };
  }, [handleSearch]);

  const handlePagination = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  // Add unique keys to data source to prevent the unique key warning
  const dataSource = advocates.map((advocate: AdvocatesInterface) => ({
    ...advocate,
    key: advocate.id,
  }));

  if (error) {
    return (
      <main style={{ margin: "24px" }}>
        <h1>Error loading advocates</h1>
        <p>Please try again later.</p>
      </main>
    );
  }

  function getFormattedPhoneNumber() {
    return (phoneNumber: string) => {
      // Format phone number for display
      const formatted = phoneNumber?.toString();
      if (formatted && formatted.length === 10) {
        return `(${formatted.slice(0, 3)}) ${formatted.slice(
          3,
          6
        )}-${formatted.slice(6)}`;
      }
      return formatted;
    };
  }

  return (
    <main className="m-6">
      <h1 className="mb-6">Solace Advocates</h1>

      <div className="mb-6">
        {searchText && (
          <p className="mb-4 text-gray-600">
            Searching for: <strong>{searchText}</strong>
          </p>
        )}

        <Search
          placeholder="Search by name, city, degree, specialties, or experience..."
          allowClear
          style={{ width: 400 }}
          onChange={(e) => debouncedSearch(e.target.value)}
          onSearch={debouncedSearch}
        />
      </div>

      <Table
        dataSource={dataSource}
        loading={loading}
        pagination={false}
        scroll={{ x: 800 }}
        style={{
          border: "1px solid #f0f0f0",
          borderRadius: "8px",
          backgroundColor: "white",
        }}
      >
        <Column
          title="First Name"
          dataIndex="firstName"
          key="firstName"
          sorter={(a, b) => a.firstName.localeCompare(b.firstName)}
        />

        <Column
          title="Last Name"
          dataIndex="lastName"
          key="lastName"
          sorter={(a, b) => a.lastName.localeCompare(b.lastName)}
        />

        <Column
          title="City"
          dataIndex="city"
          key="city"
          sorter={(a, b) => a.city.localeCompare(b.city)}
        />

        <Column
          title="Degree"
          dataIndex="degree"
          key="degree"
          sorter={(a, b) => a.degree.localeCompare(b.degree)}
        />

        <Column
          title="Specialties"
          dataIndex="specialties"
          key="specialties"
          render={(specialties) => (
            <div className="flex flex-col gap-1">
              {specialties?.map((specialty: string, index: number) => (
                <Tag key={index} color="blue" className="w-fit">
                  {specialty}
                </Tag>
              ))}
            </div>
          )}
        />

        <Column
          title="Years of Experience"
          dataIndex="yearsOfExperience"
          key="yearsOfExperience"
          sorter={(a, b) => a.yearsOfExperience - b.yearsOfExperience}
          align="center"
        />

        <Column
          title="Phone Number"
          dataIndex="phoneNumber"
          key="phoneNumber"
          render={getFormattedPhoneNumber()}
        />
      </Table>

      {meta.total > 0 && (
        <Pagination
          className="mt-6"
          current={currentPage}
          pageSize={pageSize}
          total={meta.total}
          showSizeChanger={true}
          showQuickJumper={true}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} of ${total} advocates`
          }
          onChange={handlePagination}
          onShowSizeChange={handlePagination}
          pageSizeOptions={["10", "20", "50", "100"]}
          style={{ marginTop: "16px", textAlign: "center" }}
        />
      )}
    </main>
  );
}
