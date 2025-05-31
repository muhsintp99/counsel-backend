const Country = require('../models/country');

async function seedDefaultIndiaCountry() {
  try {
    const exists = await Country.findOne({ name: 'India', isDeleted: false });

    if (!exists) {
      const india = new Country({
        name: 'India',
        code: 'IN',
        isoCode: 'IND',
        dialCode: '+91',
        currency: 'INR',
        image: '/public/defult/India.png',
        createdBy: 'system',
        updatedBy: 'system'
      });

      await india.save();
      console.log("✅ 'India' inserted with isDomestic and isDefault auto-set.");
    } else {
      console.log("ℹ️ 'India' already exists.");
    }
  } catch (err) {
    console.error("❌ Failed to insert India:", err.message);
  }
}

module.exports = seedDefaultIndiaCountry;
