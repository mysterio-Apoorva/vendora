import { Request, Response, NextFunction } from 'express';
import visualSearchService from '../../../services/visual-search.service';
import multer from 'multer';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  }
});

export const uploadMiddleware = upload.single('image');

export class VisualSearchController {
  /**
   * Search products by image
   * POST /api/buyer/visual-search
   */
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload an image"
        });
      }

      const result = await visualSearchService.searchByImage(
        req.file.buffer,
        req.file.mimetype
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new VisualSearchController();
