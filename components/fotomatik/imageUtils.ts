/**
 * Fotomatik Image Utils
 */

import { FotomatikEditConfig } from '../../types/fotomatik';

// Helper to get dimensions after rotation and crop, but before resize
export const getProcessedDimensions = (
  originalWidth: number, 
  originalHeight: number, 
  config: FotomatikEditConfig
): { width: number; height: number } => {
  // 1. Rotation
  const isVertical = config.rotation === 90 || config.rotation === 270;
  const rotatedWidth = isVertical ? originalHeight : originalWidth;
  const rotatedHeight = isVertical ? originalWidth : originalHeight;

  // 2. Crop
  let finalWidth = rotatedWidth;
  let finalHeight = rotatedHeight;

  if (config.cropRatio > 0) {
    const currentRatio = rotatedWidth / rotatedHeight;
    if (currentRatio > config.cropRatio) {
      // Wider than target -> crop width
      finalWidth = rotatedHeight * config.cropRatio;
    } else {
      // Taller than target -> crop height
      finalHeight = rotatedWidth / config.cropRatio;
    }
  }

  return { width: Math.round(finalWidth), height: Math.round(finalHeight) };
};

// Helper to apply convolution matrix (for sharpness)
const applyConvolution = (imageData: ImageData, width: number, height: number, kernel: number[]) => {
  const side = Math.round(Math.sqrt(kernel.length));
  const halfSide = Math.floor(side / 2);
  const src = imageData.data;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return imageData;
  const output = ctx.createImageData(width, height);
  const dst = output.data;

  // Iterate through pixels
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;

      // Iterate through kernel
      for (let ky = 0; ky < side; ky++) {
        for (let kx = 0; kx < side; kx++) {
          const scy = y + ky - halfSide;
          const scx = x + kx - halfSide;

          if (scy >= 0 && scy < height && scx >= 0 && scx < width) {
            const srcOff = (scy * width + scx) * 4;
            const wt = kernel[ky * side + kx];
            r += src[srcOff] * wt;
            g += src[srcOff + 1] * wt;
            b += src[srcOff + 2] * wt;
          }
        }
      }

      const dstOff = (y * width + x) * 4;
      dst[dstOff] = r;
      dst[dstOff + 1] = g;
      dst[dstOff + 2] = b;
      dst[dstOff + 3] = src[dstOff + 3]; // Alpha
    }
  }
  return output;
};

// Helper to apply highlights and shadows
const applyHighlightsShadows = (imageData: ImageData, highlights: number, shadows: number) => {
  const data = imageData.data;
  const len = data.length;
  
  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const lumaNorm = luma / 255.0;

    let factor = 1.0;

    if (shadows !== 0) {
      const shadowWeight = Math.pow(1.0 - lumaNorm, 3);
      const sFactor = 1 + (shadows / 100) * 0.5;
      factor = factor * (1 * (1 - shadowWeight) + sFactor * shadowWeight);
    }

    if (highlights !== 0) {
       const highlightWeight = Math.pow(lumaNorm, 3);
       const hFactor = 1 + (highlights / 100) * 0.5;
       factor = factor * (1 * (1 - highlightWeight) + hFactor * highlightWeight);
    }

    if (factor !== 1.0) {
      data[i] = r * factor;
      data[i + 1] = g * factor;
      data[i + 2] = b * factor;
    }
  }
  return imageData;
};


export const processImage = async (base64Data: string, config: FotomatikEditConfig): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('No context')); return; }

      // 1. Handle Rotation Dimensions
      const isVertical = config.rotation === 90 || config.rotation === 270;
      const width = isVertical ? img.height : img.width;
      const height = isVertical ? img.width : img.height;

      canvas.width = width;
      canvas.height = height;

      // 2. Apply Filters (Brightness, Contrast, Saturation) & Transform
      ctx.filter = `brightness(${config.brightness}%) contrast(${config.contrast}%) saturate(${config.saturation}%)`;
      
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((config.rotation * Math.PI) / 180);
      
      // Apply Flip
      const scaleX = config.flipHorizontal ? -1 : 1;
      const scaleY = config.flipVertical ? -1 : 1;
      ctx.scale(scaleX, scaleY);

      // Draw image centered
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      // 2.5 Apply Pixel Manipulations (Sharpness, Highlights, Shadows)
      if (config.sharpness > 0 || config.highlights !== 0 || config.shadows !== 0) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (config.highlights !== 0 || config.shadows !== 0) {
          imageData = applyHighlightsShadows(imageData, config.highlights, config.shadows);
        }

        if (config.sharpness > 0) {
           const amount = config.sharpness / 100;
           const k = -1 * amount;
           const center = 1 + 4 * amount;
           const kernel = [
             0, k, 0,
             k, center, k,
             0, k, 0
           ];
           imageData = applyConvolution(imageData, canvas.width, canvas.height, kernel);
        }

        ctx.putImageData(imageData, 0, 0);
      }

      // 3. Handle Cropping
      let finalCanvas = canvas;

      if (config.cropRatio > 0) {
        const cropCanvas = document.createElement('canvas');
        const cropCtx = cropCanvas.getContext('2d');
        if (!cropCtx) { reject(new Error('No crop context')); return; }

        let cropWidth = width;
        let cropHeight = height;
        
        const currentRatio = width / height;
        
        if (currentRatio > config.cropRatio) {
          cropWidth = height * config.cropRatio;
        } else {
          cropHeight = width / config.cropRatio;
        }

        cropCanvas.width = cropWidth;
        cropCanvas.height = cropHeight;

        const cx = config.cropCenter?.x ?? 0.5;
        const cy = config.cropCenter?.y ?? 0.5;

        const slackW = width - cropWidth;
        const slackH = height - cropHeight;

        const sx = slackW * cx;
        const sy = slackH * cy;

        cropCtx.drawImage(
          canvas, 
          sx, sy, cropWidth, cropHeight, 
          0, 0, cropWidth, cropHeight
        );
        
        finalCanvas = cropCanvas;
      }

      // 4. Handle Resizing
      if (config.resize && config.resize.width > 0 && config.resize.height > 0) {
        const resizeCanvas = document.createElement('canvas');
        const resizeCtx = resizeCanvas.getContext('2d');
        if (!resizeCtx) { reject(new Error('No resize context')); return; }

        resizeCanvas.width = config.resize.width;
        resizeCanvas.height = config.resize.height;

        resizeCtx.drawImage(
          finalCanvas,
          0, 0, finalCanvas.width, finalCanvas.height,
          0, 0, config.resize.width, config.resize.height
        );
        
        finalCanvas = resizeCanvas;
      }

      resolve(finalCanvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = `data:image/png;base64,${base64Data}`;
  });
};

