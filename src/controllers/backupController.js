import mongoose from 'mongoose';

export const downloadDatabaseBackup = async (req, res) => {
  try {
    // 1. Strict Role Check: ONLY Super Admin
    const isSuperAdmin = req.user.roles.some(r => r.name === 'Super Admin' || r === 'Super Admin');
    
    if (!isSuperAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: "Forbidden: Only Super Admins are authorized to export system backups." 
      });
    }

    // 2. Fetch all collections dynamically
    const backupData = {};
    const modelNames = mongoose.modelNames();
    
    for (const modelName of modelNames) {
      const Model = mongoose.model(modelName);
      backupData[modelName] = await Model.find({}).lean();
    }

    // 3. Format as a stringified JSON file
    const jsonString = JSON.stringify(backupData, null, 2);
    
    const date = new Date().toISOString().split('T')[0];
    const filename = `railway_csams_backup_${date}.json`;

    // 4. Force browser to download as file
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    return res.status(200).send(jsonString);

  } catch (error) {
    console.error("Database Backup failed:", error);
    return res.status(500).json({ success: false, message: "System backup failed to generate." });
  }
};
