"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ContactTicket extends Model {
    static associate(models) {
      ContactTicket.belongsTo(models.User, {
        foreignKey: "repliedBy",
        as: "replier",
      });
    }
  }

  ContactTicket.init(
    {
      ticketCode: {
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      subject: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("open", "in_progress", "resolved", "closed"),
        allowNull: false,
        defaultValue: "open",
      },
      adminReply: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      repliedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      repliedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ContactTicket",
      tableName: "ContactTickets",
      timestamps: true,
      indexes: [
        { fields: ["status"], name: "idx_contact_tickets_status" },
        { fields: ["createdAt"], name: "idx_contact_tickets_created_at" },
      ],
    },
  );

  return ContactTicket;
};
