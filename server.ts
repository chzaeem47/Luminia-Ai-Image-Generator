import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { InferenceClient } from "@huggingface/inference";

dotenv.config();

const client = new InferenceClient(process.env.HF_TOKEN);

async function startServer() {
    const app = express();
    const PORT = process.env.PORT || 3000;

    // Middleware
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: true }));

    // Image Generation API
    app.post("/api/generate", async (req, res) => {
        try {
            const { prompt, aspectRatio, style } = req.body;

            if (!prompt?.trim()) {
                return res.status(400).json({
                    error: "Prompt is required",
                });
            }

            // ===========================
            // Prompt Enhancement
            // ===========================

            let finalPrompt = prompt.trim();

            switch (style) {
                case "Neon Dystopia":
                    finalPrompt +=
                        ", cyberpunk, neon city, rainy streets, cinematic lighting, ultra detailed, masterpiece";
                    break;

                case "Cosmic Impasto":
                    finalPrompt +=
                        ", oil painting, impasto, thick brush strokes, masterpiece, artistic";
                    break;

                case "Prismatic Void":
                    finalPrompt +=
                        ", abstract crystal, glass reflections, octane render, unreal engine, ultra detailed";
                    break;

                case "Anime/Digital Art":
                    finalPrompt +=
                        ", anime style, vibrant colors, detailed illustration, key visual";
                    break;

                case "Watercolor":
                    finalPrompt +=
                        ", watercolor painting, textured paper, soft colors";
                    break;

                case "Photorealistic":
                    finalPrompt +=
                        ", photorealistic, DSLR, 85mm lens, ultra realistic, cinematic lighting";
                    break;
            }

            // ===========================
            // Aspect Ratio
            // ===========================

            let width = 1024;
            let height = 1024;

            switch (aspectRatio) {
                case "16:9":
                    width = 1280;
                    height = 720;
                    break;

                case "9:16":
                    width = 720;
                    height = 1280;
                    break;

                case "4:3":
                    width = 1024;
                    height = 768;
                    break;

                case "3:4":
                    width = 768;
                    height = 1024;
                    break;
            }

            console.log("Generating image...");
            console.log("Prompt:", finalPrompt);

            // ===========================
            // Hugging Face Generation
            // ===========================

            const image = await client.textToImage({
                model: "black-forest-labs/FLUX.1-schnell",
                inputs: finalPrompt,
            });

            const arrayBuffer = await image.arrayBuffer();

            const base64 = Buffer.from(arrayBuffer).toString("base64");

            return res.json({
                success: true,

                imageUrl: `data:image/png;base64,${base64}`,

                prompt: finalPrompt,

                originalPrompt: prompt,

                aspectRatio,

                style,

                width,

                height,

                generatedAt: new Date().toISOString(),
            });
        } catch (error: any) {
            console.error("Image Generation Error:");
            console.error(error);

            return res.status(500).json({
                success: false,
                error:
                    error?.message ||
                    "Failed to generate image.",
            });
        }
    });

    // ===========================
    // Vite
    // ===========================

    if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
            server: {
                middlewareMode: true,
            },
            appType: "spa",
        });

        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), "dist");

        app.use(express.static(distPath));

        app.get("*", (_, res) => {
            res.sendFile(path.join(distPath, "index.html"));
        });
    }

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Luminia server running on port ${PORT}`);
    });
}

startServer();