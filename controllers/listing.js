const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const { search, category } = req.query;

    let filter = {};

    // Search filter
    if (search && search.trim() !== "") {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { country: { $regex: search, $options: "i" } }
        ];
    }

    // Category filter
    if (category && category !== "All") {
        filter.category = { $in: [category] };
    }

    const allListings = await Listing.find(filter);

    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Required Listing doesn't exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
    let response = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        })
        .send();

    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;

    newListing.image = {
        url,
        filename,
    };

    newListing.geometry = response.body.features[0].geometry;

    // Handle multiple categories
    if (!Array.isArray(req.body.listing.category)) {
        newListing.category = req.body.listing.category
            ? [req.body.listing.category]
            : ["Trending"];
    } else {
        newListing.category = req.body.listing.category;
    }

    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Required Listing doesn't exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace(
        "/upload",
        "/upload/h_300,w_250"
    );

    res.render("listings/edit.ejs", {
        listing,
        originalImageUrl,
    });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    let listing = await Listing.findById(id);

    Object.assign(listing, req.body.listing);

    let response = await geocodingClient
        .forwardGeocode({
            query: `${listing.location}, ${listing.country}`,
            limit: 1,
        })
        .send();

    if (response.body.features.length > 0) {
        listing.geometry = response.body.features[0].geometry;
    }

    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }

    // Handle multiple categories
    if (!Array.isArray(req.body.listing.category)) {
        listing.category = req.body.listing.category
            ? [req.body.listing.category]
            : ["Trending"];
    } else {
        listing.category = req.body.listing.category;
    }

    await listing.save();

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};