const { DATE, Op } = require('sequelize');
const Event = require('../models/event');
const Ticket = require('../models/ticket');
const User = require('../models/User');
const { nanoid } = require('nanoid');

exports.addEvent = async (req, res) => {
    const { eventName,
        vendor,
        eventDate,
        eventLocation,
        eventDescription,
        price,
        ticketAvailable,
        eventCategory } = req.body;
        let eventImageURL = '';
        
        try {
            if (req.file && req.file.cloudStoragePublicUrl) {
                eventImageURL = req.file.cloudStoragePublicUrl
            }
            
            const newEvent = await Event.create({
                eventName,
                vendor,
                eventDate,
                eventLocation,
                eventDescription,
                price,
                ticketAvailable,
                eventCategory,
                eventImageURL
            });
            res.status(201).json({ message: 'Event created successfully'});
        } catch (err) {
            console.error(err); // Log the error for debugging
            res.status(500).json({ error: err.message });
        }
  };
  
exports.getAllEvents = async (req, res) => {
    try {
        const currentDateTime = new Date();    
        const events = await Event.findAll({
            where: {
                eventDate: {
                    [Op.gt]: currentDateTime  // Only include events where eventDate is greater than current date and time
                }
            }
        });
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.spesificEvent = async (req, res) => {
    const { eventId } = req.params;
  
    try {
        const event = await Event.findOne({where: {eventId}});
        res.status(200).json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.purchaseTicket = async (req, res) => {
    const { eventId } = req.params;
    const { id } = req.user;

    const ticketId = nanoid(16);
    const purchasedAt = new Date();
    
    try {
        const event = await Event.findByPk(eventId);
        if (event.ticketAvailable <= 0 ) {
            return res.status(400).json({ message: 'ticket already sold' });
        }
        
        const existingTicket = await Ticket.findOne({ where: { userId: id, eventId } });
        if (existingTicket) {
            return res.status(400).json({ error: 'User already has a ticket for this event' });
        }

        const user = await User.findByPk(id, { attributes: [ 'name', 'id' ] });

        const newTicket = Ticket.create({
            ticketId,
            eventId,
            eventName : event.eventName,
            eventDate : event.eventDate,
            eventLocation : event.eventLocation,
            eventImageURL : event.eventImageURL,
            userId : user.id,
            purchasedAt
        });
        
        await event.decrement('ticketAvailable', {by: 1});
        res.status(200).json({ message: 'Ticket purchased successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getAllticket = async (req, res) => {
    const { id } = req.user;
    
    try {
        const ticket = await Ticket.findAll({where: {userId: id}, attributes: [ 'ticketId', 'eventId', 'eventName', 'eventDate', 'eventLocation', 'eventImageURL', 'purchasedAt' ]});
        res.status(200).json(ticket);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}