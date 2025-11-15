import React from 'react';
import Slider from 'react-slick';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const NextArrow = ({ onClick }) => (
  <button 
    onClick={onClick}
    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center 
               bg-white/80 hover:bg-white rounded-full shadow-md transition-all duration-200"
  >
    <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4 md:w-6 md:h-6 text-gray-700" />
  </button>
);

const PrevArrow = ({ onClick }) => (
  <button 
    onClick={onClick}
    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center 
               bg-white/80 hover:bg-white rounded-full shadow-md transition-all duration-200"
  >
    <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4 md:w-6 md:h-6 text-gray-700" />
  </button>
);

const Banner = () => {
    const banners = [
        { id: 1, image: "/src/assets/Home/banner1.png", alt: "Banner 1", link: "#" },
        { id: 2, image: "/src/assets/Home/banner2.png", alt: "Banner 2", link: "#" },
        { id: 3, image: "/src/assets/Home/banner3.png", alt: "Banner 3", link: "#" },
        { id: 4, image: "/src/assets/Home/banner4.png", alt: "Banner 4", link: "#" },
        // { id: 5, image: "/src/assets/Home/banner5.png", alt: "Banner 5", link: "#" }
    ];

    const settings = {
        dots: false,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        arrows: true,
        adaptiveHeight: true,
        autoplay: true,           // Bật tính năng tự động trượt
        autoplaySpeed: 2000,      // Thời gian giữa các lần trượt (3 giây)
    };

    // Group banners into pairs for each slide
    const bannerPairs = [];
    for (let i = 0; i < banners.length; i += 2) {
        bannerPairs.push(banners.slice(i, i + 2));
    }

    return (
        <div className="max-w-full overflow-hidden">
            <div className="container mx-auto px-2 sm:px-4 lg:px-20 mt-5 relative">
                <Slider {...settings}>
                    {bannerPairs.map((pair, index) => (
                        <div 
                            key={index} 
                            className="relative grid-important grid-cols-2 gap-4"
                        >
                            {pair.map(banner => (
                                <div key={banner.id} className='flex items-center justify-center'>
                                    <Link to={banner.link} className="block relative overflow-hidden rounded-xl">
                                        <img 
                                            src={banner.image} 
                                            alt={banner.alt} 
                                            className="w-full h-auto object-cover" 
                                        />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
};

export default Banner;