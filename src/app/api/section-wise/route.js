import Booking from "@/models/Booking";
import connectMongo from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET(request) {
    await connectMongo();

    try {
        // Define the match id (using your sample ObjectId).
        const matchObjectId = new mongoose.Types.ObjectId("67d16b4c09b739aba8f1ac9b");

        // Aggregation pipeline to compute used seats per section.
        const usedSeatsBySection = await Booking.aggregate([
            // Filter bookings for the specific match and with a confirmed status.
            {
                $match: {
                    matchId: matchObjectId,
                    status: { $in: ["confirmed", "confirmed-through-api"] }
                }
            },
            // Lookup the corresponding ticket details.
            {
                $lookup: {
                    from: "tickets",
                    localField: "_id",       // booking _id
                    foreignField: "bookingId", // ticket's bookingId
                    as: "ticketDetails"
                }
            },
            // Extract the 'used' flag from the first element of the ticketDetails array.
            {
                $addFields: {
                    used: { $arrayElemAt: ["$ticketDetails.used", 0] }
                }
            },
            // Only consider bookings where the ticket is marked as used.
            {
                $match: { used: true }
            },
            // Group by sectionId (which is stored as a string) and sum the numberOfSeats.
            {
                $group: {
                    _id: "$sectionId",
                    usedSeats: { $sum: "$numberOfSeats" }
                }
            },
            // Convert the sectionId string to an ObjectId for the lookup.
            {
                $addFields: {
                    sectionObjId: { $toObjectId: "$_id" }
                }
            },
            // Lookup section details to fetch the human-readable section identifier.
            {
                $lookup: {
                    from: "sections",
                    localField: "sectionObjId",
                    foreignField: "_id",
                    as: "sectionDetails"
                }
            },
            { $unwind: "$sectionDetails" },
            // Project the section's identifier along with the computed usedSeats.
            {
                $project: {
                    section: "$sectionDetails.sectionID",
                    usedSeats: 1,
                    bowl: "$sectionDetails.bowl"
                }
            },
            { $sort: { section: 1 } }
        ]);

        return new Response(
            JSON.stringify({ usedSeatsBySection }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error fetching used seats by section", error);
        return new Response(
            JSON.stringify({ error: "Internal Server Error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}