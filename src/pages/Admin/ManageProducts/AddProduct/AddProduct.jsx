import React, { useState, useEffect } from 'react'; // Import React và các hook cần thiết (useState, useEffect)
import Swal from 'sweetalert2'; // Import thư viện SweetAlert2 để hiển thị thông báo đẹp
import { adminAPI } from '../../../../api/adminApi'; // Import API quản lý sản phẩm từ backend
import ImageUploader from '../../../../components/ImageUploader/ImageUploader'; // Import component tải lên hình ảnh

// Component AddProduct nhận vào các props: isOpen (trạng thái mở/đóng modal), onClose (hàm đóng modal), fetchData (hàm lấy lại dữ liệu), categories (danh sách thể loại sản phẩm)
const AddProduct = ({ isOpen, onClose, fetchData, categories }) => {
    // Khai báo state để lưu trữ dữ liệu sản phẩm
    const [productData, setProductData] = useState({
        categoryId: '', // ID thể loại của sản phẩm
        name: '', // Tên sản phẩm
        model: '', // Hãng sản xuất
        costPrice: '', // Giá gốc
        salePrice: '', // Giá bán
        discountPrice: '', // Giá khuyến mãi
        description: '', // Mô tả sản phẩm
        images: [], // Danh sách ảnh sản phẩm
        specification: {}, // Thông số kỹ thuật của sản phẩm, phụ thuộc vào thể loại
        type: '', // Loại sản phẩm
        features: '', // Các tính năng đặc biệt
        promotions: '', // Khuyến mãi
        stock: '', // Số lượng trong kho
    });

    // Định nghĩa cấu hình cho thông số kỹ thuật của các thể loại sản phẩm khác nhau
    const categorySpecifications = {
        '1': { cpu: '', ram: '', storage: '', screen: '', graphics: '', ports: [], weight: '', os: '' }, // Laptop
        '2': { chip: '', ram: '', storage: '', camera: '', battery: '', connectivity: [] }, // Điện thoại
        '3': { screen: '', chip: '', storage: '', battery: '', connectivity: '' }, // Máy tính bảng
        '4': { sensor: '', processor: '', autofocus: '', screen: '', video: '' }, // Máy ảnh
        '5': { chip: '', screen: '', ram: '', storage: '', camera: '', battery: '' }, // Smartwatch
        '6': { size: '', panel: '', resolution: '', refreshRate: '', responseTime: '', ports: [] } // Màn hình máy tính
    };

    // Định nghĩa nhãn hiển thị cho các thông số kỹ thuật của từng sản phẩm
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

    // Hook useEffect sẽ chạy khi `categoryId` thay đổi, và cập nhật thông số kỹ thuật của sản phẩm tương ứng với thể loại đã chọn
    useEffect(() => {
        if (productData.categoryId) {
            // Nếu đã chọn thể loại, cập nhật thông số kỹ thuật
            setProductData(prevData => ({
                ...prevData,
                specification: categorySpecifications[productData.categoryId] // Lấy thông số kỹ thuật cho thể loại
            }));
        } else {
            // Nếu chưa chọn thể loại, xóa thông số kỹ thuật
            setProductData(prevData => ({
                ...prevData,
                specification: {}
            }));
        }
    }, [productData.categoryId]); // Mỗi khi `categoryId` thay đổi, useEffect sẽ chạy lại

    // Hàm xử lý thay đổi giá trị của các trường trong form
    const handleChange = (e) => {
        const { name, value } = e.target; // Lấy name và value của trường input
        setProductData(prevData => ({
            ...prevData,
            [name]: value // Cập nhật giá trị của trường tương ứng
        }));
    };

    // Hàm xử lý thay đổi hình ảnh sản phẩm
    const handleImagesChange = (newImages) => {
        setProductData(prevData => ({
            ...prevData,
            images: newImages // Cập nhật danh sách ảnh sản phẩm
        }));
    };

    // Hàm xử lý thay đổi thông số kỹ thuật của sản phẩm
    const handleSpecificationChange = (e) => {
        const { name, value } = e.target; // Lấy name và value của trường thông số kỹ thuật
        setProductData(prevData => ({
            ...prevData,
            specification: {
                ...prevData.specification,
                [name]: value // Cập nhật thông số kỹ thuật tương ứng
            }
        }));
    };

    // Kiểm tra tính hợp lệ của các trường thông tin
    const validateFields = () => {
        const { categoryId, name, model, costPrice, salePrice, discountPrice, description, images, specification } = productData;

        // Kiểm tra các trường thông tin cơ bản
        if (!categoryId || !name || !model || !costPrice || !salePrice || !discountPrice || !description || images.length === 0) {
            Swal.fire('Lỗi!', 'Vui lòng điền đầy đủ thông tin sản phẩm.', 'error'); // Thông báo nếu có trường thiếu
            return false; // Trả về false nếu thông tin chưa đầy đủ
        }

        // Kiểm tra các trường trong thông số kỹ thuật
        for (const specKey in specification) {
            if (specification[specKey] === '') {
                Swal.fire('Lỗi!', `Vui lòng điền đầy đủ thông tin cho ${specificationLabels[specKey]}.`, 'error'); // Thông báo thiếu thông số kỹ thuật
                return false; // Trả về false nếu thông số kỹ thuật thiếu
            }
        }

        return true; // Nếu tất cả các trường hợp hợp lệ, trả về true
    };

    // Hàm xử lý thêm sản phẩm vào hệ thống
    const handleAddProduct = async () => {
        if (!validateFields()) return; // Nếu kiểm tra không hợp lệ thì dừng lại, không thêm sản phẩm

        const productPayload = {
            ...productData,
            images: productData.images.map(image => image.url) // Lấy URL của các ảnh thay vì toàn bộ dữ liệu ảnh
        };

        try {
            // Gửi yêu cầu API tạo sản phẩm mới
            const response = await adminAPI.product.createProduct(productPayload);
            if (response.status === 201) {
                Swal.fire('Thành công!', 'Thêm sản phẩm thành công.', 'success'); // Thông báo khi thêm sản phẩm thành công
                fetchData(); // Lấy lại danh sách sản phẩm mới
                onClose(); // Đóng modal thêm sản phẩm
                // Reset lại form về trạng thái ban đầu
                setProductData({
                    categoryId: '',
                    name: '',
                    model: '',
                    costPrice: '',
                    salePrice: '',
                    discountPrice: '',
                    description: '',
                    images: [],
                    specification: {},
                    type: '',
                    features: '',
                    promotions: '',
                    stock: '',
                });
            }
        } catch (error) {
            console.error("Error adding product:", error); // In lỗi nếu có
            Swal.fire('Lỗi!', 'Có lỗi xảy ra khi thêm sản phẩm.', 'error'); // Thông báo lỗi khi thêm sản phẩm thất bại
        }
    };

    return (
        <div>
            {/* Modal hiển thị form thêm sản phẩm */}
            <div className={`fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 ${isOpen ? '' : 'hidden'}`}>
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl relative overflow-y-auto max-h-[90%]">
                    <h2 className="text-lg font-semibold mb-4">Thêm sản phẩm</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Các trường thông tin nhập vào */}
                        <div>
                            <label className="block mb-1">Thể loại</label>
                            <select name="categoryId" value={productData.categoryId} onChange={handleChange} className="p-2 border border-gray-500 rounded w-full">
                                <option value="">Chọn thể loại</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1">Tên sản phẩm</label>
                            <input type="text" name="name" value={productData.name} onChange={handleChange} className="p-2 border border-gray-500 rounded w-full" />
                        </div>
                        {/* ... Các trường nhập liệu khác (Hãng, Giá gốc, Giá bán, Mô tả, ...) */}
                    </div>
                    {/* Form thông số kỹ thuật */}
                    <div className="grid grid-cols-2 gap-4">
                        {Object.keys(productData.specification).map(specKey => (
                            <div className='col-span-1' key={specKey}>
                                <label className="block mb-1">{specificationLabels[specKey]}</label>
                                <input
                                    type="text"
                                    name={specKey}
                                    value={productData.specification[specKey] || ''}
                                    onChange={handleSpecificationChange}
                                    className="p-2 border border-gray-500 rounded w-full"
                                    placeholder={`Nhập ${specificationLabels[specKey]}`}
                                />
                            </div>
                        ))}
                    </div>
                    {/* Tải lên ảnh sản phẩm */}
                    <div className="col-span-2 my-4">
                        <ImageUploader onImagesChange={handleImagesChange} categoryId={productData.categoryId} />
                    </div>
                    {/* Preview ảnh */}
                    <div className="mb-4">
                        <h3 className="font-semibold mb-2">Hình ảnh đã chọn:</h3>
                        <div className="grid grid-cols-6 gap-6">
                            {productData.images.map((image, index) => (
                                <div key={index} className="relative">
                                    <img src={image.url} alt={image.alt} className="w-full h-32 object-cover rounded" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Các nút điều khiển */}
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Hủy</button>
                        <button onClick={handleAddProduct} className="px-4 py-2 bg-blue-500 text-white rounded">Thêm sản phẩm</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddProduct; // Xuất component AddProduct
