"use client";
import React, { useState, useEffect, ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "@/common/Button";
import { useSession } from "next-auth/react";
import Navbar from "../GeneralLayout/Navbar";


export interface User {
  id: string;
  username?: string;
  fullName?: string;
  email: string;
  phone?: string;
  token?: string;
  roles: {
    id: string;
    roleName: string;
  };
}

const PackLayout = (page: ReactElement) => {



  const logo_place_holder = {
    packagesImage: "/images/packagebg.jpg",
    imageUrl: "/images/logobb.png",
  };



  return (
    <>
      <Navbar isVisibleItems={false} />
      <div>
        {page}
      </div>


    </>
  );
};

function PackageLayout(c: any) {
  c.getLayout = PackLayout
  return c;
}
export default PackageLayout
