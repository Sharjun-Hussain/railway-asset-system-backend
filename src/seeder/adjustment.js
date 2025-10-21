import Asset from '../models/asset.js';
import User from '../models/user.js';

export const getAdjustments = async () => {
  // Get a user
  const jaffnaStaff = await User.findOne({ email: "jaffna.staff@slrail.lk" });
  
  // Get an asset
  const ballast = await Asset.findOne({ name: "Track Ballast (Cubic Meter)" });

  return [
    {
      assetId: ballast._id,
      warehouseId: ballast.warehouseId,
      branchId: ballast.branchId,
      adjustedBy: jaffnaStaff._id,
      adjustmentType: "decrease",
      quantity: -10, // 10 units were used
      reason: "Track maintenance at Kodikamam"
    }
  ];
};