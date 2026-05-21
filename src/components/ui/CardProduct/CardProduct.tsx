"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import React, { JSX } from "react";
import s from "./CardProduct.module.css";
import { ProductListItem } from "@/types/product";
import { useMedia } from "@/lib/Media";
import { LocalizedLink } from "../LocalizedLink";

type Props = {
  product: ProductListItem;
  idx: number;
  className?: string;
  style?: React.CSSProperties;
  variants: Variants;
};

export default function CardProduct({
  product,
  idx,
  className,
  variants,
  style,
}: Props): JSX.Element {
    const isMobile = useMedia("(max-width: 768px)");

  const CardInner = (
    <>
      <div className={s.media}>
        <Image
          src={isMobile ? product.imgMob || product.img : product.img}
          alt={product.titleShort}
          width={600}
          height={400}
          priority={idx < 2}
          className={`${s.image} ${className || ""}`}
        />
        <div className={s.overlay} />
      </div>

      <div className={s.info}>
        <h3 className={s.type} dangerouslySetInnerHTML={{__html:product.titleShort}}></h3>
        <p className={s.description} dangerouslySetInnerHTML={{__html:product.description}}></p>
        <p className={s.fullName} dangerouslySetInnerHTML={{__html:product.titleFull}}></p>

      </div>
    </>
  );

  return (
    <motion.article
      className={s.card}
      variants={variants}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      layout
      style={style}
    >
      {product.slug ? (
        <LocalizedLink href={`/products/${product.slug}`} className={s.link}>
          {CardInner}
        </LocalizedLink>
      ) : (
        <div className={s.link}>{CardInner}</div>
      )}
    </motion.article>
  );
}