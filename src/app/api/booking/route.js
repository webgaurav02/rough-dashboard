import Booking from "@/models/Booking";
import connectMongo from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET(request) {
  await connectMongo();
  
  try {
    // Convert the match id string to a mongoose ObjectId.
    const matchObjectId = new mongoose.Types.ObjectId("67d16b4c09b739aba8f1ac9b");

    // Updated dashboardData aggregation with a $match filter
    const dashboardData = await Booking.aggregate([
      {
        $match: { matchId: matchObjectId } // Filter bookings by match id
      },
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
          section: "$sectionDetails.sectionID",
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

    // Updated bookingDetails aggregation with the same $match filter.
    const bookingDetails = await Booking.aggregate([
      {
        $match: { matchId: matchObjectId } // Only fetch bookings with the specified match id.
      },
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
      // Ensure imageUrl is added from the ticket details.
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

    // Calculate total number of used tickets from bookingDetails.
    const totalUsedTickets = bookingDetails.reduce((acc, booking) => booking.used ? acc + (1 * booking.numberOfSeats) : acc, 0);
    
    return new Response(
      JSON.stringify({ dashboardData, bookingDetails, totalSeats, totalUsedTickets }),
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