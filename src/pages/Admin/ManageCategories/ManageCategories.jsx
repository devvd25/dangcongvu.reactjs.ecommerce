import React, { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../../components/Sidebar/Sidebar';
import { adminAPI } from '../../../api/adminApi';

const EMPTY_FORM = { name: '', slug: '', image: '', status: true };

function ManageCategories() {
    const [categories, setCategories] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // null: đóng form, {}: thêm mới, {id,...}: sửa
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.category.getAll();
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
            Swal.fire("Lỗi!", "Không thể tải danh sách danh mục.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const filtered = useMemo(() => {
        const keyword = searchText.toLowerCase();
        return categories.filter(c => c.name.toLowerCase().includes(keyword) || c.slug.toLowerCase().includes(keyword));
    }, [categories, searchText]);

    const openForm = (category) => {
        setEditing(category || {});
        setForm(category ? { name: category.name, slug: category.slug, image: category.image || '', status: category.status !== false } : EMPTY_FORM);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            Swal.fire("Lỗi!", "Vui lòng nhập tên danh mục.", "error");
            return;
        }
        setSaving(true);
        try {
            if (editing.id) {
                await adminAPI.category.update(editing.id, form);
            } else {
                await adminAPI.category.create(form);
            }
            setEditing(null);
            await fetchCategories();
            Swal.fire("Thành công!", editing.id ? "Đã cập nhật danh mục." : "Đã thêm danh mục mới.", "success");
        } catch (error) {
            Swal.fire("Lỗi!", error.response?.data?.message || "Không thể lưu danh mục.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (category) => {
        try {
            await adminAPI.category.update(category.id, { status: !category.status });
            setCategories(prev => prev.map(c => (c.id === category.id ? { ...c, status: !c.status } : c)));
        } catch (error) {
            Swal.fire("Lỗi!", error.response?.data?.message || "Không thể cập nhật trạng thái.", "error");
        }
    };

    const handleDelete = async (category) => {
        const result = await Swal.fire({
            title: `Xoá danh mục "${category.name}"?`,
            text: "Thao tác này không thể hoàn tác.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Xoá',
            cancelButtonText: 'Huỷ',
        });
        if (!result.isConfirmed) return;
        try {
            await adminAPI.category.delete(category.id);
            setCategories(prev => prev.filter(c => c.id !== category.id));
            Swal.fire("Đã xoá!", "Danh mục đã được xoá.", "success");
        } catch (error) {
            Swal.fire("Không thể xoá!", error.response?.data?.message || "Có lỗi xảy ra khi xoá danh mục.", "error");
        }
    };

    const columns = [
        { name: 'ID', selector: row => row.id, sortable: true, width: '80px' },
        {
            name: 'Hình Ảnh',
            cell: row => row.image
                ? <img src={row.image} alt={row.name} className="w-12 h-12 object-contain rounded border" />
                : <div className="w-12 h-12 rounded border bg-gray-50 flex items-center justify-center text-gray-400 text-xs">N/A</div>,
            width: '110px',
        },
        { name: 'Tên Danh Mục', selector: row => row.name, sortable: true },
        { name: 'Slug', selector: row => row.slug, cell: row => <code className="text-xs bg-gray-100 px-2 py-1 rounded">{row.slug}</code> },
        { name: 'Số Sản Phẩm', selector: row => row.productCount, sortable: true, width: '140px' },
        {
            name: 'Hiển Thị',
            selector: row => row.status,
            cell: row => (
                <button
                    onClick={() => handleToggleStatus(row)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${row.status ? 'bg-green-500' : 'bg-gray-300'}`}
                    title={row.status ? 'Đang hiển thị - bấm để ẩn' : 'Đang ẩn - bấm để hiển thị'}
                >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${row.status ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
            ),
            width: '120px',
        },
        {
            name: 'Thao Tác',
            cell: row => (
                <div className="flex gap-2">
                    <button className="text-blue-600 hover:bg-blue-50 w-8 h-8 rounded" onClick={() => openForm(row)} title="Sửa">
                        <FontAwesomeIcon icon={faPencilAlt} />
                    </button>
                    <button className="text-red-600 hover:bg-red-50 w-8 h-8 rounded" onClick={() => handleDelete(row)} title="Xoá">
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            width: '120px',
        },
    ];

    return (
        <>
            <Sidebar />
            <div className="p-4 sm:ml-60 overflow-x-auto">
                <div className="p-4 mt-16">
                    <div className="w-full flex flex-wrap justify-between items-center gap-3">
                        <div>
                            <div className="font-semibold text-2xl">Quản lý danh mục</div>
                            <div className="text-sm text-gray-500 mt-1">{categories.length} danh mục</div>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Tìm danh mục..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="p-2 border border-gray-500 rounded w-56"
                            />
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded font-medium flex items-center gap-2" onClick={() => openForm(null)}>
                                <FontAwesomeIcon icon={faPlus} /> Thêm danh mục
                            </button>
                        </div>
                    </div>
                    <div className="mt-6">
                        <DataTable
                            columns={columns}
                            data={filtered}
                            progressPending={loading}
                            progressComponent={<div className="py-6">Đang tải dữ liệu...</div>}
                            pagination
                            highlightOnHover
                            striped
                            customStyles={{
                                headRow: { style: { fontSize: '15px', fontWeight: 'bold', backgroundColor: '#2a83e9', borderStartStartRadius: '15px', borderStartEndRadius: '15px', color: "#fff" } },
                                rows: { style: { fontSize: '14px', fontWeight: '500', paddingTop: '6px', paddingBottom: '6px' } },
                            }}
                            noDataComponent={<div className="text-center py-6">Không có danh mục nào.</div>}
                        />
                    </div>
                </div>
            </div>

            {/* Form thêm / sửa danh mục */}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                        <h3 className="text-lg font-semibold">{editing.id ? `Sửa danh mục #${editing.id}` : 'Thêm danh mục'}</h3>
                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục *</label>
                                <input
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Ví dụ: Tai nghe"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (đường dẫn)</label>
                                <input
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={form.slug}
                                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                    placeholder="Để trống sẽ tự tạo từ tên, ví dụ: tai-nghe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Link hình ảnh</label>
                                <div className="flex gap-3 items-center">
                                    <input
                                        className="flex-1 p-2 border border-gray-300 rounded"
                                        value={form.image}
                                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                                        placeholder="https://..."
                                    />
                                    {form.image && <img src={form.image} alt="" className="w-12 h-12 object-contain border rounded" />}
                                </div>
                            </div>
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input type="checkbox" checked={form.status} onChange={(e) => setForm({ ...form, status: e.target.checked })} />
                                Hiển thị danh mục trên cửa hàng
                            </label>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded" onClick={() => setEditing(null)}>
                                Huỷ
                            </button>
                            <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-60">
                                {saving ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}

export default ManageCategories;
