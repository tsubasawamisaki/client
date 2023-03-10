import { Image, Descriptions, Modal, Button, Form, Input, Select } from "antd";
import React, { useEffect, useState } from "react";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getProduct, updateProduct } from "../../api/product";
import { useAppContext } from "../../contexts/AppContext";
import { useUserContext } from "../../contexts/UserContext";
import { setAuthHeader } from "../../api/auth";
import { useRequestContext } from "../../contexts/RequestContext";

const ProductDetail = (props) => {
  const { id } = props;
  const { TextArea } = Input;
  const navigate = useNavigate();
  const {
    convertStatusToNameProduct,
    openNotification,
    convertObjectToArray,
    convertUnitToName,
    authState: { user },
  } = useAppContext();
  const { handleCreateRequest } = useRequestContext();
  const [product, setProduct] = useState({});
  const [productLine, setProductLine] = useState({});
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({});
  const [showClient, setShowClient] = useState(false);
  const [showProduct, setShowProduct] = useState(false);
  const [location, setLocation] = useState();
  const [type, setType] = useState();
  const [factory, setFactory] = useState();
  const [requestData, setRequestData] = useState({
    requester: "",
    recipient: "",
    product: "",
    productLine: "",
  });
  const [note, setNote] = useState("");
  // type = null: da bao hanh xong
  // type = 1: loi can tra ve nha may
  // type = 2: tra san pham
  const {
    userState: { listUser },
    loadListUser,
  } = useUserContext();
  const loadProduct = async (id) => {
    setAuthHeader(localStorage["token"]);
    const response = await getProduct(id);
    console.log(response.data);
    if (response.success) {
      setProductLine(response.data.productLine);
      setProduct({
        ...response.data,
        statusName: convertStatusToNameProduct(response.data.status),
      });
      setFactory(response.data.factory.name);
      setRequestData({
        ...requestData,
        product: response.data._id,
        productLine: response.data.productLine._id,
        requester: user._id,
        recipient: response.data.factory._id,
        type: 4,
      });
    }
  };
  const dataOption4 = listUser
    ?.filter((users) => users.role === 4)
    .map((users) => {
      return {
        ...users,
        label: users.name,
        value: users._id,
      };
    });

  const dataOption2 = listUser
    ?.filter((users) => users.role === 2)
    .map((users) => {
      return {
        ...users,
        label: users.name,
        value: users._id,
      };
    });

  useEffect(() => {
    loadProduct(id);
    loadListUser();
  }, [id]);

  const onValueChange = (e) => {
    const propName = e.target.name;
    const value = e.target.value;
    setFormData({ ...formData, [propName]: value });
  };

  const deadDate = (date, period, unit) => {
    const newDate = new Date(date);
    switch (unit) {
      case 0:
        newDate.setDate(newDate.getDate() + period);
        break;
      case 1:
        newDate.setMonth(newDate.getMonth() + period);
        break;
      case 2:
        newDate.setFullYear(newDate.getFullYear() + period);
        break;
      default:
        break;
    }
    return newDate;
  };
  const handleOk = async () => {
    let response;
    if (product?.status === 1 && !type) {
      response = await updateProduct(id, [
        { propName: "customer", value: { ...formData, soldDate: new Date() } },
        { propName: "isSold", value: true },
        { propName: "status", value: 2 },
        {
          propName: "deadTime",
          value: deadDate(
            new Date(),
            productLine?.timePeriod.period,
            productLine?.timePeriod.unit
          ),
        },
      ]);
      if (response.success) {
        openNotification("success", response.msg);
        loadProduct(id);
        setVisible(false);
      } else {
        openNotification("error", "Failed");
      }
    } else if (product?.status === 1 && type === 2) {
      response = await handleCreateRequest(requestData);
      if (response.success) {
        openNotification("success", response.msg);
        loadProduct(id);
        setVisible(false);
      } else {
        openNotification("error", "Failed");
      }
    } else if (product?.status === 2) {
      response = await updateProduct(id, convertObjectToArray({ status: 3 }));
      if (response.success) {
        openNotification("success", response.msg);
        loadProduct(id);
        setVisible(false);
      } else {
        openNotification("error", "Failed");
      }
    } else if (product?.status === 3) {
      const dateNow = new Date();
      if (new Date(dateNow) - new Date(product?.deadTime) <= 0) {
        response = await handleCreateRequest({
          note: note,
          product: product?._id,
          recipient: location,
          requester: user._id,
          type: 1,
        });
        if (response.success) {
          openNotification("success", response.msg);
          navigate("/");
          setVisible(false);
        } else {
          openNotification("error", "Failed");
        }
      } else {
        response = await updateProduct(
          id,
          convertObjectToArray({ status: 10 })
        );
        if (response.success) {
          openNotification("success", "???? h???t h???n b???o h??nh");
          loadProduct(id);
          setVisible(false);
        }
      }
    } else if (product?.status === 4 && !type) {
      response = await updateProduct(id, convertObjectToArray({ status: 5 }));
      if (response.success) {
        openNotification("success", response.msg);
        loadProduct(id);
        navigate("/");
        setVisible(false);
      } else {
        openNotification("error", "Failed");
      }
    } else if (product?.status === 4 && type === 1) {
      response = await updateProduct(id, convertObjectToArray({ status: 7 }));
      if (response.success) {
        openNotification("success", response.msg);
        loadProduct(id);
        setVisible(false);
      } else {
        openNotification("error", "Failed");
      }
    } else if (product?.status === 5 && user.role === 4) {
      response = await handleCreateRequest({
        note: note,
        product: product?._id,
        recipient: product?.store._id,
        requester: user._id,
        type: 2,
      });
      if (response.success) {
        openNotification("success", response.msg);
        navigate("/");
        setVisible(false);
      } else {
        openNotification("error", "Failed");
      }
    } else if (product?.status === 5 && user.role === 3) {
      response = await updateProduct(id, convertObjectToArray({ status: 6 }));
      if (response.success) {
        openNotification("success", response.msg);
        loadProduct(id);
        navigate("/");
        setVisible(false);
      } else {
        openNotification("error", "Failed");
      }
    } else if (product?.status === 7) {
      response = await handleCreateRequest({
        product: id,
        recipient: product.factory._id,
        requester: user._id,
        type: 3,
        note: note,
      });
      const response1 = await handleCreateRequest({
        product: id,
        recipient: product.store._id,
        requester: user._id,
        type: 5,
        note: note,
      });
      if (response.success && response1.success) {
        openNotification("success", response.msg);
        navigate("/request");
        setVisible(false);
      } else {
        openNotification("error", "Failed");
      }
    } else if (product?.status === 9) {
      response = await handleCreateRequest({
        product: id,
        recipient: location,
        requester: user._id,
        type: 1,
        note: note,
      });
      if (response?.success) {
        openNotification("success", response.msg);
        navigate("/request");
        setVisible(false);
      } else {
        openNotification("error", "Failed");
      }
    }
  };

  const handleCancel = () => {
    setVisible(false);
    setType(null);
  };

  const showModal = (type) => {
    if (type === 1) {
      setType(1);
      setVisible(true);
    } else if (type === 2) {
      setType(2);
      setVisible(true);
    } else {
      setVisible(true);
    }
  };

  const onWarrantyChange = (location) => {
    setLocation(location);
  };

  const onFactoryChange = (location) => {
    setLocation(location);
  };

  const onNoteChange = (e) => {
    setNote(e.target.value);
    setRequestData({ ...requestData, note: e.target.value });
  };

  return (
    <div>
      <Image src={productLine.img} width={400} preview={false} />
      <h2 className="font-bold text-base">Tr???ng th??i: {product?.statusName}</h2>
      <div className="text-right text-2xl text-cyan-500">
        {user.role === 3 && (
          <div>
            {product?.status === 1 && (
              <div>
                <Button onClick={showModal} type="primary">
                  B??n s???n ph???m
                </Button>
                <Button type="primary" onClick={() => showModal(2)}>
                  Tr??? s???n ph???m
                </Button>
              </div>
            )}
            {product?.status === 2 && (
              <Button onClick={showModal} type="primary">
                S???n ph???m b??? l???i
              </Button>
            )}
            {product?.status === 3 && (
              <Button onClick={showModal} type="primary">
                G???i s???n ph???m ??i b???o h??nh
              </Button>
            )}
            {product?.status === 5 && (
              <Button onClick={showModal} type="primary">
                Tr??? s???n ph???m cho kh??ch h??ng
              </Button>
            )}
          </div>
        )}
        {user.role === 4 && (
          <div>
            {product?.status === 4 && (
              <div>
                <Button onClick={showModal} type="primary">
                  ???? b???o h??nh xong
                </Button>
                <Button
                  onClick={() => {
                    showModal(1);
                  }}
                  type="primary">
                  Kh??ng th??? b???o h??nh
                </Button>
              </div>
            )}
            {product?.status === 5 && (
              <div>
                <Button onClick={showModal} type="primary">
                  G???i s???n ph???m v??? nh?? m??y
                </Button>
              </div>
            )}
            {product?.status === 7 && (
              <div>
                <Button onClick={showModal} type="primary">
                  Tr??? v??? nh?? m??y
                </Button>
              </div>
            )}
          </div>
        )}
        {product?.status === 9 && (
          <Button onClick={showModal} type="primary">
            Tri???u h???i s???n ph???m
          </Button>
        )}
      </div>
      {product?.isSold && (
        <h1
          className="font-bold text-base  mb-3 cursor-pointer"
          onClick={() => {
            setShowClient(!showClient);
          }}>
          Th??ng tin kh??ch h??ng {showClient ? <UpOutlined /> : <DownOutlined />}
        </h1>
      )}

      {showClient && (
        <Descriptions bordered column={1}>
          <Descriptions.Item label="T??n kh??ch h??ng">
            {product?.customer?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {product?.customer?.email}
          </Descriptions.Item>
          <Descriptions.Item label="?????a ch???">
            {product?.customer?.address}
          </Descriptions.Item>
          <Descriptions.Item label="S??? ??i???n tho???i">
            {product?.customer?.phone}
          </Descriptions.Item>
          <Descriptions.Item label="Ng??y b??n">
            {product?.customer?.soldDate.split("T")[0]}
          </Descriptions.Item>
        </Descriptions>
      )}

      <h1
        className="font-bold text-base my-3 cursor-pointer"
        onClick={() => {
          setShowProduct(!showProduct);
        }}>
        Th??ng tin s???n ph???m {showProduct ? <UpOutlined /> : <DownOutlined />}
      </h1>
      {showProduct && (
        <Descriptions bordered column={1}>
          <Descriptions.Item label="T??n d??ng xe">
            {productLine.name}
          </Descriptions.Item>
          <Descriptions.Item label="Kh???i l?????ng b???n th??n">
            {productLine.weight}
          </Descriptions.Item>
          <Descriptions.Item label="D??i">
            {productLine.length}
          </Descriptions.Item>
          <Descriptions.Item label="R???ng">
            {productLine.width}
          </Descriptions.Item>
          <Descriptions.Item label="Cao">
            {productLine.height}
          </Descriptions.Item>
          <Descriptions.Item label="Kho???ng c??ch tr???c b??nh xe">
            {productLine.wheelAxleDistance}
          </Descriptions.Item>
          <Descriptions.Item label="Chi???u cao y??n xe">
            {productLine.saddleHeight}
          </Descriptions.Item>
          <Descriptions.Item label="Kho???ng c??ch g???m xe">
            {productLine.groundClearance}
          </Descriptions.Item>
          <Descriptions.Item label="Dung t??ch b??nh x??ng">
            {productLine.petrolTankCapacity}
          </Descriptions.Item>
          <Descriptions.Item label="M???c ti??u th??? nhi??n li???u">
            {productLine.fuelConsumption}
          </Descriptions.Item>
          <Descriptions.Item label="Dung t??ch xy-lanh">
            {productLine.displacementVolume}
          </Descriptions.Item>
          <Descriptions.Item label="Lo???i ?????ng c??">
            {productLine.engineType}
          </Descriptions.Item>
          <Descriptions.Item label="Th???i h???n b???o h??nh">
            {productLine.timePeriod.period}{" "}
            {convertUnitToName(productLine.timePeriod.unit)}
          </Descriptions.Item>
        </Descriptions>
      )}

      {product?.status === 1 && !type && (
        <Modal
          destroyOnClose={true}
          open={visible}
          title="Th??ng tin kh??ch h??ng"
          onCancel={handleCancel}
          onOk={handleOk}
          okText="Ok"
          cancelText="Cancel">
          <Form initialValues={{ remember: true }}>
            <Form.Item
              label="T??n kh??ch h??ng"
              type="text"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Please input your name!",
                },
              ]}>
              <Input
                name="name"
                placeholder="input placeholder"
                onChange={onValueChange}
              />
            </Form.Item>
            <Form.Item
              label="Email"
              type="text"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your email!",
                },
              ]}>
              <Input
                name="email"
                placeholder="input placeholder"
                onChange={onValueChange}
              />
            </Form.Item>
            <Form.Item
              label="?????a ch???"
              type="text"
              name="address"
              rules={[
                {
                  required: true,
                  message: "Please input your address!",
                },
              ]}>
              <Input
                name="address"
                placeholder="input placeholder"
                onChange={onValueChange}
              />
            </Form.Item>
            <Form.Item
              label="S??? ??i???n tho???i"
              type="text"
              name="phone"
              rules={[
                {
                  required: true,
                  message: "Please input your phone!",
                },
              ]}>
              <Input
                name="phone"
                placeholder="input placeholder"
                onChange={onValueChange}
              />
            </Form.Item>
          </Form>
        </Modal>
      )}
      {product?.status === 1 && type === 2 && (
        <Modal
          destroyOnClose={true}
          open={visible}
          title="Tr??? s???n ph???m"
          onCancel={handleCancel}
          onOk={handleOk}
          okText="Ok"
          cancelText="Cancel">
          <div>
            B???n c?? ch???c ch???n mu???n tr??? s???n ph???m n??y v??? nh?? m??y {factory} kh??ng?
          </div>
          <div>Ghi ch??:</div>
          <TextArea onChange={onNoteChange}></TextArea>
        </Modal>
      )}
      {product?.status === 2 && (
        <Modal
          destroyOnClose={true}
          open={visible}
          title="S???n ph???m b??? l???i"
          onCancel={handleCancel}
          onOk={handleOk}
          okText="Ok"
          cancelText="Cancel">
          <p>B???n c?? ch???c ch???n s???n ph???m n??y b??? l???i kh??ng?</p>
        </Modal>
      )}
      {product?.status === 3 && (
        <Modal
          destroyOnClose={true}
          open={visible}
          title="S???n ph???m b??? l???i"
          onCancel={handleCancel}
          onOk={handleOk}
          okText="Ok"
          cancelText="Cancel">
          <p>B???n c?? ch???c ch???n mu???n g???i s???n ph???m ??i b???o h??nh kh??ng?</p>
          <Select
            showSearch
            placeholder="Select a warrantyCenter"
            optionFilterProp="children"
            onChange={onWarrantyChange}
            // onSearch={onSearch}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={dataOption4}
          />
          <div>Ghi ch??:</div>
          <TextArea onChange={onNoteChange}></TextArea>
        </Modal>
      )}
      {product?.status === 4 && (
        <Modal
          destroyOnClose={true}
          open={visible}
          title="S???n ph???m b??? l???i"
          onCancel={handleCancel}
          onOk={handleOk}
          okText="Ok"
          cancelText="Cancel">
          {type === 1 ? (
            <p>B???n c?? ch???c s???n ph???m kh??ng th??? b???o h??nh kh??ng?</p>
          ) : (
            <p>B???n ???? b???o h??nh xong?</p>
          )}
        </Modal>
      )}
      {product?.status === 5 && (
        <Modal
          destroyOnClose={true}
          open={visible}
          title="???? b???o h??nh xong"
          onCancel={handleCancel}
          onOk={handleOk}
          okText="Ok"
          cancelText="Cancel">
          {user?.role === 4 && (
            <div>
              <p>B???n c?? ch???c ch???n mu???n g???i s???n ph???m v??? nh?? m??y kh??ng?</p>
              <p>Ghi ch??:</p>
              <TextArea onChange={onNoteChange}></TextArea>
            </div>
          )}
          {user?.role === 3 && (
            <div>
              <p>B???n c?? ch???c ch???n mu???n tr??? s???n ph???m cho kh??ch h??ng?</p>
            </div>
          )}
        </Modal>
      )}
      {product?.status === 7 && (
        <Modal
          destroyOnClose={true}
          open={visible}
          title="S???n ph???m b??? l???i"
          onCancel={handleCancel}
          onOk={handleOk}
          okText="Ok"
          cancelText="Cancel">
          <p>B???n c?? ch???c ch???n mu???n tr??? s???n ph???m v??? nh?? m??y {factory} kh??ng?</p>
          {/* <Select
            showSearch
            placeholder="Select a factory"
            optionFilterProp="children"
            onChange={onFactoryChange}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={dataOption2}
          /> */}
          <div>Ghi ch??:</div>
          <TextArea onChange={onNoteChange} />
        </Modal>
      )}
      {product?.status === 9 && (
        <Modal
          destroyOnClose={true}
          open={visible}
          title="S???n ph???m b??? l???i"
          onCancel={handleCancel}
          onOk={handleOk}
          okText="Ok"
          cancelText="Cancel">
          <p>
            B???n c?? ch???c ch???n mu???n ????a s???n ph???m v??? trung t??m b???o h??nh ????? s???a ch???a
            kh??ng?
          </p>
          <Select
            showSearch
            placeholder="Select a warrantyCenter"
            optionFilterProp="children"
            onChange={onWarrantyChange}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={dataOption4}
          />
          <div>Ghi ch??:</div>
          <TextArea onChange={onNoteChange} />
        </Modal>
      )}
    </div>
  );
};

export default ProductDetail;
