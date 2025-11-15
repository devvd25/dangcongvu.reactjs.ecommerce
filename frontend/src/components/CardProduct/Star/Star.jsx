import React from 'react';
import yellow from '../../../assets/Products/starYellow.svg'
import gray from '../../../assets/Products/starGray.svg'
import half from '../../../assets/Products/starHalf.svg'
const Star = ({ type }) => {
  const starImages = {
    yellow: yellow,
    gray: gray,
    half: half,
  };

  return (
    <img
      className='cursor-pointer'  
      src={starImages[type]} // Chọn hình ảnh dựa trên kiểu sao
      alt={`${type} star`}
      style={{ width: '16px', height: '16px', marginRight: '4px' }} // Bạn có thể thay đổi kích thước ở đây
    />
  );
};

// StarDisplay component (hiển thị số sao với các loại sao khác nhau)
const StarDisplay = ({ rating, totalStars = 5 }) => {
  return (
    <div style={{ display: 'flex' }}>
      {[...Array(totalStars)].map((_, index) => {
        let type = 'gray'; // Mặc định là sao rỗng
        if (index < Math.floor(rating)) {
          type = 'yellow'; // Sao đầy
        } else if (index < rating) {
          type = 'half'; // Nửa sao
        }

        return <Star key={index} type={type} />
        ;
      })}
    </div>
  );
};

export default StarDisplay;
