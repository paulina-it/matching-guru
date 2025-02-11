import type { NextApiRequest, NextApiResponse } from "next";
import cloudinary from "../utils/cloudinary";
import formidable from "formidable";
import fs from "fs/promises"; 

export const config = {
  api: {
    bodyParser: false, 
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = new formidable.IncomingForm({
      multiples: false, // Only allow single file
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
    });

    const [fields, files] = await form.parse(req);
    
    if (!files.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    const fileBuffer = await fs.readFile(file.filepath);

    const uploadResponse = await cloudinary.uploader.upload_stream(
      { folder: "profile_pictures", allowed_formats: ["jpg", "jpeg", "png"] },
      (error, result) => {
        if (error || !result) {
          return res.status(500).json({ error: "Image upload failed" });
        }
        res.status(200).json({ url: result.secure_url });
      }
    );

    uploadResponse.end(fileBuffer); 

  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Server error during file upload" });
  }
}
