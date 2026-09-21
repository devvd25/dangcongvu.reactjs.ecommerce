import { BrowserRouter as Router, Route, Routes, Outlet } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "./index.css";
import path from "./constants/path";
import Home from "./pages/User/Home/Home";
import ProductDetail from "./pages/User/ProductDetail/ProductDetail";
import Login from "./pages/User/Login/Login";
import Register from "./pages/User/Register/Register";
import { getRoleFromLS } from "./utils/auth";
import Cart from "./pages/User/Cart/Cart";
import PrivateRoute from "./components/PrivateRouter/PrivateRouter";
import Header from "./components/Header/Header"; 
import { Provider } from 'react-redux';
import store from "./Redux/store";
import LoginAdmin from "./pages/Admin/LoginAdmin/LoginAdmin";
import ManageUsers from "./pages/Admin/ManageUsers/ManageUsers";
import ManageProducts from "./pages/Admin/ManageProducts/ManageProducts";
import Products from "./pages/User/Products/Products";
import Checkout from "./pages/User/Checkout/Checkout";
import HistoryOrder from "./pages/User/HistoryOrder/HistoryOrder";
import ManageOrders from "./pages/Admin/ManageOrders/ManageOrders";

const LayoutWithHeader = () => {
  return (
    <>
      <Header />
      <Outlet /> {/* Render các routes con */}
    </>
  );
};

function App() {
  const [userRole, setUserRole] = useState(getRoleFromLS()); 

  useEffect(() => {
    const handleStorageChange = () => {
      const updatedRole = getRoleFromLS();
      setUserRole(updatedRole);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          //!User
          {/* Routes có Header */}
          <Route element={<LayoutWithHeader />}>
            <Route path={path.home} element={<Home />} />
            <Route path={path.cart} element={<PrivateRoute element={Cart} roles={["user"]} userRole={userRole} />} />
            <Route path={path.checkout} element={<PrivateRoute element={Checkout} roles={["user"]} userRole={userRole} />} />
            <Route path={path.historyOrder} element={<PrivateRoute element={HistoryOrder} roles={["user"]} userRole={userRole} />} />

            <Route path="/category/:categoryId/product/:productId" element={<ProductDetail />} />
            <Route path="/category/:categoryId" element={<Products />} />
          </Route>

          {/* Routes không có Header */}
          <Route path={path.login} element={<Login setUserRole={setUserRole} />} />
          <Route path={path.register} element={<Register />} />


          //!admin
          <Route path={path.loginAdmin} element={<LoginAdmin setUserRole={setUserRole} />} />
          <Route path={path.manageUser} element={<PrivateRoute element={ManageUsers} roles={["admin"]} userRole={userRole} />} />
          <Route path={path.manageProduct} element={<PrivateRoute element={ManageProducts} roles={["admin"]} userRole={userRole} />} />
          <Route path={path.manageOrders} element={<PrivateRoute element={ManageOrders} roles={["admin"]} userRole={userRole} />} />

        </Routes>
      </Router>
    </Provider>
  );
}

export default App;