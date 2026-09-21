const path = {
    //! user
    home: '/',
    login: '/login',
    forgotPassword: '/forgot-password',
    register: '/register',
    cart: '/cart',
    productDetail: (categoryId, productId) => `/category/${categoryId}/product/${productId}`, // Đường dẫn cho chi tiết sản phẩm
    categoryProducts: (categoryId) => `/category/${categoryId}`, // Đường dẫn cho trang danh sách sản phẩm theo danh mục
    checkout: '/checkout',
    historyOrder: '/history-order',
    //! admin
    loginAdmin: '/login-admin',
    manageUser: '/manage-user',
    manageProduct: '/manage-product',
    manageOrders: '/manage-orders',
};

export default path;