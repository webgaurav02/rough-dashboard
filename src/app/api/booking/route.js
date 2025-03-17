// app/api/dashboard/route.js
import Booking from "@/models/Booking";
import connectMongo from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET(request) {
  await connectMongo();

  try {
    // Aggregation pipeline for dashboardData: groups bookings by section and sums up sold seats (confirmed or confirmed-through-api) and cancelled seats.
    const dashboardData = await Booking.aggregate([
      {
        $group: {
          _id: "$sectionId",
          sold: {
            $sum: {
              $cond: [
                { $in: ["$status", ["confirmed", "confirmed-through-api"]] },
                "$numberOfSeats",
                0
              ],
            },
          },
          cancelled: {
            $sum: {
              $cond: [{ $eq: ["$status", "cancelled"] }, "$numberOfSeats", 0],
            },
          },
        },
      },
      // Convert section id (string) to ObjectId for lookups.
      {
        $addFields: {
          sectionObjId: { $toObjectId: "$_id" },
        },
      },
      // Lookup section details to get sectionID and bowl.
      {
        $lookup: {
          from: "sections",
          localField: "sectionObjId",
          foreignField: "_id",
          as: "sectionDetails",
        },
      },
      { $unwind: "$sectionDetails" },
      // Lookup match availability details.
      {
        $lookup: {
          from: "matchavailabilities",
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
          bowl: "$sectionDetails.bowl",
          sold: 1,
          remaining: 1,
          locked: 1,
          cancelled: 1,
        },
      },
      {
        $sort: { section: 1 },
      },
    ]);

    // Calculate total seats across all sections (example: summing sold seats).
    const totalSeats = dashboardData.reduce((acc, section) => acc + section.sold, 0);

    // Retrieve all booking details along with the bowl field and ticket imageUrl.
    const bookingDetails = await Booking.aggregate([
      // Convert booking.sectionId to ObjectId to lookup section details.
      {
        $addFields: { sectionObjId: { $toObjectId: "$sectionId" } },
      },
      {
        $lookup: {
          from: "sections",
          localField: "sectionObjId",
          foreignField: "_id",
          as: "sectionDetails",
        },
      },
      { $unwind: { path: "$sectionDetails", preserveNullAndEmptyArrays: true } },
      // Add the bowl field from the section.
      {
        $addFields: { bowl: "$sectionDetails.bowl" },
      },
      // Lookup corresponding ticket document from the tickets collection.
      {
        $lookup: {
          from: "tickets",
          localField: "_id", // booking _id
          foreignField: "bookingId", // ticket's bookingId
          as: "ticketDetails",
        },
      },
      {
        $addFields: {
          ticketId: { $arrayElemAt: ["$ticketDetails._id", 0] },
          imageUrl: { $arrayElemAt: ["$ticketDetails.imageUrl", 0] },
          used: { $arrayElemAt: ["$ticketDetails.used", 0] },
        },
      },
      // Add the imageUrl field from the ticket, if available.
      {
        $addFields: { imageUrl: { $arrayElemAt: ["$ticketDetails.imageUrl", 0] } },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          sectionDetails: 0,
          sectionObjId: 0,
          ticketDetails: 0,
        },
      },
    ]);

    return new Response(
      JSON.stringify({ dashboardData, bookingDetails, totalSeats }),
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