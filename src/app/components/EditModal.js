import React, { useState, useEffect } from 'react';
import Image from 'next/image';

//Components
import Loading from '@/app/components/Loading';

import axios from 'axios'; // Import axios or use fetch


const EditModal = ({ event, onClose, onSave }) => {

    const [loading, setLoading] = useState(false);
    const [organizers, setOrganizers] = useState([]);
    const [form, setForm] = useState({
        id: '',
        organizer: '',
        title: '',
        about: '',
        venue: '',
        city: '',
        date: '',
        time: '',
        image: '',
        slug: '',
        ticketPhases: [],
    });

    const fetchOrganizers = async () => {
        setLoading(true)
        try {
            const response = await axios.get('/api/organizer/getallorganizers'); // Replace with your actual API endpoint
            setOrganizers(response.data.organizers); // Assuming response.data.organizers is an array of organizers
            setLoading(false)
        } catch (error) {
            console.error('Error fetching organizers:', error);
            setLoading(false)
        }
    };

    useEffect(() => {
        fetchOrganizers(); // Fetch organizers on component mount
        // Other useEffect logic to set form values from event
    }, []);

    let date = new Date(event.date);
    let formattedDate = date.toISOString().substring(0, 10);

    useEffect(() => {

        // Transform the ticketPrice object into an array of phases
        const ticketPhasesArray = Object.entries(event.ticketPrice).map(([phaseName, { quantity, price, info, coverCharge }]) => ({
            phaseName,
            quantity,
            info,
            coverCharge,
            price,
        }));

        setForm({
            id: event._id,
            organizer: event.organizer,
            title: event.title,
            about: event.about,
            venue: event.venue,
            city: event.city,
            date: event.date,
            time: event.time,
            image: event.imageUrl,
            slug: event.slug,
            ticketPhases: ticketPhasesArray,
        });
    }, [event]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({ ...prevForm, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setForm((prevForm) => ({ ...prevForm, image: reader.result }));
        };
        reader.readAsDataURL(file);
    };


    // To handle ticket phases
    const handleTicketPhaseChange = (index, e) => {
        const { name, value } = e.target;
        setForm((prevForm) => {
            const ticketPhases = [...prevForm.ticketPhases];
            ticketPhases[index] = { ...ticketPhases[index], [name]: value };
            return { ...prevForm, ticketPhases };
        });
    };

    // To add a ticket phase
    const addTicketPhase = () => {
        setForm((prevForm) => ({
            ...prevForm,
            ticketPhases: [...prevForm.ticketPhases, { phaseName: '', quantity: 0, info: '', coverCharge: 0, price: 0 }]
        }));
    };

    // To remove a ticket phase
    const removeTicketPhase = (index) => {
        setForm((prevForm) => {
            const ticketPhases = prevForm.ticketPhases.filter((_, i) => i !== index);
            return { ...prevForm, ticketPhases };
        });
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(event.id, form);
        // console.log(form)
    };

    if (loading)
        return <Loading />

    return (
        <div className="lg:mx-0 mx-5 py-5">
            <h2 className="my-10 lg:ml-16 ml-5 text-5xl font-normal">Edit Event - <span className='font-bold'>{event.title}</span></h2>
            <form
                className="w-full mx-auto p-5 lg:px-16"
                onSubmit={handleSubmit}
            >
                <div className='flex lg:flex-row flex-col lg:gap-12 max-w-[100vw]'>
                    <div className='flex flex-col w-full lg:max-w-[50vw]'>
                        <label className="mb-1 font-bold" htmlFor="organizer">Event Organizer</label>
                        <select
                            className="mb-4 p-2 border bg-[#1b1b1b] border-gray-800 rounded"
                            name="organizer"
                            value={form.organizer}
                            onChange={handleChange}
                            required
                            disabled
                        >
                            <option value="">Select Organizer</option>
                            {organizers.map(org => (
                                <option key={org._id} value={org._id}>{org.name}</option>
                            ))}
                        </select>

                        <label className="mb-1 font-bold" htmlFor="title">Event Title</label>
                        <input
                            className="mb-4 p-2 border bg-[#1b1b1b] border-gray-800 rounded"
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Event Title"
                            required
                        />

                        <label className="mb-1 font-bold" htmlFor="about">About</label>
                        <textarea
                            className="mb-4 p-2 border bg-[#1b1b1b] border-gray-800 rounded"
                            name="about"
                            value={form.about}
                            rows={5}
                            onChange={handleChange}
                            placeholder="About"
                            required
                        ></textarea>

                        <label className="mb-1 font-bold" htmlFor="venue">Venue</label>
                        <input
                            className="mb-4 p-2 border bg-[#1b1b1b] border-gray-800 rounded"
                            type="text"
                            name="venue"
                            value={form.venue}
                            onChange={handleChange}
                            placeholder="Venue"
                            required
                        />

                        <label className="mb-1 font-bold" htmlFor="city">City</label>
                        <input
                            className="mb-4 p-2 border bg-[#1b1b1b] border-gray-800 rounded"
                            type="text"
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            placeholder="City"
                            required
                        />

                        <label className="mb-1 font-bold" htmlFor="date">Date<span className='text-[0.7rem] text-[#00FF38] font-normal'> (Do not change if same)</span></label>
                        <p className='text-xs text-[#00FF38]'><span className='text-white'>Current: </span>{formattedDate}</p>
                        <input
                            className="mt-1 mb-4 p-2 border bg-[#1b1b1b] border-gray-800 rounded"
                            type="date"
                            name="date"
                            value={form.date}
                            onChange={handleChange}
                        />

                        <label className="mb-1 font-bold" htmlFor="date">Time (Eg: 9 PM)</label>
                        <input
                            className="mb-4 p-2 border bg-[#1b1b1b] border-black rounded"
                            type="text"
                            name="time"
                            value={form.time}
                            onChange={handleChange}
                            required
                        />

                    </div>
                    <div className='flex flex-col w-4/3'>
                        <label className="mb-1 mt-10 lg:mt-0 font-bold" htmlFor="image">Change Event Flyer<span className='text-[0.7rem] text-[#00FF38] font-normal'> (Do not Re-upload if same)</span></label>
                        <Image
                            src={(form.image !== '') ? form.image : event.imageUrl}
                            loading="lazy"
                            width={300}
                            height={300}
                            // sizes="100vw"
                            // className=" w-full object-cover"
                            alt="Event Flyer"
                            style={{ "boxShadow": "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px", "borderRadius": "8px" }}
                        />
                        <input
                            className="my-4 text-[#00FF38]"
                            type="file"
                            name="image"
                            onChange={handleImageChange}
                        />

                    </div>
                </div>
                <label className="mb-1 font-bold" htmlFor="ticketPhases">Tickets</label>
                {
                    form.ticketPhases.map((ticketPhase, index) => (
                        <div key={index} className=" text-center mb-1 p-5 md:px-10 px-2 border bg-[#1b1b1b] border-gray-800 rounded w-full">
                            <div className='flex flex-col lg:flex-row gap-3 text-left'>
                                <div className=' flex flex-col'>
                                    <label htmlFor="phaseName" className='ml-1 mb-1 text-sm'>Sale Phase</label>
                                    <input
                                        className="mb-2 p-2 border bg-[#1b1b1b] border-gray-800 rounded "
                                        type="text"
                                        name="phaseName"
                                        value={ticketPhase.phaseName}
                                        onChange={(e) => handleTicketPhaseChange(index, e)}
                                        placeholder="Sale Phase Name"
                                        required
                                    />
                                </div>
                                <div className='flex flex-col w-full'>
                                    <label htmlFor="quantity" className='ml-1 mb-1 text-sm'>Quantity</label>
                                    <input
                                        className="mb-2 p-2 border bg-[#1b1b1b] border-gray-800 rounded"
                                        type="number"
                                        name="quantity"
                                        value={ticketPhase.quantity}
                                        onChange={(e) => handleTicketPhaseChange(index, e)}
                                        placeholder="Quantity"
                                        required
                                    />
                                </div>
                                <div className='flex flex-col w-full'>
                                    <label htmlFor="price" className='ml-1 mb-1 text-sm'>Price</label>
                                    <input
                                        className="mb-2 p-2 border bg-[#1b1b1b] border-gray-800 rounded"
                                        type="number"
                                        name="price"
                                        value={ticketPhase.price}
                                        onChange={(e) => handleTicketPhaseChange(index, e)}
                                        placeholder="Price"
                                        required
                                    />
                                </div>
                                <div className='flex flex-col w-full'>
                                    <label htmlFor="coverCharge" className='ml-1 mb-1 text-sm'>Cover Charge</label>
                                    <input
                                        className="mb-2 p-2 border bg-[#1b1b1b] border-gray-800 rounded"
                                        type="number"
                                        name="coverCharge"
                                        value={ticketPhase.coverCharge}
                                        min="0"
                                        onChange={(e) => handleTicketPhaseChange(index, e)}
                                        placeholder="Cover Charge"
                                    />
                                </div>
                            </div>
                            <div className='flex flex-col text-left'>
                                <label htmlFor="info" className='ml-1 mb-1 text-sm'>Info</label>
                                <textarea
                                    className="mb-2 p-2 border bg-[#1b1b1b] border-gray-800 rounded"
                                    type="text"
                                    name="info"
                                    value={ticketPhase.info}
                                    onChange={(e) => handleTicketPhaseChange(index, e)}
                                    placeholder="Ticket Info"
                                />
                            </div>
                            <button type="button" onClick={() => removeTicketPhase(index)} className="text-red-500">Remove</button>
                        </div>
                    ))
                }
                <button type="button" onClick={addTicketPhase} className="w-44 px-2 bg-slate-800 hover:bg-white hover:text-black text-white font-medium rounded">Add Ticket Phase</button>
                <div className="flex justify-start gap-4 mt-4">
                    <button
                        type="button"
                        className="px-4 py-2 bg-gray-700 rounded"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-[#00FF38] text-black rounded"
                    >
                        Confirm
                    </button>
                </div>
            </form >
        </div >
    );
};

export default EditModal;
