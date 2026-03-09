import type React from "react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "@mui/icons-material"

interface ImageSliderProps {
    images: string[]
    width?: number | string
    height?: number | string
    className?: string
    imageClassName?: string
    showArrows?: boolean
    showThumbnails?: boolean
    autoPlay?: boolean
    autoPlayInterval?: number
}

const ImageSlider: React.FC<ImageSliderProps> = ({
    images,
    width = "100%",
    height = "400px",
    className = "",
    imageClassName = "",
    showArrows = true,
    showThumbnails = true,
    autoPlay = false,
    autoPlayInterval = 5000,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (autoPlay) {
            interval = setInterval(nextSlide, autoPlayInterval)
        }
        return () => clearInterval(interval)
    }, [autoPlay, autoPlayInterval])

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1))
    }

    return (
        <div ref={containerRef} className={`flex flex-col ${className}`} style={{ width, height }}>
            <div className="relative overflow-hidden flex-grow" style={{ minHeight: "300px" }}>
                <Image
                    src={images[currentIndex] || "/placeholder.svg"}
                    alt={`Slide ${currentIndex + 1}`}
                    layout="fill"
                    objectFit="cover"
                    className={`w-full h-full ${imageClassName}`}
                    priority
                />
                {showArrows && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full focus:outline-none hover:bg-opacity-75 transition-opacity duration-300 z-10"
                            aria-label="Previous slide"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full focus:outline-none hover:bg-opacity-75 transition-opacity duration-300 z-10"
                            aria-label="Next slide"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    </>
                )}
            </div>
            {showThumbnails && (
                <div className="flex justify-center space-x-2 overflow-x-auto mt-2 px-2" style={{ height: "80px" }}>
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`flex-shrink-0 focus:outline-none ${currentIndex === index ? "border-2 border-[#3586FF]" : "border-2 border-transparent"}`}
                            aria-label={`Go to slide ${index + 1}`}
                        >
                            <div className="relative w-20 h-16 overflow-hidden">
                                <Image
                                    src={image || "/placeholder.svg"}
                                    alt={`Thumbnail ${index + 1}`}
                                    layout="fill"
                                    objectFit="cover"
                                    className="w-full h-full"
                                />
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ImageSlider

