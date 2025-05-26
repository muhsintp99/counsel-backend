const EnquirySource = require("../models/enquirySource");
const mongoose = require('mongoose');


// Create Enquiry
exports.CreateEnquirySourceController = async (req, res) => {

    try{
       const { name, desc} = req.body;
       if(!name || !desc){
        return res.status(400).send({ message: "All required fields must be provided"});
       }
  
       const existingEnquiry = await EnquirySource.findOne({ name });
    if (existingEnquiry) {
        return res.status(200).send({
            success: true,
        message: "Enquiry with this name already exists",
        });
    }
    const enquirySource = await new EnquirySource({
      name,
      desc,
      status: "new", // Default status
      createdAt: new Date(), // Set the creation date/time
      updatedBy: req.id, // Set the user ID of the person making the request
      isDeleted: false
  }).save();

    res.status(201).send({
        success: true,
        message: "Successfully created an enquirysource",
        enquirySource,
      });
}catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in creating an enquirysource",
      error,
    });
  }

};



// Updated EnquirySource
exports.UpdateEnquirySourceController = async (req, res) => {
    try{
        const {id} = req.params;
        const updatedData = req.body;


        const enquirySource = await EnquirySource.findByIdAndUpdate(id,updatedData,
            {
              new: true, 
              runValidators: true, 
              })

              if (!enquirySource) {
                return res.status(404).send({
                  success: false,
                  message: "Enquirysource not found",
                });
              }
              res.status(200).send({
                success: true,
                message: "Successfully updated the enquirysource",
                enquirySource:updatedData,
              });
    }catch (error) {
        console.log(error);
        res.status(500).send({
          success: false,
          message: "Error in updating the enquirysource",
          error,
        });
      }
};


// Get all Enquiries
exports.GetAllEnquiriesSourceController = async (req, res) => {
  try {
    const enquiriesSource = await EnquirySource.find().sort({createdAt:-1});
    res.status(200).send({
      success: true,
      message: "All enquiries",
      enquiriesSource,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in getting all enquiriessource",
      error,
    });
  }
};
exports.GetSingleEnquirySourceController = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate that 'id' is a valid ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({
        success: false,
        message: "Invalid ID format",
      });
    }

    const enquirySource = await EnquirySource.findById(id);

    if (!enquirySource) {
      return res.status(404).send({
        success: false,
        message: "Enquirysource not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Getting single enquirysource successfully",
      enquirySource,
    });
  } catch (error) {
    console.error('Error in GetSingleEnquirySourceController:', error);
    res.status(500).send({
      success: false,
      message: "Error in getting a single enquirysource",
      error,
    });
  }
};


// // delete 
// exports.DeleteEnquirySourceController = async (req, res) => {
//   try {
//       const { id } = req.params;

//       // Check if id is a valid ObjectId
//       if (!mongoose.Types.ObjectId.isValid(id)) {
//           return res.status(400).send({
//               success: false,
//               message: 'Invalid ID format',
//           });
//       }

//       const enquirySource = await EnquirySource.findByIdAndDelete(id);

//       if (!enquirySource) {
//           return res.status(404).send({
//               success: false,
//               message: 'Enquirysource not found',
//           });
//       }

//       res.status(200).send({
//           success: true,
//           message: 'Successfully deleted the enquirysource',
//           enquirySource,
//       });
//   } catch (error) {
//       console.error(error);
//       res.status(500).send({
//           success: false,
//           message: 'Error in deleting the enquirysource',
//           error,
//       });
//   }
// };


// Delete Enquiry by ID
exports.softDeleteEnquirysource = async (req, res) => {
  try {
    const { id } = req.params;

    const enquirysource = await EnquirySource.findByIdAndUpdate(id, 
     { isDeleted: true, updatedAt: Date.now() },
     { new: true, runValidators: true })
   

    res.status(200).send({
      success: true,
      message: "Successfully deleted the Enquirymode",
      enquirysource,
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
