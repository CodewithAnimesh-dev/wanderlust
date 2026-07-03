require("dotenv").config();

const mongoose = require("mongoose");
const Listing = require("../models/listing");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;

console.log("=================================");
console.log("MAP TOKEN:", mapToken);
console.log("=================================");

const geocodingClient = mbxGeocoding({
  accessToken: mapToken,
});

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("✅ Connected to MongoDB");

  const listings = await Listing.find({});
  console.log(`📌 Total Listings: ${listings.length}`);

  for (let listing of listings) {

    // Skip listings that already have geometry
    if (
      listing.geometry &&
      listing.geometry.coordinates &&
      listing.geometry.coordinates.length > 0
    ) {
      console.log(`⏩ Skipping: ${listing.title}`);
      continue;
    }

    try {

      console.log("---------------------------------");
      console.log(`Searching: ${listing.location}, ${listing.country}`);

      const response = await geocodingClient
        .forwardGeocode({
          query: `${listing.location}, ${listing.country}`,
          limit: 1,
        })
        .send();

      console.log("Features Returned:");
      console.log(response.body.features);

      if (response.body.features.length > 0) {

        listing.geometry = response.body.features[0].geometry;

        await listing.save();

        console.log(`✅ Updated: ${listing.title}`);

      } else {

        console.log(`❌ Location NOT FOUND: ${listing.title}`);

      }

    } catch (err) {

      console.log(`❌ Error updating "${listing.title}"`);
      console.log(err);

    }
  }

  console.log("---------------------------------");
  console.log("🎉 All listings processed.");
  mongoose.connection.close();
}

main().catch((err) => {
  console.log(err);
});