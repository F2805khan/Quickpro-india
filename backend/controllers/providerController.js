import asyncHandler from "../middleware/asyncHandler.js";
import Provider from "../models/Provider.js";

// @desc    Get all providers
// @route   GET /api/providers
// @access  Public
export const getProviders = asyncHandler(async (req, res) => {
  const providers = await Provider.findAll({
    attributes: [
      "_id",
      "userId",
      "companyName",
      "bio",
      "isVerified",
      "yearsExperience",
      "ratingAvg",
      "ratingCount"
    ]
  });

  res.json(providers);
});

// @desc    Get provider by ID
// @route   GET /api/providers/:id
// @access  Public
export const getProviderById = asyncHandler(async (req, res) => {
  const provider = await Provider.findByPk(req.params.id);

  if (provider) {
    res.json(provider);
  } else {
    res.status(404);
    throw new Error("Provider not found");
  }
});
