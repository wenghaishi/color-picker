import { useEffect, useRef, useState, ChangeEvent, MouseEvent } from "react";
import "./App.css";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [file, setFile] = useState<string | null>(null);
  const [pixelColor, setPixelColor] = useState<string>("");
  const [averageColor, setAverageColor] = useState<string>("");
  const [dominantColor, setDominantColor] = useState<string>("");

  const isWhitish = (r: number, g: number, b: number) => {
    const threshold = 200; // Consider colors with RGB values greater than this as whitish
    return r > threshold && g > threshold && b > threshold;
  };

  const calculateDominantColor = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const colorCount: Record<string, number> = {};
    let maxCount = 0;
    let dominantColor = "";

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const alpha = data[i + 3];
      if (alpha > 0 && !isWhitish(r, g, b)) {
        const color = `rgb(${r},${g},${b})`;
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

    setDominantColor(dominantColor);
    console.log("Dominant color:", dominantColor);
  };

  useEffect(() => {
    if (file) {
      const img = imgRef.current;
      const canvas = canvasRef.current;
      if (img && canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          img.onload = () => {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);
            calculateDominantColor(ctx, img.naturalWidth, img.naturalHeight);
          };
        }
      }
    }
  }, [file]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(URL.createObjectURL(e.target.files[0]));
    }
  };

  const getPixelColor = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ) => {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const color = getPixelColor(ctx, x, y);
        setPixelColor(color);
      }
    }
  };

  const getAverageColor = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    inset: number
  ) => {
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

  const handleClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const color = getAverageColor(ctx, x, y, 20);
        setAverageColor(color);
        console.log(averageColor);
      }
    }
  };

  return (
    <>
      <h1>Color picker</h1>
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
