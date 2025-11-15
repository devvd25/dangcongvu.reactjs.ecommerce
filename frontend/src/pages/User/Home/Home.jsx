import React, { useEffect, useState } from "react";
import { userAPI } from "../../../api/userApi";
import FlashSales from "./FlashSales/FlashSales";
import BoxChatWithToggle from "../../../components/BoxChatWithToggle/BoxChatWithToggle";
import { Link } from "react-router-dom";
import imgFlashSales from '../../../assets/Home/flashSales.png';
import highQuality from '../../../assets/Home/highQuality.png';
import samsung from '../../../assets/Home/samsung.png';
import Footer from "../../../components/Footer/Footer";
import Navbar from "../../../components/Navbar/Navbar";
import Banner from "./Banner/Banner";

function normalizeCategoriesResponse(res) {
  // res may be axios response or raw data
  const d = res && res.data !== undefined ? res.data : res;
  // if it's already an array
  if (Array.isArray(d)) return d;
  // if back-end wraps in { categories: [...] } or { data: [...] }
  if (d && Array.isArray(d.categories)) return d.categories;
  if (d && Array.isArray(d.data)) return d.data;
  // if it's an object map like { id1: {...}, id2: {...} }
  if (d && typeof d === "object") {
    // try to extract array-like values
    const vals = Object.values(d).filter(v => v && (v.name || v._id || v.id));
    if (vals.length) return vals;
  }
  return [];
}

function Home() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentCategory, setCurrentCategory] = useState('flashSale'); 

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await userAPI.category.getAll();
                const list = normalizeCategoriesResponse(response);
                setCategories(list);
            } catch (err) {
                console.error("fetch categories error:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) return <p className="p-4">Đang tải...</p>;
    if (error) return <p className="p-4">Có lỗi khi tải thể loại: {error.message ?? String(error)}</p>;

    const handleCategoryChange = (category) => {
        setCurrentCategory(category);
    };

    // helper to get id and image safely
    const getId = (c) => c._id ?? c.id ?? c.categoryId ?? c.key ?? "";
    const getImage = (c) => {
      if (!c) return null;
      if (typeof c.image === "string" && c.image.trim()) return c.image;
      if (Array.isArray(c.images) && c.images.length) return c.images[0];
      if (typeof c.img === "string" && c.img.trim()) return c.img;
      return null; // fallback handled below
    };

    const placeholder = "https://via.placeholder.com/80x80?text=No+Img";

    return ( 
        <>
            <div className="bg-[#f2f4f7] min-h-screen">
                <Navbar />
                <Banner />
                <div className ="container mx-auto px-4 lg:px-20 mt-6">
                    <div className="text-2xl font-semibold">Danh mục</div>
                    <div className="bg-white rounded-xl mt-5 p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                            {(Array.isArray(categories) ? categories : []).map((category) => {
                                const id = getId(category);
                                const img = getImage(category) || placeholder;
                                const name = category.name ?? category.title ?? category.label ?? "Không tên";
                                return (
                                  <Link key={id || name} to={`/category/${id || name}`}>
                                    <div className="col-span-1 py-4 hover:bg-gray-100 transition duration-150 ease-in-out cursor-pointer rounded">
                                        <img src={img} alt={name} className="w-20 h-20 mx-auto p-2 object-cover rounded" />
                                        <div className="mt-2 text-center text-sm">{name}</div>
                                    </div>
                                  </Link>
                                );
                            })}
                        </div>
                        {(!Array.isArray(categories) || categories.length === 0) && (
                          <div className="p-4 text-gray-500 text-center">Hiện chưa có danh mục</div>
                        )}
                    </div>
                </div>
                <div className="container mx-auto px-4 lg:px-20 mt-6">
                    <div className="text-2xl font-semibold mt-5">Khuyến mãi Online</div>
                    <div className='bg-white rounded-b-xl'>
                        <div className="bg-white rounded-t-xl flex border-b-2 justify-start mt-3">
                            <button 
                                className={`cursor-pointer w-36 px-6 py-3 h-auto ${currentCategory === 'flashSale' ? 'bg-[#f1f8fe] border-b-2 border-[#2A83E9]' : ''}`}
                                onClick={() => handleCategoryChange('flashSale')}
                            >
                                <img src={imgFlashSales} alt="Flash Sales" />
                            </button>
                            <button 
                                className={`cursor-pointer w-36 px-6 py-3 h-auto ${currentCategory === 'highQuality' ? 'bg-[#f1f8fe] border-b-2 border-[#2A83E9]' : ''}`}
                                onClick={() => handleCategoryChange('highQuality')}
                            >
                                <img src={highQuality} alt="High Quality" />
                            </button>
                            <button 
                                className={`cursor-pointer w-36 px-6 py-3 h-auto ${currentCategory === 'samsung' ? 'bg-[#f1f8fe] border-b-2 border-[#2A83E9]' : ''}`}
                                onClick={() => handleCategoryChange('samsung')}
                            >
                                <img src={samsung} alt="Samsung" />
                            </button>
                        </div>
                        <FlashSales categoryFlashSale={currentCategory} />
                    </div>
                </div>
            </div>
            <BoxChatWithToggle />
            <Footer />
        </>
    );
}

export default Home;
