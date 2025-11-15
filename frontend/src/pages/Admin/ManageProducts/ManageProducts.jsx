import Sidebar from "../../../components/Sidebar/Sidebar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import DataTable from 'react-data-table-component';
import React, { useState, useMemo, useEffect } from 'react';
import { adminAPI } from "../../../api/adminApi";
import Swal from 'sweetalert2';
import AddProduct from "./AddProduct/AddProduct";
import EditProduct from "./EditProduct/EditProduct";
import { formatPrice } from "../../../utils/utils";

function ManageProducts() {
    const [searchText, setSearchText] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [productList, setProductList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.product.getAll();
            if (response.status === 200) {
                setProductList(response.data);
            } else {
                console.error("Failed to fetch products:", response);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            Swal.fire({
                title: 'Lỗi!',
                text: 'Không thể tải danh sách sản phẩm.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await adminAPI.category.getAll();
            if (response.status === 200) {
                setCategories(response.data);
            } else {
                console.error("Failed to fetch categories:", response);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchCategories();
    }, []);

    const filteredData = useMemo(() => {
        return productList.filter(item =>
            (item.name.toLowerCase().includes(searchText.toLowerCase()) ||
            item.model.toLowerCase().includes(searchText.toLowerCase())) &&
            (selectedCategory ? item.categoryId === selectedCategory : true)
        );
    }, [searchText, productList, selectedCategory]);

    const openAddModal = () => setIsAddModalOpen(true);
    const closeAddModal = () => setIsAddModalOpen(false);

    const openEditModal = (product) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => setIsEditModalOpen(false);

    const handleDelete = async (product) => {
        const result = await Swal.fire({
            title: `Bạn có chắc chắn muốn xóa sản phẩm này?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Có',
            cancelButtonText: 'Không'
        });
    
        if (result.isConfirmed) {
            try {
                await adminAPI.product.deleteProduct(product.id);
                fetchData();
                Swal.fire('Thành công!', 'Sản phẩm đã được xóa thành công.', 'success');
            } catch (error) {
                console.error("Error deleting product:", error);
                const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xóa sản phẩm.';
                Swal.fire('Lỗi!', errorMessage, 'error');
            }
        }
    };

    const columns = [
        {
            name: 'STT',
            selector: (row, index) => index + 1,
            sortable: true,
            width: '7%'
        },
        {
            name: 'Hình Ảnh',
            cell: row => (
                <img src={row.images[0]?.url} alt={row.name} className="w-20 h-auto" />
            ),
            sortable: false,
            width: '10%'
        },
        {
            name: 'Tên Sản Phẩm',
            selector: row => row.name,
            sortable: true,
            width: '15%',
            // Cập nhật để cho phép xuống dòng
            cell: row => (
                <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                    {row.name}
                </div>
            ),
        },
        {
            name: 'Hãng',
            selector: row => row.model,
            sortable: true,
            width: '10%'
        },
        {
            name: 'Giá Bán',
            selector: row => formatPrice(row.salePrice),
            sortable: true,
            width: '10%'

        },
        {
            name: 'Mô Tả',
            selector: row => row.description,
            sortable: false,
            width: '30%',
            cell: row => (
                <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                    {row.description}
                </div>
            ),
        },
        {
            name: 'Hành Động',
            cell: row => (
                <div>
                    <button onClick={() => openEditModal(row)} className="text-yellow-500 hover:underline mx-2">
                        <FontAwesomeIcon icon={faPencilAlt} />
                    </button>
                    <button onClick={() => handleDelete(row)} className="text-red-500 hover:underline">
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>
            ),
        },
    ];

    if (loading) {
        return <div className="text-center">Đang tải dữ liệu...</div>;
    }

    return (
        <>
            <Sidebar />
            <div className="p-4 sm:ml-60 overflow-x-auto">
                <div className="p-4 mt-20">
                    <div className="w-full flex justify-between items-center">
                        <div className="font-semibold text-2xl font-inter">
                            Quản lý sản phẩm
                        </div>
                        <div>
                            <button onClick={openAddModal} className="px-3 py-2 text-base rounded-md bg-blue-500 text-white hover:bg-blue-600 font-semibold">
                                Thêm sản phẩm
                            </button>
                        </div>
                    </div>
                    <div className="mt-6 mb-4 flex items-center justify-between">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="p-2 border border-gray-500 rounded"
                        >
                            <option value="">Tất cả thể loại</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="p-2 border border-gray-500 rounded w-56"
                        />
                    </div>
                    <DataTable
                        columns={columns}
                        data={filteredData}
                        className="min-w-full"
                        pagination
                        highlightOnHover
                        striped
                        customStyles={{
                            headRow: { 
                                style: { 
                                    fontSize: '15px', 
                                    fontWeight: 'bold', 
                                    backgroundColor: '#2a83e9', 
                                    borderStartStartRadius: '15px', 
                                    borderStartEndRadius: '15px', 
                                    color: "#fff"
                                } 
                            },
                            rows: { 
                                style: { 
                                    fontSize: '14px', 
                                    fontWeight: '500', 
                                    fontFamily: 'inter', 
                                    paddingTop: '6px', 
                                    paddingBottom: '6px',
                                    whiteSpace: 'normal',
                                    overflow: 'visible',
                                } 
                            },
                        }}
                        noDataComponent={<div className="text-center bg-[#000] w-full p-3 text-white">Không tìm thấy sản phẩm nào.</div>}
                        paginationComponentOptions={{
                            rowsPerPageText: 'Hiển thị',
                            rangeSeparatorText: 'trên',
                            noRowsPerPage: false,
                            selectAllRowsItem: false,
                            selectAllRowsItemText: 'Tất cả',
                        }}
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                    />
                </div>
            </div>

            {/* Modal cho thêm và chỉnh sửa sản phẩm */}
            <AddProduct isOpen={isAddModalOpen} onClose={closeAddModal} fetchData={fetchData} categories={categories} />
            <EditProduct isOpen={isEditModalOpen} onClose={closeEditModal} categories={categories} product={selectedProduct} fetchData={fetchData} />
        </>
    );
}

export default ManageProducts;