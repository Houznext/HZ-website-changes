import React from 'react';
import styles from './index.module.scss';
import Image from 'next/legacy/image';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Link from 'next/link';

interface PropListCardProps {
  imageSrc: string;
  title: string;
  location: string;
  size: string;
  bedrooms: number;
  readyBy: string;
  type: string;
  priceRange: string;
}

const PropListCard: React.FC<PropListCardProps> = ({
  imageSrc,
  title,
  location,
  size,
  bedrooms,
  readyBy,
  type,
  priceRange,
}: PropListCardProps) => {
  return (
    <div className={styles.main_container}>
      <div className={styles.img_cont}>
        <Image src={imageSrc} alt="Property Image" layout="fill" objectFit="cover" />
      </div>
      <div className={styles.info_cont}>
        <p className={styles.title}>{title}</p>
        <div className={styles.location_cont}>
          <LocationOnIcon className={styles.locationIcon} />
          <p className={styles.location}>{location}</p>
        </div>
        <div className={styles.measurement}>
          <p>{size}</p>
          <p>BedRooms: {bedrooms}</p>
        </div>
        <div className={styles.year_constructed}>
          <p>Ready by: {readyBy}</p>
          <p>Type: {type}</p>
        </div>
      </div>
      <div className={styles.price_cont}>
        <p className={styles.price}>{priceRange}</p>
        <Link className={styles.view_more} href={'/'}>View More</Link>
      </div>
    </div>
  );
};

export default PropListCard;
