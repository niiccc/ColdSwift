const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Event = require('./event');
const User = require('./User');

const Ticket = sequelize.define('Ticket', {
  ticketId: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    unique: true
  },
  eventId: {                
    type: DataTypes.INTEGER, 
    allowNull: true,
    references: {
        model: Event,
        key: 'eventId'
    }
  },
  eventName: {                
    type: DataTypes.STRING, 
    allowNull: true,
    references: {
        model: Event,
        key: 'eventName'
    }
  },
  eventDate: {                
    type: DataTypes.DATE, 
    allowNull: true,
    references: {
        model: Event,
        key: 'eventDate'
    }
  },
  eventLocation: {                
    type: DataTypes.STRING, 
    allowNull: true,
    references: {
        model: Event,
        key: 'eventLocation'
    }
  },
  eventImageURL: {                
    type: DataTypes.STRING, 
    allowNull: true,
    references: {
        model: Event,
        key: 'eventImageURL'
    }
  },
  // userName: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  //   references: {
  //       model: User,
  //       key: 'name',
  //   }
  // },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: User,
        key: 'id',
    }
  },
  purchasedAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  timestamps: false
});

module.exports = Ticket;