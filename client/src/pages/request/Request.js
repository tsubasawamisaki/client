import { SyncOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Tag } from "antd";
import React, { useEffect, useState } from "react";
import {
  getAllRequest,
  handleImportRequest,
  updateRequest,
} from "../../api/request";
import TableInfo from "../../components/TableInfo/TableInfo";
import { useAppContext } from "../../contexts/AppContext";
import { useRequestContext } from "../../contexts/RequestContext";
import Default from "../../Layouts/Default";
import { getProduct, updateProduct } from "../../api/product";
import ProduceSearch from "../../components/Produce/ProduceSearch";
import { useProductContext } from "../../contexts/ProductContext";
import { useNavigate } from "react-router-dom";
import { getProductLine } from "../../api/productline";
import SearchRequest from "../../components/SearchFilter/SearchRequest";

const Request = () => {
  const { TextArea } = Input;
  const {
    authState: { user },
    convertTypeToName,
    convertStatusToName,
    openNotification,
    convertObjectToArray,
    refreshPage,
    deadDate,
  } = useAppContext();
  const {
    requestState: { listRequest, isLoading },
    loadListRequest,
  } = useRequestContext();
  const {
    productState: { listProduct },
    loadUserProduct,
  } = useProductContext();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [desc, setDesc] = useState("");
  const [information, setInformation] = useState("");
  const [data, setData] = useState({});
  const [id, setId] = useState();
  const [refId, setRefId] = useState();
  const [feedback, setFeedback] = useState({});
  const [record, setRecord] = useState({});
  const [note, setNote] = useState("");
  const color = (status) => {
    switch (status) {
      case 1:
        return "magenta";
      case 2:
        return "processing";
      case 3:
        return "success";
      case 4:
        return "error";
      default:
        throw new Error("status is not match");
    }
  };
  const handleClick = (record) => {
    setVisible(true);
    setDesc(<h1>{convertTypeToName(record.type)}</h1>);
    setNote(record.note);
    if (record.type === 0) {
      setInformation(
        `${record.requester.name} mu???n nh???p ${record.amount} s???n ph???m lo???i ${record.productLine.name} t??? ${record.recipient.name}`
      );
      setData({
        ...data,
        amount: record.amount,
        store: record.requester._id,
        productLine: record.productLine._id,
      });
    } else if (record.type === 4) {
      setInformation(
        `${record.requester.name} y??u c???u tr??? s???n ph???m t??? ${record.recipient.name}`
      );
      setData({
        ...data,
        amount: record.amount,
        store: record.recipient._id,
        productLine: record.productLine._id,
      });
    } else if (record.type === 1) {
      setInformation(
        `${record.requester.name} y??u c???u b???o h??nh s???n ph???m t??? ${record.recipient.name}`
      );
      setData({
        ...data,
        amount: record.amount,
        store: record.requester._id,
        productLine: record.product.productLine._id,
      });
    } else if (record.type === 2) {
      setInformation(
        `${record.requester.name} y??u c???u nh??n s???n ph???m b???o h??nh t??? ${record.recipient.name}`
      );
      setData({
        ...data,
        amount: record.amount,
        store: record.requester._id,
        productLine: record.product.productLine._id,
      });
    } else if (record.type === 5) {
      setInformation(
        `${record.requester.name} y??u c???u ${record.recipient.name} b??n giao s???n ph???m m???i cho kh??ch h??ng do ${record.product.identifier} b??? h???ng kh??ng th??? s???a ch???a v?? ???? ???????c g???i v??? nh?? m??y.`
      );
      setData({
        ...data,
        amount: record.amount,
        store: record.recipient._id,
        productLine: record.product.productLine._id,
      });
    } else {
      setInformation("");
      setData({});
      setId("");
      setRefId("");
    }
  };
  const handleOk = async () => {
    let response;
    console.log(record);
    if (record.type === 0) {
      response = await handleImportRequest(data);
      console.log(data);
    } else if (record.type === 4) {
      response = await updateProduct(
        record.product._id,
        convertObjectToArray({
          ...feedback,
          status: 11,
          location: record.product.factory,
        })
      );
    } else if (record.type === 1) {
      response = await updateProduct(
        record.product._id,
        convertObjectToArray({
          ...feedback,
          status: 4,
          location: user._id,
        })
      );
    } else if (record.type === 2) {
      response = await updateProduct(
        record.product._id,
        convertObjectToArray({
          ...feedback,
          status: 5,
          location: user._id,
        })
      );
    } else if (record.type === 3) {
      response = await updateProduct(
        record.product._id,
        convertObjectToArray({
          ...feedback,
          status: 8,
          location: user._id,
          isSold: false,
          customer: {},
        })
      );
    } else if (record.type === 5) {
      const dataProduct = listProduct?.filter((product) => {
        return (
          product.status === 1 &&
          product.productLine._id === record.product.productLine
        );
      });
      console.log(listProduct);
      if (dataProduct.length === 0) {
        openNotification("error", "Kh??ng c?? s???n ph???m ????? b??n giao");
        return;
      } else {
        response = await updateProduct(
          dataProduct[0]._id,
          convertObjectToArray({
            status: 2,
            customer: { ...record.product.customer, soldDate: new Date() },
            isSold: true,
            deadDate: deadDate(dataProduct[0], new Date()),
          })
        );
      }
    } else if (record.type === 6) {
      const dataProduct = listProduct?.filter((product) => {
        console.log(product);
        console.log(record);
        return product.productLine._id === record.productLine._id;
      });
      console.log(dataProduct);
      for (let i = 0; i < dataProduct?.length; i++) {
        const product = dataProduct[i];
        console.log(product);
        response = await updateProduct(
          product._id,
          convertObjectToArray({
            ...feedback,
            status: 9,
          })
        );
      }
    }
    if (response?.success) {
      openNotification("success", response.msg);
      await updateRequest(
        record._id,
        convertObjectToArray({ ...feedback, status: 3 })
      );
      await updateRequest(
        record.refRequest,
        convertObjectToArray({ ...feedback, status: 3 })
      );
      // navigate("/request");
      loadListRequest();
      setVisible(false);
    } else {
      openNotification("error", response?.msg);
    }
  };
  const handleReject = async () => {
    const response1 = await updateRequest(
      record._id,
      convertObjectToArray({ ...feedback, status: 4 })
    );
    const response2 = await updateRequest(
      record.refRequest,
      convertObjectToArray({ ...feedback, status: 4 })
    );
    if (response1.success && response2.success) {
      openNotification("success", response1.msg);
      loadListRequest();
      setVisible(false);
    } else {
      openNotification("error", response1.msg);
      setVisible(false);
    }
  };
  const dataColumn = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
    },
    {
      title: "Ng?????i g???i",
      dataIndex: "requester1",
      key: "requester1",
    },
    {
      title: "Ng?????i nh???n",
      dataIndex: "recipient1",
      key: "recipient1",
    },
    {
      title: "Loai y??u c???u",
      dataIndex: "type",
      key: "type",
      render: (text) => convertTypeToName(text),
    },
    {
      title: "Tr???ng th??i",
      dataIndex: "status",
      key: "status",
      render: (text, record) => (
        <Tag
          onClick={() => {
            if (record.status === 2) {
              handleClick(record);
            }
          }}
          color={color(record.status)}>
          {convertStatusToName(text)}
        </Tag>
      ),
    },
  ];

  useEffect(() => {
    loadListRequest();
    loadUserProduct();
  }, []);

  const dataSource = listRequest
    ?.sort((a, b) => {
      return new Date(b?.createdAt) - new Date(a?.createdAt);
    })
    .map((request, index) => {
      return {
        ...request,
        key: index + 1,
        requester1: request?.requester.name,
        recipient1: request?.recipient.name,
      };
    });
  const onChange = (e) => {
    setFeedback({ feedback: e.target.value });
  };

  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <div className="w-full">
      <Default tagName="yc">
        <SearchRequest />
        <TableInfo
          onRow={(record) => ({
            onClick: () => {
              if (record.status === 2) {
                handleClick(record);
                setRecord(record);
              }
              console.log(record);
            },
          })}
          dataColumn={dataColumn}
          dataSource={dataSource}
          loading={isLoading}
        />
      </Default>
      <Modal
        destroyOnClose={true}
        open={visible}
        title="Th??ng tin ????n h??ng"
        footer={[
          <Button key="1" onClick={handleReject}>
            T??? ch???i
          </Button>,
          <Button key="2" type="primary" onClick={handleOk}>
            Ch???p nh???n
          </Button>,
        ]}
        onCancel={handleCancel}>
        <div>{desc}</div>
        <div>{information}</div>
        <div>Ghi ch??: {note}</div>
        Ph???n h???i:
        <TextArea onChange={onChange} />
      </Modal>
    </div>
  );
};

export default Request;
