const GeographicPoint = require('../models/GeographicPoint');

exports.setPoint = async (req, res) => {
    try {
        const { latitude, longitude, radius_meters } = req.body;
        
        // Deactivate previous active points
        await GeographicPoint.update({ status: 'inactive' }, { where: { status: 'active' } });

        // Create new active point
        const point = await GeographicPoint.create({
            latitude,
            longitude,
            radius_meters: radius_meters || 50,
            status: 'active'
        });

        res.status(201).json({ message: 'Geographic point configured', point });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getPoint = async (req, res) => {
    try {
        const point = await GeographicPoint.findOne({ where: { status: 'active' } });
        if (!point) return res.status(404).json({ message: 'No active point found' });
        res.json(point);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
