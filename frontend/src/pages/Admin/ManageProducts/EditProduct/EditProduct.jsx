import React, { useState, useEffect } from 'react'; // Import React và các hook cần thiết
import Swal from 'sweetalert2'; // Import thư viện SweetAlert để hiển thị thông báo
import { adminAPI } from '../../../../api/adminApi'; // Import API từ thư mục adminApi
import ImageUploader from '../../../../components/ImageUploader/ImageUploader'; // Import component để upload ảnh

// Component EditProduct nhận vào các props: isOpen (trạng thái mở/đóng modal), onClose (hàm đóng modal), fetchData (hàm lấy lại dữ liệu), categories (danh sách thể loại), product (sản phẩm cần chỉnh sửa)
const EditProduct = ({ isOpen, onClose, fetchData, categories, product }) => {
    // State để lưu trữ dữ liệu chỉnh sửa của sản phẩm
    const [editedProductData, setEditedProductData] = useState({
        categoryId: '', // Mã thể loại
        name: '', // Tên sản phẩm
        model: '', // Model sản phẩm
        costPrice: '', // Giá gốc
        salePrice: '', // Giá bán
        discountPrice: '', // Giá khuyến mãi
        description: '', // Mô tả sản phẩm
        images: [], // Danh sách hình ảnh
        specification: {}, // Thông số kỹ thuật của sản phẩm
        type: '', // Loại sản phẩm
        features: '', // Tính năng sản phẩm
        promotions: '', // Khuyến mãi
        stock: '', // Tồn kho
    });

    // Định nghĩa các thông số kỹ thuật của từng loại sản phẩm (dựa trên categoryId)
    const categorySpecifications = {
        '1': { cpu: '', ram: '', storage: '', screen: '', graphics: '', ports: [], weight: '', os: '' }, // Laptop
        '2': { chip: '', ram: '', storage: '', camera: '', battery: '', connectivity: [] }, // Điện thoại
        '3': { screen: '', chip: '', storage: '', battery: '', connectivity: '' }, // Máy tính bảng
        '4': { sensor: '', processor: '', autofocus: '', screen: '', video: '' }, // Máy ảnh
        '5': { chip: '', screen: '', ram: '', storage: '', camera: '', battery: '' }, // Smartwatch
        '6': { size: '', panel: '', resolution: '', refreshRate: '', responseTime: '', ports: [] } // Màn hình máy tính
    };

    // Định nghĩa nhãn (label) cho các thông số kỹ thuật của sản phẩm
    const specificationLabels = {
        cpu: 'Bộ vi xử lý (CPU)',
        ram: 'RAM',
        storage: 'Bộ nhớ',
        screen: 'Màn hình',
        graphics: 'Đồ họa',
        ports: 'Cổng kết nối',
        weight: 'Trọng lượng',
        os: 'Hệ điều hành',
        chip: 'Chip',
        camera: 'Camera',
        battery: 'Pin',
        connectivity: 'Kết nối',
        sensor: 'Cảm biến',
        processor: 'Bộ xử lý',
        autofocus: 'Lấy nét tự động',
        video: 'Video',
        size: 'Kích thước',
        panel: 'Màn hình',
        resolution: 'Độ phân giải',
        refreshRate: 'Tần số làm tươi',
        responseTime: 'Thời gian phản hồi'
    };

    // useEffect này sẽ được gọi mỗi khi `product` thay đổi, cập nhật dữ liệu sản phẩm vào form
    useEffect(() => {
        if (product) {
            setEditedProductData({
                categoryId: product.categoryId || '', // Mã thể loại sản phẩm
                name: product.name || '', // Tên sản phẩm
                model: product.model || '', // Model sản phẩm
                costPrice: product.costPrice || '', // Giá gốc
                salePrice: product.salePrice || '', // Giá bán
                discountPrice: product.discountPrice || '', // Giá khuyến mãi
                description: product.description || '', // Mô tả sản phẩm
                images: product.images || [], // Hình ảnh sản phẩm
                specification: product.specification || {}, // Thông số kỹ thuật sản phẩm
                type: product.type || '', // Loại sản phẩm
                features: product.features || '', // Tính năng sản phẩm
                promotions: product.promotions || '', // Khuyến mãi
                stock: product.stock || '', // Tồn kho
            });
        }
    }, [product]); // Hook sẽ chạy lại khi `product` thay đổi

    // useEffect này sẽ cập nhật lại thông số kỹ thuật sản phẩm khi thể loại (categoryId) thay đổi
    useEffect(() => {
        if (editedProductData.categoryId) {
            const newSpecification = categorySpecifications[editedProductData.categoryId] || {}; // Lấy thông số kỹ thuật tương ứng với categoryId
            setEditedProductData(prevData => ({
                ...prevData,
                specification: {
                    ...newSpecification, // Cập nhật thông số kỹ thuật
                    ...prevData.specification // Giữ lại các giá trị đã nhập trước đó
                }
            }));
        } else {
            setEditedProductData(prevData => ({
                ...prevData,
                specification: {} // Xóa thông số kỹ thuật nếu không chọn thể loại
            }));
        }
    }, [editedProductData.categoryId]); // Hook này sẽ chạy lại khi `categoryId` thay đổi

    // Hàm xử lý thay đổi giá trị trong các trường nhập liệu (text, number, v.v.)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedProductData(prevData => ({
            ...prevData,
            [name]: value // Cập nhật giá trị cho trường tương ứng
        }));
    };

    // Hàm xử lý thay đổi hình ảnh (khi người dùng chọn ảnh mới)
    const handleImagesChange = (newImages) => {
        setEditedProductData(prevData => ({
            ...prevData,
            images: newImages // Cập nhật danh sách hình ảnh mới
        }));
    };

    // Hàm xử lý thay đổi các thông số kỹ thuật
    const handleSpecificationChange = (e) => {
        const { name, value } = e.target;
        setEditedProductData(prevData => ({
            ...prevData,
            specification: {
                ...prevData.specification,
                [name]: value // Cập nhật giá trị cho thông số kỹ thuật tương ứng
            }
        }));
    };

    // Hàm kiểm tra các trường nhập liệu có hợp lệ không
    const validateFields = () => {
        const { categoryId, name, model, costPrice, salePrice, discountPrice, description, images, specification } = editedProductData;

        // Kiểm tra các trường bắt buộc có giá trị không
        if (!categoryId || !name || !model || !costPrice || !salePrice || !discountPrice || !description || images.length === 0) {
            Swal.fire('Lỗi!', 'Vui lòng điền đầy đủ thông tin sản phẩm.', 'error');
            return false;
        }

        // Kiểm tra các thông số kỹ thuật đã được điền đầy đủ chưa
        for (const specKey in specification) {
            if (specification[specKey] === '') {
                Swal.fire('Lỗi!', `Vui lòng điền đầy đủ thông tin cho ${specificationLabels[specKey]}.`, 'error');
                return false;
            }
        }

        return true; // Nếu tất cả đều hợp lệ
    };

    // Hàm xử lý cập nhật sản phẩm
    const handleUpdateProduct = async () => {
        if (!validateFields()) return; // Kiểm tra tính hợp lệ của các trường

        // Tạo đối tượng productPayload từ editedProductData và chuyển đổi các hình ảnh sang dạng URL
        const productPayload = {
            ...editedProductData,
            images: editedProductData.images.map(image => image.url)
        };

        try {
            // Gọi API để cập nhật sản phẩm
            const response = await adminAPI.product.updateProduct(product.id, editedProductData);
            if (response) {
                Swal.fire('Thành công!', 'Cập nhật sản phẩm thành công.', 'success'); // Hiển thị thông báo thành công
                fetchData(); // Lấy lại dữ liệu sản phẩm
                onClose(); // Đóng modal
            }
        } catch (error) {
            console.error("Error updating product:", error);
            const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật sản phẩm.';
            Swal.fire('Lỗi!', errorMessage, 'error'); // Hiển thị thông báo lỗi
        }
    };

    return (
        <div>
            {/* Modal chỉnh sửa sản phẩm */}
            <div className={`fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 ${isOpen ? '' : 'hidden'}`}>
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl relative overflow-y-auto max-h-[90%]">
                    <h2 className="text-lg font-semibold mb-4">Chỉnh sửa sản phẩm</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Form nhập liệu cho các trường sản phẩm */}
                        <div>
                            <label htmlFor="name" className="block">Tên sản phẩm</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={editedProductData.name}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                        </div>
                        <div>
                            <label htmlFor="model" className="block">Model</label>
                            <input
                                type="text"
                                id="model"
                                name="model"
                                value={editedProductData.model}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                        </div>
                    </div>
                    {/* Các trường khác như giá, mô tả, thể loại, thông số kỹ thuật, v.v... */}
                    <div className="mb-4">
                        <button onClick={handleUpdateProduct} className="bg-blue-500 text-white px-4 py-2 rounded-lg">Cập nhật sản phẩm</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProduct;
