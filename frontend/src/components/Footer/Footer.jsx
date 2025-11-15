import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t text-sm">
      <section className="py-10">
        <div className="container mx-auto grid grid-cols-4 gap-4">
          {/* Tổng đài hỗ trợ */}
          <div>
            <p className="font-bold mb-2">Tổng đài hỗ trợ</p>
            <p className='mt-2'>
            <span>Số Điện Thoại : </span> <Link  className="text-blue-500 font-bold">0985.702.931</Link> (8:00 - 21:30)
            </p>
            <p className='mt-2'>
              <span>Zalo : </span> <Link  className="text-blue-500 font-bold">0985.702.931</Link> (8:00 - 21:30)
            </p>
            <p className='mt-2'>
              <span>FB : </span> <Link  className="text-blue-500 font-bold">DANG CONG VU</Link> (8:00 - 21:00)
            </p>
          </div>

          {/* Về công ty */}
          <div>
            <p className="font-bold mb-2">Về công ty</p>
            <ul className="list-none">
            <li className='mt-2'><Link rel="nofollow" className="hover:underline">Giới thiệu công ty (3 Thành Viên)</Link></li>
              <li className='mt-2'><Link  rel="nofollow" className="hover:underline">DANG CONG VU</Link></li>
              <li className='mt-2'><Link  rel="nofollow" className="hover:underline">LUONG CHI BAO</Link></li>
              <li className='mt-2'><Link  rel="nofollow" className="hover:underline">DINH NGOC PHUOC</Link></li>
            </ul>
          </div>

          {/* Thông tin khác */}
          <div>
            <p className="font-bold mb-2">Thông tin khác</p>
            <ul className="list-none list-inside">
            <li className='mt-2'><Link  rel="nofollow" className="hover:underline">Tích điểm VIP</Link></li>
              <li className='mt-2'><Link rel="nofollow" target="_blank" className="hover:underline">VIP</Link></li>
              <li className='mt-2'><Link rel="nofollow" className="hover:underline">Lịch sử mua hàng</Link></li>
              <li className='mt-2'><Link rel="nofollow" className="hover:underline">Tìm hiểu về web</Link></li>
              <li className='mt-2'><Link className="hover:underline">Xem thêm</Link></li>
            </ul>
          </div>

          {/* Website cùng tập đoàn */}
          <div>
            <p className="font-bold mb-2">Website cùng Công Ty</p>
            <ul className="flex flex-wrap gap-2">
              <li>
                <Link to="https://donga.edu.vn/" target="_blank" rel="nofollow" aria-label="logo thegioididong" className="hover:underline text-blue-600 font-semibold">
                  Đông Á University
                </Link>
                <br />
                <Link to="https://github.com/devvd25/thuongmaidientu" target="_blank" rel="nofollow" aria-label="logo thegioididong" className="hover:underline text-blue-600 font-semibold">
                  Gihub Website
                </Link>
              </li>
              
            </ul>
          </div>
        </div>
      </section>
      <div className='bg-gray-200 py-4'>
        <div className="container mx-auto px-4 lg:px-20">
            <section className="text-center">
            <p className="text-sm">
            Copyright © 2024 - Dong A University
            </p>
            </section>
        </div>

      </div>
    </footer>
  );
};

export default Footer;