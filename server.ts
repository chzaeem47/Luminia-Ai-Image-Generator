import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Endpoint for generating images (Free Tier - Pollinations Engine)
  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt, aspectRatio, style } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      // 1. Refine prompt based on selected style to achieve premium rendering
      let finalPrompt = prompt;
      if (style === "Neon Dystopia") {
        finalPrompt = `${prompt}, cyberpunk aesthetic, neon dystopia style, rain-slicked obsidian streets reflecting bright neon magenta and cyan, hover vehicles, atmospheric fog, high-contrast, razor-sharp details`;
      } else if (style === "Cosmic Impasto") {
        finalPrompt = `${prompt}, oil painting impasto style, thick textured brushstrokes, swirling cosmic nebula, deep black void blended with explosive violet and cyan, classical paint texture, masterpiece`;
      } else if (style === "Prismatic Void") {
        finalPrompt = `${prompt}, 3d render, abstract geometric crystalline structure floating in dark void, complex refraction, subsurface scattering, glass-like surfaces, inner glow of blue and purple, high-contrast studio lighting, immaculate obsidian reflections`;
      } else if (style === "Anime/Digital Art") {
        finalPrompt = `${prompt}, stunning anime digital art style, vibrant colors, clean outlines, detailed background, dynamic lighting, anime cinematic key visual`;
      } else if (style === "Watercolor") {
        finalPrompt = `${prompt}, delicate watercolor painting, soft pigment flows, textured paper, hand-drawn detailing, artistic pastel tones`;
      } else if (style === "Photorealistic") {
        finalPrompt = `${prompt}, ultra-realistic, natural lighting, high fidelity, shot on 85mm lens, real scenic view, extremely detailed, depth of field`;
      }

      // URL-encode the final stylized prompt string
      const encodedPrompt = encodeURIComponent(finalPrompt);
      
      // 2. Map structural dimensions based on aspect ratios
      let width = 1024;
      let height = 1024;
      if (aspectRatio === "16:9") { width = 1280; height = 720; }
      else if (aspectRatio === "9:16") { width = 720; height = 1280; }
      else if (aspectRatio === "4:3") { width = 1024; height = 768; }
      else if (aspectRatio === "3:4") { width = 768; height = 1024; }

      // 3. Assemble free image generation parameters via Pollinations CDN
      const generatedImageUrl = `https://image.pollinations.ai/p/${encodedPrompt}?width=${width}&height=${height}&seed=${Math.floor(Math.random() * 1000000)}&nologo=true`;

      // 4. Return structural payload matching frontend interface expectations
      return res.json({
        imageUrl: generatedImageUrl,
        prompt: finalPrompt,
        originalPrompt: prompt,
        aspectRatio: aspectRatio,
        style: style,
        time: new Date().toISOString()
      });

    } catch (error: any) {
      console.error("Error in /api/generate:", error);
      return res.status(500).json({
        error: error?.message || "Internal server error while generating image",
      });
    }
  });

  // Serve Vite or build static assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();