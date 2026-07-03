const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

require("dotenv").config();

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDb = async () => {
    try {
        await Listing.deleteMany({});

        for (let listing of initData.data) {
            const response = await geocodingClient
                .forwardGeocode({
                    query: `${listing.location}, ${listing.country}`,
                    limit: 1,
                })
                .send();

            listing.owner = "6a3d6953e05b77edd1eeecfd";

            listing.geometry = response.body.features[0].geometry;
        }

        await Listing.insertMany(initData.data);

        console.log("Data was initialized successfully!");
    } catch (err) {
        console.log("Error:", err);
    } finally {
        mongoose.connection.close();
    }
};

initDb();