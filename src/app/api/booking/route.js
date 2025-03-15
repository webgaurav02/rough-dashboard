// app/api/dashboard/route.js
import Booking from "@/models/Booking";
// import MatchAvailability from "@/models/MatchAvailability";
// import Section from "@/models/Section";
import connectMongo from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET(request) {
  await connectMongo();

  try {
    // Aggregation pipeline to group bookings by section and sum up sold seats (confirmed) and cancelled seats.
    const dashboardData = await Booking.aggregate([
      {
        $group: {
          _id: "$sectionId",
          sold: {
            $sum: {
              $cond: [{ $eq: ["$status", "confirmed"] }, "$numberOfSeats", 0],
            },
          },
          cancelled: {
            $sum: {
              $cond: [{ $eq: ["$status", "cancelled"] }, "$numberOfSeats", 0],
            },
          },
        },
      },
      // Convert the grouped _id (which is a string) to an ObjectId so we can match it with Section and MatchAvailability.
      {
        $addFields: {
          sectionObjId: { $toObjectId: "$_id" },
        },
      },
      // Join with Sections to get the friendly section name.
      {
        $lookup: {
          from: "sections", // collection name for Section documents
          localField: "sectionObjId",
          foreignField: "_id",
          as: "sectionDetails",
        },
      },
      { $unwind: "$sectionDetails" },
      // Join with MatchAvailability to fetch the remaining available seats and locked seats.
      {
        $lookup: {
          from: "matchavailabilities", // collection name for MatchAvailability documents
          localField: "sectionObjId",
          foreignField: "section",
          as: "availability",
        },
      },
      { $unwind: { path: "$availability", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          remaining: { $ifNull: ["$availability.availableQuantity", 0] },
          locked: { $ifNull: ["$availability.lockedSeats", 0] },
        },
      },
      {
        $project: {
          section: "$sectionDetails.sectionID", // e.g., "lower-bowl-3"
          sold: 1,
          remaining: 1,
          locked: 1,
          cancelled: 1,
        },
      },
      // Sorting sections alphabetically by section name to maintain a fixed order.
      {
        $sort: { section: 1 },
      },
    ]);

    // Retrieve all booking details for the table view, sorted in descending order by creation date.
    const bookingDetails = await Booking.find({}).sort({ createdAt: -1 });

    return new Response(
      JSON.stringify({ dashboardData, bookingDetails }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error loading dashboard data", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}