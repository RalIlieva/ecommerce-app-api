// src/components/ImageGallery.tsx
import React, { useState } from 'react';
import { Carousel } from 'react-bootstrap';
import { ProductImage } from '../types';


interface ImageGalleryProps {
  images: ProductImage[];
  mainHeight?: string; // optional to control size
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, mainHeight = '500px' }) => {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex: number) => {
    setIndex(selectedIndex);
  };

  if (images.length === 0) {
    // Fallback if no images
    return (
      <img
        src="https://via.placeholder.com/500"
        alt="No images available"
        style={{ maxHeight: mainHeight, objectFit: 'cover' }}
        className="img-fluid rounded mb-4"
      />
    );
  }

  return (
    <Carousel activeIndex={index} onSelect={handleSelect}>
      {images.map((img) => (
        <Carousel.Item key={img.id}>
          <img
            className="d-block w-100"
            src={img.image_url}
            alt={img.alt_text || 'Product image'}
            style={{ maxHeight: mainHeight, objectFit: 'cover' }}
          />
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default ImageGallery;
