import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

interface ImageSliderProps {
  images: string[];
}

const ImageSlider = ({ images }: ImageSliderProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    return (
        <div className="md:w-[317px] md:h-[227px] w-full h-[210px] relative group overflow-hidden">
            <div className="relative flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {images.map((image, index) => (
                    <div key={index} className="w-full flex-shrink-0">
                        <Image
                            src={image}
                            alt={`Slide ${index + 1}`}
                            width={800}
                            height={400}
                            className="object-fit overflow-hidden"
                            priority={index === currentIndex}
                        />
                    </div>
                ))}
            </div>
            <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full focus:outline-none hover:bg-opacity-75"
            >
                <ChevronLeft className="h-6 w-6 text-white" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full focus:outline-none hover:bg-opacity-75"
            >
                <ChevronRight className="h-6 w-6 text-white" />
            </button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                    <span
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`block w-3 h-3 rounded-full cursor-pointer ${currentIndex === index
                            ? "bg-[#5297ff]"
                            : "bg-white"
                            }`}
                    ></span>
                ))}
            </div>
        </div>
    );
};

export default ImageSlider;
