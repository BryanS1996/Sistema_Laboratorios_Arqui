const Report = require('../models/Report');
const backblazeService = require('../services/backblaze.service');

class ReportsController {

    /**
     * Create a new report
     * POST /reports
     */
    async create(req, res) {
        try {
            const { laboratorio, reportType, title, description, severity } = req.body;
            let imageUrl = null;
            let imageId = null;

            // Ensure user is authenticated (req.user from authJWT)
            if (!req.user || !req.user.id) {
                return res.status(401).json({ error: 'Usuario no autenticado' });
            }

            // Handle file upload if present
            if (req.file) {
                try {
                    const uploadResult = await backblazeService.uploadFile(
                        req.file.buffer,
                        req.file.originalname,
                        req.file.mimetype
                    );
                    imageUrl = uploadResult.url;
                    imageId = uploadResult.fileId;
                } catch (uploadError) {
                    console.error('Error uploading file to B2:', uploadError);
                    return res.status(500).json({ error: 'Error al subir la imagen. Intente nuevamente.' });
                }
            }

            const report = new Report({
                userId: req.user.id,
                userEmail: req.user.email,
                laboratorio,
                reportType,
                title,
                description,
                severity,
                imageUrl,
                imageId,
                status: 'enviado'
            });

            await report.save();

            res.status(201).json(report);
        } catch (error) {
            console.error('Error creating report:', error);
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Get all reports (Admin only)
     * GET /reports
     */
    async getAll(req, res) {
        try {
            const { status, limit = 20, page = 1 } = req.query;
            const query = {};

            if (status) query.status = status;

            const reports = await Report.find(query)
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .skip((parseInt(page) - 1) * parseInt(limit));

            const total = await Report.countDocuments(query);

            res.json({
                data: reports,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / parseInt(limit))
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Get my reports (User specific)
     * GET /reports/mine
     */
    async getMine(req, res) {
        try {
            const reports = await Report.find({ userId: req.user.id })
                .sort({ createdAt: -1 });
            res.json(reports);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ReportsController();
