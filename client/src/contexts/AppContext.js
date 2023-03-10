import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { notification } from "antd";
import { loginAPI, logoutAPI, setAuthHeader } from "../api/auth";
import { AuthReducer } from "../reducers/AuthReducer";
import { getProfile } from "../api/user";
import { SET_AUTH_BEGIN, SET_AUTH_FAILED, SET_AUTH_SUCCESS } from "../action";
import { useRequestContext } from "./RequestContext";
import { useProductContext } from "./ProductContext";
import { useProductLineContext } from "./ProductLineContext";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

export const initState = {
  url: window.location.pathname,
  isLoading: false,
  user: null,
  isAuthenticated: false,
  listProductLine: [],
  listProduct: [],
  listRequest: [],
  listUser: [],
};

const AppContextProvider = (props) => {
  const [authState, dispatch] = useReducer(AuthReducer, initState);
  const navigate = useNavigate();
  const openNotification = (type, message, description) => {
    notification[type]({
      message,
      description,
      duration: 2.5,
    });
  };
  const [openSidebar, setOpenSidebar] = useState(true);
  const convertObjectToArray = (obj) => {
    let result = [];
    const keys = Object.keys(obj);
    const values = Object.values(obj);
    for (let index = 0; index < keys.length; index++) {
      const element = { propName: keys[index], value: values[index] };
      result.push(element);
    }
    return result;
  };

  const deadDate = (product, date) => {
    const newDate = new Date(date);
    switch (product.productLine.timePeriod.unit) {
      case 0:
        newDate.setDate(
          newDate.getDate() + product.productLine.timePeriod.period
        );
        break;
      case 1:
        newDate.setMonth(
          newDate.getMonth() + product.productLine.timePeriod.period
        );
        break;
      case 2:
        newDate.setFullYear(
          newDate.getFullYear() + product.productLine.timePeriod.period
        );
        break;
      default:
        break;
    }
    return newDate;
  };

  function refreshPage() {
    window.location.reload(false);
  }

  const convertRoleToName = (role) => {
    switch (role) {
      case 1:
        return "Ban ??i???u h??nh";
      case 2:
        return "C?? s??? s???n xu???t";
      case 3:
        return "?????i l?? ph??n ph???i";
      case 4:
        return "Trung t??m b???o h??nh";
      default:
        throw new Error("Role is not match");
    }
  };

  const convertTypeToName = (type) => {
    switch (type) {
      case 0:
        return "y??u c???u nh???p s???n ph???m";
      case 1:
        return "y??u c???u b???o h??nh";
      case 2:
        return "y??u c???u nh???n s???n ph???m ???? b???o h??nh xong";
      case 3:
        return "y??u c???u tr??? l???i s???n ph???m do kh??ng b???o h??nh ???????c";
      case 4:
        return "y??u c???u tr??? l???i c?? s??? s???n xu???t do l??u kh??ng b??n ???????c";
      case 5:
        return "y??u c???u b??n giao s???n ph???m m???i cho kh??ch h??ng";
      case 6:
        return "y??u c???u tri???u h???i s???n ph???m";
      default:
        throw new Error("type is not match");
    }
  };

  const convertStatusToName = (status) => {
    switch (status) {
      case 1:
        return "???? g???i y??u c???u";
      case 2:
        return "Ch??? x??? l??";
      case 3:
        return "Ch???p nh???n";
      case 4:
        return "T???? ch????i";
      default:
        throw new Error("status is not match");
    }
  };

  const convertStatusToNameProduct = (type) => {
    switch (type) {
      case 0:
        return "m???i s???n xu???t";
      case 1:
        return "????a v??? ?????i l??";
      case 2:
        return "???? b??n";
      case 3:
        return "l???i c???n b???o h??nh";
      case 4:
        return "??ang b???o h??nh";
      case 5:
        return "???? b???o h??nh xong";
      case 6:
        return "???? tr??? l???i cho kh??ch h??ng";
      case 7:
        return "l???i, c???n tr??? v??? nh?? m??y";
      case 8:
        return "l???i, ???? ????a v??? c?? s??? s???n xu???t";
      case 9:
        return "l???i c???n tri???u h???i";
      case 10:
        return "h???t th???i gian b???o h??nh";
      case 11:
        return "tr??? l???i c?? s??? s???n xu???t do l??u kh??ng b??n ???????c";
      default:
        throw new Error("type is not match");
    }
  };

  const convertUnitToName = (unit) => {
    switch (unit) {
      case 0:
        return "ng??y";
      case 1:
        return "th??ng";
      case 2:
        return "n??m";
      default:
        throw new Error("unit is not match");
    }
  };

  const loadUser = async () => {
    if (!localStorage["token"]) {
      dispatch({ type: SET_AUTH_FAILED });
      return;
    }

    setAuthHeader(localStorage["token"]);
    dispatch({ type: SET_AUTH_BEGIN });
    const response = await getProfile();
    if (response.success) {
      dispatch({
        type: SET_AUTH_SUCCESS,
        payload: {
          user: response.data,
        },
      });
    } else {
      localStorage.removeItem("token");
      openNotification("error", response.msg);
      setAuthHeader(null);
      dispatch({ type: SET_AUTH_FAILED });
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleLogin = async (data) => {
    dispatch({
      type: SET_AUTH_BEGIN,
    });
    const response = await loginAPI(data);
    // refreshPage();
    if (response.success) {
      localStorage.setItem("token", response.accessToken);
      setAuthHeader(localStorage["token"]);
      dispatch({
        type: SET_AUTH_SUCCESS,
        payload: {
          user: response.data,
        },
      });
      openNotification("success", "Login success");
      if (response.data.role === 1) {
        navigate("/productline");
      } else {
        navigate("/home");
      }
      //console.log(localStorage);
    } else {
      //console.log(response.msg);
      dispatch({
        type: SET_AUTH_FAILED,
      });
      openNotification("error", "Login failed");
    }
  };

  const handleLogout = async () => {
    dispatch({ type: SET_AUTH_BEGIN });
    const response = await logoutAPI();
    localStorage.removeItem("token");
    dispatch({ type: SET_AUTH_FAILED });
    openNotification("success", response.msg);
  };

 // console.log(authState);

  const data = {
    loadUser,
    authState,
    dispatch,
    openSidebar,
    setOpenSidebar,
    openNotification,
    handleLogin,
    handleLogout,
    convertObjectToArray,
    convertRoleToName,
    refreshPage,
    convertTypeToName,
    convertStatusToName,
    convertStatusToNameProduct,
    convertUnitToName,
    deadDate,
  };

  return (
    <AppContext.Provider value={data}>{props.children}</AppContext.Provider>
  );
};

const useAppContext = () => {
  return useContext(AppContext);
};

export default AppContextProvider;

export { useAppContext };
