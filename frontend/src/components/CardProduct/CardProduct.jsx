import { Link } from "react-router-dom";

function CardProduct({ product }) {
    return ( 
        <Link to={`/category/${product.categoryId}/product/${product.id}`} className="cursor-pointer">
        
            <div className='p-2 border rounded group h-full'>
                <div className='text-[10px] bg-[#f1f1f1] text-[#333] rounded w-max px-3 py-[2px]'>Trả góp 0%</div>
                <div className="py-2">
                    <img className='w-full h-44 mt-4 transition-transform duration-300 group-hover:translate-y-[-5px]' src={product.images[0]?.url} alt={product.images[0]?.alt} />

                </div>
                <div className='text-sm line-clamp-2 font-medium group-hover:text-[#2a83e9] min-h-10'>                                
                    {product.name}
                </div>
                <div className='mt-1 text-[10px] text-gray-600 line-clamp-2'>                                
                    {product.description}
                </div>
                <div className='mt-3 text-[#dd2f2c] text-xl font-semibold'>
                    {product.discountPrice.toLocaleString()}₫
                </div>
                <div className='text-[#a4a4a4] line-through italic'>
                    {product.salePrice.toLocaleString()}₫
                </div>
                <div className='mt-2 bg-[#F1F8FE] rounded py-2 px-6 text-sm text-[#2a83e9] text-center font-semibold'>
                    Mua ngay
                </div>
            </div>
        </Link>
    );
}

export default CardProduct;