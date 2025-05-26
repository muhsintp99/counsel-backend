// controllers/enquirymodeControllers.js
const Enquirymode = require('../models/enquiryMode');
const mongoose = require('mongoose');

// Create Enquiry Mode
exports.createEnquiryModeController = async (req, res) => {
  try {
    const { name, desc } = req.body;

    if (!name || !desc) {
      return res.status(400).send({ message: 'All required fields must be provided' });
    }

    const existingEnquiryMode = await Enquirymode.findOne({ name });

    if (existingEnquiryMode) {
      return res.status(409).send({
        success: false,
        message: 'Enquiry mode with this name already exists',
      });
    }

    const enquiryMode = await new Enquirymode({
      name,
      desc,
      status: 'new',
      createdAt: new Date(),
      updatedBy: req.id,
      isDeleted: false
    }).save();

    res.status(201).send({
      success: true,
      message: 'Successfully created an enquiry mode',
      enquiryMode,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error in creating an enquiry mode',
      error,
    });
  }
};

// Update Enquiry Mode
exports.updateEnquiryModeController = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const enquiryMode = await Enquirymode.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!enquiryMode) {
      return res.status(404).send({
        success: false,
        message: 'Enquiry mode not found',
      });
    }

    res.status(200).send({
      success: true,
      message: 'Successfully updated the enquiry mode',
      enquiryMode: updatedData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error in updating the enquiry mode',
      error,
    });
  }
};

// Get all Enquiry Modes
exports.getAllEnquirymodesController = async (req, res) => {
  try {
    const enquiryModes = await Enquirymode.find().sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      message: 'All enquiry modes',
      enquiryModes,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error in getting all enquiry modes',
      error,
    });
  }
};

// Get Single Enquiry Mode by ID
exports.getSingleEnquiryModeController = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({
        success: false,
        message: 'Invalid ID format',
      });
    }

    const enquiryMode = await Enquirymode.findById(id);

    if (!enquiryMode) {
      return res.status(404).send({
        success: false,
        message: 'Enquiry mode not found',
      });
    }

    res.status(200).send({
      success: true,
      message: 'Getting single enquiry mode successfully',
      enquiryMode,
    });
  } catch (error) {
    console.error('Error in getSingleEnquiryModeController:', error);
    res.status(500).send({
      success: false,
      message: 'Error in getting a single enquiry mode',
      error,
    });
  }
};

// // Delete Enquiry Mode by ID
// exports.deleteEnquiryModeController = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).send({
//         success: false,
//         message: 'Invalid ID format',
//       });
//     }

//     const enquiryMode = await Enquirymode.findByIdAndDelete(id);

//     if (!enquiryMode) {
//       return res.status(404).send({
//         success: false,
//         message: 'Enquiry mode not found',
//       });
//     }

//     res.status(200).send({
//       success: true,
//       message: 'Successfully deleted the enquiry mode',
//       enquiryMode,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({
//       success: false,
//       message: 'Error in deleting the enquiry mode',
//       error,
//     });
//   }
// };


// Delete Enquiry by ID
exports.softDeleteEnquirymode = async (req, res) => {
  try {
    const { id } = req.params;

    const enquirymode = await Enquirymode.findByIdAndUpdate(id, 
     { isDeleted: true, updatedAt: Date.now() },
     { new: true, runValidators: true })
   

    res.status(200).send({
      success: true,
      message: "Successfully deleted the Enquirymode",
      enquirymode,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in deleting the Enquirymode",
      error,
    });
  }
};
