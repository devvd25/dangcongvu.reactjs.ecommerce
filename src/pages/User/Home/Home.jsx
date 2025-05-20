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

function Home() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentCategory, setCurrentCategory] = useState('flashSale'); 

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await userAPI.category.getAll();
                setCategories(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p>Có lỗi khi tải thể loại: {error.message}</p>;

    const handleCategoryChange = (category) => {
        setCurrentCategory(category);
    };

    return ( 
        <>
            <div className="bg-[#f2f4f7] min-h-screen">
                <Navbar />
                <Banner />
                <div className ="container mx-auto px-4 lg:px-20 mt-6">
                    <div className="text-2xl font-semibold">Danh mục</div>
                    <div className="bg-white rounded-xl mt-5">
                        <div className="grid grid-cols-6 gap-4">
                            {categories.map((category) => (
                                <Link key={category.id} to={`/category/${category.id}`}>
                                    <div className="col-span-1 py-4 hover:bg-gray-300 transition duration-150 ease-in-out cursor-pointer">
                                        <img src={category.image} alt={category.name} className="w-20 h-auto mx-auto p-2 object-cover rounded" />
                                        <div className="mt-2 text-center">{category.name}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
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