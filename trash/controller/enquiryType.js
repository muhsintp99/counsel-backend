const EnquiryType = require("../models/enquiryType");

// Create EnquiryType
exports.CreateEnquiryType = async (req, res) => {
  try {
    const { name, descp} = req.body;

    if (!name || !descp ) {
      return res.status(400).send({ message: "All required fields must be provided" });
    }

    const existingEnquiryType = await EnquiryType.findOne({ name });

    if (existingEnquiryType) {
      return res.status(200).send({
        success: true,
        message: "EnquiryType with this Name already exists",
      });
    }

    const enquiryType = await new EnquiryType({
      name,
      descp,
      createdBy :'admin',
      updatedBy :'admin',
      createdAt: new Date().toISOString(),
      updatedAt:  new Date().toISOString(),
      isDeleted: false
      
    }).save();

    res.status(201).send({
      success: true,
      message: "Successfully created an EnquiryType",
      enquiryType,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in creating an EnquiryType",
      error,
    });
  }
};

// Update EnquiryType
exports.UpdateEnquiryType = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const enquiryType = await EnquiryType.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!enquiryType) {
      return res.status(404).send({
        success: false,
        message: "EnquiryType not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Successfully updated the EnquiryType",
      enquiryType: updatedData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in updating the EnquiryType",
      error,
    });
  }
};

// Get all EnquiryTypes
exports.GetAllEnquiryTypes = async (req, res) => {
  try {
    const enquiryType = await EnquiryType.find().sort({createdAt:-1});
    res.status(200).send({
      success: true,
      message: "All EnquiryTypes",
      enquiryType,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in getting all EnquiryTypes",
      error,
    });
  }
};

// Get Single EnquiryType by ID
exports.GetSingleEnquiryType = async (req, res) => {
  try {
    const enquiryType = await EnquiryType.findById(req.params.id);

    if (!enquiryType) {
      return res.status(404).send({
        success: false,
        message: "EnquiryType not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Getting single EnquiryType successfully",
      enquiryType,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in getting a single EnquiryType",
      error,
    });
  }
};

// Delete EnquiryType by ID
exports.softDeleteEnquiryType = async (req, res) => {
  try {
    const { id } = req.params;
    const enquiryType = await EnquiryType.findByIdAndUpdate(
      id,
      { isDeleted: true, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    res.status(200).send({
      success: true,
      message: "Successfully deleted the EnquiryType",
      enquiryType,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in deleting the EnquiryType",
      error,
    });
  }
};
