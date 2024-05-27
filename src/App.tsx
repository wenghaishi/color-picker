import React, { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [file, setFile] = useState(null);
  const [pixelColor, setPixelColor] = useState("");
  const [averageColor, setAverageColor] = useState("");
  const [dominantColor, setDominantColor] = useState("");

  const isWhitish = (r, g, b) => {
    const threshold = 200; // Consider colors with RGB values greater than this as whitish
    return r > threshold && g > threshold && b > threshold;
  };

  const calculateDominantColor = (ctx, width, height) => {
    const colorCount = {};
    let maxCount = 0;
    let dominantColor = "";

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        if (!isWhitish(pixel[0], pixel[1], pixel[2])) {
          const color = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
          if (colorCount[color]) {
            colorCount[color]++;
          } else {
            colorCount[color] = 1;
          }

          if (colorCount[color] > maxCount) {
            maxCount = colorCount[color];
            dominantColor = color;
          }
        }
      }
    }

    setDominantColor(dominantColor);
    console.log("Dominant color:", dominantColor);
  };

  useEffect(() => {
    if (file) {
      const img = imgRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        calculateDominantColor(ctx, img.naturalWidth, img.naturalHeight);
      };
    }
  }, [file]);

  const handleChange = (e) => {
    setFile(URL.createObjectURL(e.target.files[0]));
  };

  const getPixelColor = (ctx, x, y) => {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const color = getPixelColor(ctx, x, y);
    setPixelColor(color);
  };

  const getAverageColor = (ctx, x, y, inset) => {
    let reds = 0,
      greens = 0,
      blues = 0;
    let numPixels = 0;

    for (let dx = -inset; dx <= inset; dx++) {
      for (let dy = -inset; dy <= inset; dy++) {
        const pixel = ctx.getImageData(x + dx, y + dy, 1, 1).data;
        reds += pixel[0];
        greens += pixel[1];
        blues += pixel[2];
        numPixels++;
      }
    }

    const red = Math.round(reds / numPixels);
    const green = Math.round(greens / numPixels);
    const blue = Math.round(blues / numPixels);

    return `rgb(${red}, ${green}, ${blue})`;
  };

  const handleClick = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const color = getAverageColor(ctx, x, y, 20);
    setAverageColor(color);
  };

  return (
    <>
      <h2>{file ? "Your Image:" : "Add image:"}</h2>
      <input type="file" onChange={handleChange} />
      {file && (
        <img
          ref={imgRef}
          src={file}
          alt="Uploaded"
          style={{ display: "none" }}
        />
      )}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        style={{ height: "500px", width: "500px" }}
      />
      <div className="color-display-container">
        {pixelColor && (
          <div className="color-display">
            <h3>Pixel Color</h3>
            <div
              className="color-box"
              style={{
                backgroundColor: pixelColor,
              }}
            />
            <h2>{pixelColor}</h2>
          </div>
        )}
        {dominantColor && (
          <div className="color-display">
            <h3>Dominant Color (excluding white)</h3>
            <div
              className="color-box"
              style={{
                backgroundColor: dominantColor,
              }}
            />
            <h2>{dominantColor}</h2>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
