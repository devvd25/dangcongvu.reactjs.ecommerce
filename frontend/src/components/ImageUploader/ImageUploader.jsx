import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

function ImageUploader({ onImagesChange, categoryId }) {
    const categoryImages = {
        '1': [ // Laptop
            { url: '/src/assets/Products/laptops/laptop1.jpg', alt: 'Hình 1' },
            { url: '/src/assets/Products/laptops/laptop2.jpg', alt: 'Hình 2' },
            { url: '/src/assets/Products/laptops/laptop3.jpg', alt: 'Hình 3' },
            { url: '/src/assets/Products/laptops/laptop4.jpg', alt: 'Hình 4' },
            { url: '/src/assets/Products/laptops/laptop5.jpg', alt: 'Hình 5' },
            { url: '/src/assets/Products/laptops/laptop6.jpg', alt: 'Hình 6' },
            { url: '/src/assets/Products/laptops/laptop7.jpg', alt: 'Hình 7' },
            { url: '/src/assets/Products/laptops/laptop8.jpg', alt: 'Hình 8' },
            { url: '/src/assets/Products/laptops/laptop9.jpg', alt: 'Hình 9' },
            { url: '/src/assets/Products/laptops/laptop10.jpg', alt: 'Hình 10' },
            // Thêm các hình ảnh khác cho Laptop
        ],
        '2': [ // Phone
            { url: '/src/assets/Products/phones/phone1.jpg', alt: 'Hình 1' },
            { url: '/src/assets/Products/phones/phone2.jpg', alt: 'Hình 2' },
            { url: '/src/assets/Products/phones/phone3.jpg', alt: 'Hình 3' },
            { url: '/src/assets/Products/phones/phone4.jpg', alt: 'Hình 4' },
            { url: '/src/assets/Products/phones/phone5.jpg', alt: 'Hình 5' },
            { url: '/src/assets/Products/phones/phone6.jpg', alt: 'Hình 6' },
            { url: '/src/assets/Products/phones/phone7.jpg', alt: 'Hình 7' },
            { url: '/src/assets/Products/phones/phone8.jpg', alt: 'Hình 8' },
            { url: '/src/assets/Products/phones/phone9.jpg', alt: 'Hình 9' },
            { url: '/src/assets/Products/phones/phone10.jpg', alt: 'Hình 10' },
            // Thêm các hình ảnh khác cho Phone
        ],
        '3': [ // AppleWatch
            { url: '/src/assets/Products/apple-watch/applewatch1.jpg', alt: 'Hình 1' },
            { url: '/src/assets/Products/apple-watch/applewatch2.jpg', alt: 'Hình 2' },
            { url: '/src/assets/Products/apple-watch/applewatch3.jpg', alt: 'Hình 3' },
            { url: '/src/assets/Products/apple-watch/applewatch4.jpg', alt: 'Hình 4' },
            { url: '/src/assets/Products/apple-watch/applewatch5.jpg', alt: 'Hình 5' },
            { url: '/src/assets/Products/apple-watch/applewatch6.jpg', alt: 'Hình 6' },
            { url: '/src/assets/Products/apple-watch/applewatch7.jpg', alt: 'Hình 7' },
            { url: '/src/assets/Products/apple-watch/applewatch8.jpg', alt: 'Hình 8' },
            { url: '/src/assets/Products/apple-watch/applewatch9.jpg', alt: 'Hình 9' },
            { url: '/src/assets/Products/apple-watch/applewatch10.jpg', alt: 'Hình 10' },
            // Thêm các hình ảnh khác cho Tablet
        ],
        '4': [ // Cameras
            { url: '/src/assets/Products/cameras/camera1.jpg', alt: 'Hình 1' },
            { url: '/src/assets/Products/cameras/camera2.jpg', alt: 'Hình 2' },
            { url: '/src/assets/Products/cameras/camera3.jpg', alt: 'Hình 3' },
            { url: '/src/assets/Products/cameras/camera4.jpg', alt: 'Hình 4' },
            { url: '/src/assets/Products/cameras/camera5.jpg', alt: 'Hình 5' },
            { url: '/src/assets/Products/cameras/camera6.jpg', alt: 'Hình 6' },
            { url: '/src/assets/Products/cameras/camera7.jpg', alt: 'Hình 7' },
            { url: '/src/assets/Products/cameras/camera8.jpg', alt: 'Hình 8' },
            { url: '/src/assets/Products/cameras/camera9.jpg', alt: 'Hình 9' },
            { url: '/src/assets/Products/cameras/camera10.jpg', alt: 'Hình 10' },
        ],
        '5': [ // Tablet
            { url: '/src/assets/Products/tablets/tablet1.jpg', alt: 'Hình 1' },
            { url: '/src/assets/Products/tablets/tablet2.jpg', alt: 'Hình 2' },
            { url: '/src/assets/Products/tablets/tablet3.jpg', alt: 'Hình 3' },
            { url: '/src/assets/Products/tablets/tablet4.jpg', alt: 'Hình 4' },
            { url: '/src/assets/Products/tablets/tablet5.jpg', alt: 'Hình 5' },
            { url: '/src/assets/Products/tablets/tablet6.jpg', alt: 'Hình 6' },
            { url: '/src/assets/Products/tablets/tablet7.jpg', alt: 'Hình 7' },
            { url: '/src/assets/Products/tablets/tablet8.jpg', alt: 'Hình 8' },
            { url: '/src/assets/Products/tablets/tablet9.jpg', alt: 'Hình 9' },
            { url: '/src/assets/Products/tablets/tablet10.jpg', alt: 'Hình 10' },
        ],
        '6': [ // Camera
            { url: '/src/assets/Products/monitors/monitor1.jpg', alt: 'Hình 1' },
            { url: '/src/assets/Products/monitors/monitor2.jpg', alt: 'Hình 2' },
            { url: '/src/assets/Products/monitors/monitor3.jpg', alt: 'Hình 3' },
            { url: '/src/assets/Products/monitors/monitor4.jpg', alt: 'Hình 4' },
            { url: '/src/assets/Products/monitors/monitor5.jpg', alt: 'Hình 5' },
            { url: '/src/assets/Products/monitors/monitor6.jpg', alt: 'Hình 6' },
            { url: '/src/assets/Products/monitors/monitor7.jpg', alt: 'Hình 7' },
            { url: '/src/assets/Products/monitors/monitor8.jpg', alt: 'Hình 8' },
            { url: '/src/assets/Products/monitors/monitor9.jpg', alt: 'Hình 9' },
            { url: '/src/assets/Products/monitors/monitor10.jpg', alt: 'Hình 10' },
            { url: '/src/assets/Products/monitors/monitor11.jpg', alt: 'Hình 11' },
        ],
        // Thêm các thể loại khác tại đây
    };

    const [selectedImages, setSelectedImages] = useState([]);
    const availableImages = categoryImages[categoryId] || []; // Lấy hình ảnh theo categoryId

    const handleImageSelect = (image) => {
        const alreadySelected = selectedImages.some(selected => selected.url === image.url);

        if (alreadySelected) {
            // Nếu ảnh đã được chọn, bỏ chọn
            const updatedImages = selectedImages.filter(selected => selected.url !== image.url);
            setSelectedImages(updatedImages);
        } else {
            // Nếu chưa chọn, thêm vào danh sách đã chọn
            setSelectedImages(prev => [...prev, image]);
        }
    };

    useEffect(() => {
        onImagesChange(selectedImages); // Gửi danh sách ảnh đã chọn về component cha
    }, [selectedImages]);

    return (
        <div className="image-uploader">
            <h3 className="font-semibold mb-2">Chọn hình ảnh:</h3>
            <div className="grid grid-cols-6 gap-4">
                {availableImages.map((image, index) => (
                    <div key={index} className="relative border rounded">
                        <img src={image.url} alt={image.alt} className="w-full h-32 object-cover rounded" />
                        <button 
                            onClick={() => handleImageSelect(image)} 
                            className={`absolute text-xs font-semibold top-1 right-1 rounded-full p-1 ${selectedImages.some(selected => selected.url === image.url) ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
                        >
                            <FontAwesomeIcon icon={selectedImages.some(selected => selected.url === image.url) ? faMinus : faPlus} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ImageUploader;