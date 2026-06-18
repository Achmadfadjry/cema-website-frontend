'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ImageWithFallbackProps {
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
}

export function ImageWithFallback({
    src,
    alt,
    className = '',
    width,
    height,
}: ImageWithFallbackProps) {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        setHasError(true);
        // Fallback to a placeholder or default image
        setImgSrc('https://placehold.co/600x400?text=No+Image'); // You can change this to your preferred fallback
    };

    if (width && height) {
        return (
            <Image
                src={imgSrc}
                alt={alt}
                width={width}
                height={height}
                className={className}
                onError={handleError}
            />
        );
    }

    return (
        <img
            src={imgSrc}
            alt={alt}
            className={className}
            onError={handleError}
        />
    );
}
