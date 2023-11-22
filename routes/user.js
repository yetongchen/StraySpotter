import express from "express";

const router = express.Router();


router.get("/", async (req, res) => {
    try {
      res.status(200).json(data);
    } catch (error) {
      res.json(error);
    }
});

export default router;