const { Services } = require("../models/products/services");


exports.rateService = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { userId, rating } = req.body;

    // Validate rating score
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Find the service (employee)
    const employee = await Services.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if the user has already rated the employee
    const existingRatingIndex = employee.rating.findIndex(r => r.user.toString() === userId);
    if (existingRatingIndex >= 0) {
      // Update existing rating
      employee.rating[existingRatingIndex].score = rating;
    } else {
      // Add new rating
      employee.rating.push({ user: userId, score: rating });
    }

    // Calculate the average rating
    const totalRating = employee.rating.reduce((acc, rate) => acc + rate.score, 0);
    const averageRating = totalRating / employee.rating.length;

    // Update the employee's average rating
    employee.averageRating = averageRating;
    
    // Save the employee document
    await employee.save();

    return res.status(200).json({ 
      message: 'Rating submitted successfully', 
      averageRating 
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get the average rating of an employee
exports.getServiceRating = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Find the employee
    const employee = await Services.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    return res.status(200).json({ 
      averageRating: employee.averageRating 
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
