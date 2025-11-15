import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import path from '../../constants/path';

const PrivateRoute = ({ element: Component, roles, userRole }) => {
  const navigate = useNavigate();

  const isAuthorized = roles.includes(userRole);

  useEffect(() => {
    if (!isAuthorized) {
      Swal.fire({
        title: 'Thông báo',
        text: 'Bạn cần đăng nhập để thực hiện thao tác này.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Đăng nhập',
        cancelButtonText: 'Hủy',
        backdrop: true,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          // Check if the roles include ROLE_USER
          if (roles.includes('user')) {
            navigate(path.login); // Redirect to user login
          } else {
            navigate(path.loginAdmin); // Redirect to admin login
          }
        }
      });
    }
  }, [isAuthorized, navigate, roles]); // Track isAuthorized, navigate, and roles

  // If not authorized, return null
  if (!isAuthorized) return null;

  // Render component when authorized
  return <Component />;
};

export default PrivateRoute;