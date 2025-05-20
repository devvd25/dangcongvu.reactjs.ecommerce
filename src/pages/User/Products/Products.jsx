import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import Banner from "../Home/Banner/Banner";
import { userAPI } from "../../../api/userApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import path from "../../../constants/path";
import CardProduct from "../../../components/CardProduct/CardProduct";
import Footer from "../../../components/Footer/Footer";

function Products() {
    const { categoryId } = useParams();
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState("");

    // Paginate state
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(10); // Số sản phẩm mỗi trang

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await userAPI.category.getById(categoryId);
                setCategory(response.data);
            } catch (error) {
                console.error("Error fetching category:", error);
            }
        };

        const fetchProducts = async () => {
            try {
                const response = await userAPI.product.getAll();
                const filteredProducts = response.data.filter(product => product.categoryId === categoryId);
                setProducts(filteredProducts);
            } catch (error) {
                console.error("Error fetching products:", error);
                setError("Failed to fetch products.");
            } finally {
                setLoading(false);
            }
        };

        fetchCategory();
        fetchProducts();
    }, [categoryId]);

    // Lọc sản phẩm theo từ khóa tìm kiếm
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchText.toLowerCase())
    );

    // Tính toán sản phẩm hiển thị
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <>
            <div className="bg-[#f2f4f7] min-h-screen">
                <Navbar />
                <div className="container mx-auto px-4 lg:px-20 mt-4">
                    {category ? (
                        <div className="flex text-base mb-2 text-gray-500 items-center gap-2">
                            <Link to={path.home}>
                                <span className="hover:text-blue-500 cursor-pointer">Trang chủ </span>
                            </Link>
                            <FontAwesomeIcon className="text-xs" icon={faChevronRight} />
                            <h2 className="text-blue-500">{category.name}</h2>
                        </div>
                    ) : (
                        <div className="text-center mt-6">
                            <p>Đang tải...</p>
                        </div>
                    )}
                </div>
                <Banner />
                <div className="container mx-auto px-4 lg:px-20 mt-4 py-4">
                    <div className="bg-white p-4 rounded-xl">
                        {/* Tìm kiếm sản phẩm */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="p-2 border border-gray-300 rounded w-full"
                            />
                        </div>

                        {loading ? (
                            <div className="text-center mt-4">
                                <p>Đang tải sản phẩm...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center mt-4">
                                <p>{error}</p>
                            </div>
                        ) : currentProducts.length > 0 ? (
                            <div className='grid grid-cols-5 gap-2 mt-5'>
                                {currentProducts.map(product => (
                                    <div key={product.id} className="col-span-1">
                                        <CardProduct product={product} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center mt-4">
                                <p>Không tìm thấy sản phẩm nào trong danh mục này.</p>
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="flex justify-center mt-4">
                            {totalPages > 1 && (
                                <>
                                    {/* Hiển thị nút trang 1 */}
                                    <button onClick={() => handlePageChange(1)} className="mx-1 rounded-full px-3 py-1 bg-gray-200 text-gray-700 hover:bg-blue-600">1</button>
                                    
                                    {/* Hiển thị dấu ... nếu cần */}
                                    {currentPage > 3 && <span className="mx-1">...</span>}
                                    
                                    {/* Tính các nút trang */}
                                    {Array.from({ length: Math.min(4, totalPages) }, (_, index) => {
                                        let pageNumber = index + Math.max(2, currentPage - 1);
                                        if (pageNumber <= totalPages && pageNumber !== 1) {
                                            return (
                                                <button
                                                    key={pageNumber}
                                                    onClick={() => handlePageChange(pageNumber)}
                                                    className={`mx-1 rounded-full px-3 py-1 ${currentPage === pageNumber ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-600`}
                                                >
                                                    {pageNumber}
                                                </button>
                                            );
                                        }
                                        return null;
                                    })}

                                    {/* Hiển thị dấu ... nếu cần */}
                                    {currentPage < totalPages - 2 && <span className="mx-1">...</span>}
                                    
                                    {/* Hiển thị nút trang cuối */}
                                    {currentPage < totalPages && (
                                        <button onClick={() => handlePageChange(totalPages)} className="mx-1 rounded-full px-3 py-1 bg-gray-200 text-gray-700 hover:bg-blue-600">{totalPages}</button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Products;