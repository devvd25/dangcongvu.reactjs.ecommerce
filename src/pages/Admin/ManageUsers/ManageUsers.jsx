import Sidebar from "../../../components/Sidebar/Sidebar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import DataTable from 'react-data-table-component';
import React, { useState, useMemo, useEffect } from 'react';
import { adminAPI } from "../../../api/adminApi";
import Swal from 'sweetalert2';
import AddUser from "./AddUser/AddUser";
import EditUser from "./EditUser/EditUser";

function ManageUsers() {
    const [searchText, setSearchText] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [userList, setUserList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.user.getAll();
            if (response.status === 200) {
                const filteredUsers = response.data.filter(user => user.role === 'user');
                setUserList(filteredUsers);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            Swal.fire({
                title: 'Lỗi!',
                text: 'Không thể tải danh sách người dùng.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredData = useMemo(() => {
        return userList.filter(item =>
            item.email.toLowerCase().includes(searchText.toLowerCase()) ||
            item.username.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [searchText, userList]);

    const openAddModal = () => setIsAddModalOpen(true);
    const closeAddModal = () => setIsAddModalOpen(false);

    const openEditModal = (user) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => setIsEditModalOpen(false);

    const handleDelete = async (user) => {
        const result = await Swal.fire({
            title: `Bạn có chắc chắn muốn xóa người dùng này?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Có',
            cancelButtonText: 'Không'
        });

        if (result.isConfirmed) {
            try {
                await adminAPI.user.deleteUser(user.id);
                fetchData();
                Swal.fire('Thành công!', 'Người dùng đã được xóa thành công.', 'success');
            } catch (error) {
                console.error("Error deleting user:", error);
                Swal.fire('Lỗi!', 'Có lỗi xảy ra khi xóa người dùng.', 'error');
            }
        }
    };

    const columns = [
        {
            name: 'STT',
            selector: (row, index) => index + 1,
            sortable: true,
            width: "10%",
        },
        {
            name: 'Họ Tên',
            selector: row => row.username,
            sortable: true,
            width: "25%",
        },
        {
            name: 'Email',
            selector: row => row.email,
            sortable: true,
            width: "25%",
        },
        {
            name: 'Số Điện Thoại',
            selector: row => row.phone || 'N/A',
            sortable: true,
            width: "20%",
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
            width: "10%",
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
                            Quản lý người dùng
                        </div>
                        <div>
                            <button onClick={openAddModal} className="px-3 py-2 text-base rounded-md bg-blue-500 text-white hover:bg-blue-600 font-semibold">
                                Thêm người dùng
                            </button>
                        </div>
                    </div>
                    <div className="mt-6">
                        <input
                            type="text"
                            placeholder="Tìm kiếm người dùng..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="p-2 border border-gray-500 rounded w-56 flex float-end mb-4 text-sm"
                        />
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
                            noDataComponent={<div className="text-center bg-[#000] w-full p-3 text-white">Không tìm thấy người dùng nào.</div>}
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
            </div>

            {/* Modal cho thêm và chỉnh sửa người dùng */}
            <AddUser isOpen={isAddModalOpen} onClose={closeAddModal} fetchData={fetchData} />
            <EditUser isOpen={isEditModalOpen} onClose={closeEditModal} userData={selectedUser} fetchData={fetchData} />
        </>
    );
}

export default ManageUsers;