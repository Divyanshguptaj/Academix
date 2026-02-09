import express from 'express';
import { authenticateAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Analytics endpoint for AI service
router.get('/analytics', authenticateAdmin, (req, res) => {
  try {
    // Mock analytics data - in a real implementation, this would gather actual usage metrics
    const analytics = {
      totalRequests: 1500,
      successfulRequests: 1450,
      failedRequests: 50,
      averageResponseTime: "2.3s",
      mostUsedFeature: "generateSummary",
      usageByFeature: {
        generateSummary: 600,
        chatWithDocument: 400,
        askDoubt: 300,
        textToVideoSummarizer: 150,
        generateJson2Video: 50
      }
    };
    
    res.status(200).json({
      success: true,
      message: "AI service analytics retrieved successfully",
      data: analytics
    });
  } catch (error) {
    console.error("Error getting AI analytics:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving analytics data"
    });
  }
});

// Export data endpoint for AI service
router.get('/export', authenticateAdmin, (req, res) => {
  try {
    // Mock export data - in a real implementation, this would export actual usage data
    const exportData = {
      timestamp: new Date().toISOString(),
      totalRequests: 1500,
      successfulRequests: 1450,
      failedRequests: 50,
      usageDetails: [
        { feature: "generateSummary", count: 600, avgResponseTime: "1.8s" },
        { feature: "chatWithDocument", count: 400, avgResponseTime: "3.2s" },
        { feature: "askDoubt", count: 300, avgResponseTime: "2.1s" },
        { feature: "textToVideoSummarizer", count: 150, avgResponseTime: "8.5s" },
        { feature: "generateJson2Video", count: 50, avgResponseTime: "15.2s" }
      ]
    };
    
    res.status(200).json({
      success: true,
      message: "AI service data exported successfully",
      data: exportData
    });
  } catch (error) {
    console.error("Error exporting AI data:", error);
    res.status(500).json({
      success: false,
      message: "Error exporting data"
    });
  }
});

export default router;