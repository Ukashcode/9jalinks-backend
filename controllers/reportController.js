import Report from "../models/reportModel.js";
import Seller from "../models/sellerModel.js";

export const createReport = async (req, res) => {
  try {
    const { sellerId, reason, details } = req.body;
    if (!sellerId || !reason) return res.status(400).json({ message: "Missing fields" });
    const report = await Report.create({ seller: sellerId, reporter: req.user ? req.user._id : null, reason, details });
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: resolve and optionally block seller
export const resolveReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { blockSeller } = req.body; // boolean
    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ message: "Report not found" });

    if (blockSeller) {
      await Seller.findByIdAndUpdate(report.seller, { isBlocked: true });
    }
    report.resolved = true;
    await report.save();
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
