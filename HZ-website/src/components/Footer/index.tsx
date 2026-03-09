import React, { useState } from 'react';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import styles from './index.module.scss';

const Footer = () => {
  const [active, setActive] = useState('');
  const [show, setShow] = useState(true);
  console.log(show);
  return (
    <div className={styles.footer_main}>
      <div className={styles.list_cont}>
        <div>
          <h2
            className={styles.title_cont}
            onClick={() => {
              setActive('About us');
              if (active == 'About us') {
                setShow(!show);
              } else {
                setShow(true);
              }
            }}
          >
            CONTACT US:{' '}
            {active === 'About us' && show ? (
              <span className={`${styles.arrow}`}>
                <KeyboardArrowDownIcon />
              </span>
            ) : (
              <span className={`${styles.arrow}`}>
                <KeyboardArrowUpIcon />
              </span>
            )}
          </h2>
          <div className={styles.item_cont_desktop}>
            <div className="">
              <span className="">
                <LocalPhoneIcon /> Between 9AM to 9PM :
              </span>
              <p className={styles.bold}>+918897574909</p>
            </div>
            <div className={''}>
              <div>
                <span className="">
                  <WhatsAppIcon /> Whatsapp Message at :
                </span>
                <p className={styles.bold}>+918897574909</p>
              </div>
            </div>
            <div className="">
              <div>
                <span className="">
                  <EmailIcon /> Email us at :
                </span>
                <p className={styles.bold}>sales@gmail.com</p>
              </div>
            </div>
            <div>
              <span className="">
                <LocationOnIcon /> Cooperate office:
              </span>
              <p className={styles.bold}>
                Gowra fountainhead ,Madhapur, Hyderabad ,Telangana
              </p>
            </div>
          </div>
          {active === 'About us' && show && (
            <div className={styles.item_cont_mob}>
              <div className="">
                <span className="">
                  <LocalPhoneIcon /> Between 9AM to 9PM :
                </span>
                <p className={styles.bold}>+918897574909</p>
              </div>
              <div className={''}>
                <div>
                  <span className="">
                    <WhatsAppIcon /> Whatsapp Message at :
                  </span>
                  <p className={styles.bold}>+918897574909</p>
                </div>
              </div>
              <div className="">
                <div>
                  <span className="">
                    <EmailIcon /> Email us at :
                  </span>
                  <p className={styles.bold}>sales@gmail.com</p>
                </div>
              </div>
              <div>
                <span className="">
                  <LocationOnIcon /> Cooperate office:
                </span>
                <p className={styles.bold}>
                  Gowra fountainhead ,Madhapur, Hyderabad ,Telangana
                </p>
              </div>
            </div>
          )}
        </div>
        <div>
          <h2
            className={styles.title_cont}
            onClick={() => {
              setActive('OneCasa');
              if (active == 'OneCasa') {
                setShow(!show);
              } else {
                setShow(true);
              }
            }}
          >
            ONECASA{' '}
            {active === 'OneCasa' && show ? (
              <span className={`${styles.arrow}`}>
                <KeyboardArrowDownIcon />
              </span>
            ) : (
              <span className={`${styles.arrow}`}>
                <KeyboardArrowUpIcon />
              </span>
            )}
          </h2>
          <ul className={`${styles.pc_list}`}>
            <li>Home</li>
            <li>Properties</li>
            <li>Blogs</li>
            <li>Contact Us</li>
            <li>About us</li>
            <li>Career</li>
            <li>Refer us</li>
            <li>Privacy policy</li>
          </ul>
          {active === 'OneCasa' && show && (
            <ul className={`${styles.mob_list}`}>
              <li>Home</li>
              <li>Properties</li>
              <li>Blogs</li>
              <li>Contact Us</li>
              <li>About us</li>
              <li>Career</li>
              <li>Refer us</li>
              <li>Privacy policy</li>
            </ul>
          )}
        </div>

        <div>
          <h2
            className={styles.title_cont}
            onClick={() => {
              setActive('Follow us');
              if (active == 'Follow us') {
                setShow(!show);
              } else {
                setShow(true);
              }
            }}
          >
            FOLLOW US{' '}
            {active === 'Follow us' && show ? (
              <span className={`${styles.arrow}`}>
                <KeyboardArrowDownIcon />
              </span>
            ) : (
              <span className={`${styles.arrow}`}>
                <KeyboardArrowUpIcon />
              </span>
            )}
          </h2>
          <ul className={`${styles.follow_pc} text-[16px] font-normal`}>
            <li className="mb-2">
              <FacebookIcon /> Facebook
            </li>
            <li className="mb-[6px]">
              <TwitterIcon />
              Twitter
            </li>
            <li className="mb-[6px]">
              <YouTubeIcon /> Youtube
            </li>
            <li className="mb-[6px]">
              <InstagramIcon /> Instagram
            </li>
            <li className="mb-[6px]">
              <LinkedInIcon /> LinkedIn
            </li>
          </ul>
          {active === 'Follow us' && show && (
            <ul className={`${styles.follow_mob} text-[16px] font-normal`}>
              <li className="mb-2">
                <FacebookIcon /> Facebook
              </li>
              <li className="mb-[6px]">
                <TwitterIcon />
                Twitter
              </li>
              <li className="mb-[6px]">
                <YouTubeIcon /> Youtube
              </li>
              <li className="mb-[6px]">
                <InstagramIcon /> Instagram
              </li>
              <li className="mb-[6px]">
                <LinkedInIcon /> LinkedIn
              </li>
            </ul>
          )}
        </div>
      </div>
      <div className={styles.horiz_line}></div>
      <div className={styles.Copyrights}>
        ©2023 All Copyrights are Reserved to OneCasa Pvt limited.
      </div>
    </div>
  );
};

export default Footer;
