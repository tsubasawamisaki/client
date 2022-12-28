import React, { useEffect, useState } from "react";
import { Input, Select } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import { useUserContext } from "../../contexts/UserContext";
import { useAppContext } from "../../contexts/AppContext";
import { useRequestContext } from "../../contexts/RequestContext";

const SearchRequest = (props) => {
  const { data } = props;
  const [form, setForm] = useState({});
  const { convertTypeToName, convertStatusToName } = useAppContext();
  const {
    requestState: { listRequest },
    loadListRequest,
    handleSearchRequest,
  } = useRequestContext();
  useEffect(() => {
    handleSearchRequest({ ...form });
  }, [form]);
  useEffect(() => {
    loadListRequest();
  }, []);
  const onStatusChange = (value) => {
    setForm({ ...form, status: value });
    console.log(value);
  };
  const onRequesterChange = (value) => {
    setForm({ ...form, requester: value });
    console.log(value);
  };
  const onTypeChange = (value) => {
    console.log(value);
    setForm({ ...form, type: value });
  };
  let dataType = [0, 1, 2, 3, 4, 5, 6].map((item) => {
    return {
      value: item,
      label: convertTypeToName(item),
    };
  });
  dataType = [{ value: "", label: "" }, ...dataType];
  let dataStatus = [1, 2, 3, 4].map((item) => {
    return {
      value: item,
      label: convertStatusToName(item),
    };
  });
  dataStatus = [{ value: "", label: "" }, ...dataStatus];
  let dataRequester = listRequest
    ?.map((item) => {
      return {
        value: item.requester._id,
        label: item.requester.name,
      };
    })
    .filter(
      (item, index, self) =>
        self.findIndex((t) => t.value === item.value) === index
    );
  dataRequester = [{ value: "", label: "" }, ...dataRequester];
  return (
    <div className="w-1/3 mr-10 mt-5 ml-auto">
      <div className="container rounded-2xl">
        <Select
          className="mt-[5px]"
          placeholder="Loai yeu cau"
          style={{ width: 120 }}
          onChange={onTypeChange}
          options={dataType}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          optionFilterProp="children"
        />
        <Select
          className="mt-[5px]"
          placeholder="Trang thai"
          style={{ width: 120 }}
          onChange={onStatusChange}
          options={dataStatus}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          optionFilterProp="children"
        />
        <Select
          className="mt-[5px]"
          placeholder="Nguoi gui"
          style={{ width: 120 }}
          onChange={onRequesterChange}
          options={dataRequester}
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          optionFilterProp="children"
          showSearch
        />
        {/* <div className="flex items-center space-x-5">
          <Input
            placeholder="Tìm kiếm ở đây!"
            onChange={onValueChange}
            allowClear
            style={{ width: 120 }}
          />
          <div className="w-[40px] h-[40px] rounded-full border border-solid border-gray-300 hover:border-blue-500">
            <button className="mt-[5px]">
              <SearchOutlined
                style={{
                  color: "#1677ff",
                  width: "40px",
                }}
              />
            </button>
          </div>
          <div className="w-[40px] h-[40px] rounded-full border border-solid border-gray-300 hover:border-blue-500">
            <button className="mt-[5px]">
              <FilterOutlined
                style={{
                  color: "#1677ff",
                  width: "40px",
                }}
              />
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default SearchRequest;
