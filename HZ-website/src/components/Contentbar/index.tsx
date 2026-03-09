import React, { useState, useEffect } from 'react';
import Image from 'next/legacy/image';
import SearchIcon from '@mui/icons-material/Search';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from './index.module.scss';
import { slickSettings } from '../settings';

const ContentBar = () => {
  const [city, setCity] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleSearch = (e: any) => {
    setCity(e.target.value);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % slickSettings.slidesToShow
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.img_container}>
      <h2 className={styles.title}>
        DREAM<span className={styles.highlight}>CASA</span>
      </h2>
      <p className={styles.themes}>RIGHT PATH TO DREAM KEY</p>
      {/* <p className={styles.globe}>
        <Image
          src="/gifs/global.gif"
          alt="global_cover"
          layout="fill"
          objectFit="cover"
        />
      </p> */}
      <p className={styles.quore}>
        Discover more by browsing your premier destination for all things in
        real estate
      </p>

      <Slider {...slickSettings}>
        <div className={styles.img_wrap}>
          <div className={styles.imageContainer}>
            <Image
              src="/images/scrooler/city3.jpg"
              alt="content_bar_img"
              layout="fill"
              objectFit="cover"
            />
          </div>
        </div>
        <div className={styles.img_wrap}>
          <div className={styles.imageContainer}>
            <Image
              src="/images/scrooler/city1.jpg"
              alt="content_bar_img"
              layout="fill"
              objectFit="cover"
            />
          </div>
        </div>
        <div className={styles.img_wrap}>
          <div className={styles.imageContainer}>
            <Image
              src="/images/scrooler/city2.jpg"
              alt="content_bar_img"
              layout="fill"
              objectFit="cover"
            />
          </div>
        </div>
      </Slider>
      <div className={styles.search_bar}>
        <div>
          <input
            type="text"
            placeholder="Search the city"
            className={styles.search_input}
            value={city}
            onChange={handleSearch}
          />
        </div>
        <div>
          <SearchIcon className={styles.search_icon} />
        </div>
      </div>
    </div>
  );
};

export default ContentBar;
