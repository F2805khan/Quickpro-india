import Agent from "./Agent.js";
import AgentStats from "./AgentStats.js";
import File from "./File.js";
import AdminAlert from "./AdminAlert.js";
import AuditLog from "./AuditLog.js";
import AuthEvent from "./AuthEvent.js";
import AuthMethodSetting from "./AuthMethodSetting.js";
import BeautyArtist from "./BeautyArtist.js";
import Booking from "./Booking.js";
import Coupon from "./Coupon.js";
import Payment from "./Payment.js";
import PaymentMethodSetting from "./PaymentMethodSetting.js";
import Service from "./Service.js";
import SupportMessage from "./SupportMessage.js";
import User from "./User.js";
import Provider from "./Provider.js";
import Review from "./Review.js";
import ServiceBundle from "./ServiceBundle.js";
import Invoice from "./Invoice.js";
import ProviderAvailability from "./ProviderAvailability.js";
import ProviderServiceArea from "./ProviderServiceArea.js";
import Earning from "./Earning.js";
import Message from "./Message.js";
import ProviderLocation from "./ProviderLocation.js";
import Subscription from "./Subscription.js";
import Complaint from "./Complaint.js";

// Associations commented out as Sequelize is replaced with SupabaseModel
// AuthEvent.belongsTo(User, { foreignKey: "userId", targetKey: "_id", as: "user" });
// Booking.belongsTo(User, { foreignKey: "userId", targetKey: "_id", as: "customer" });
// Booking.belongsTo(Service, { foreignKey: "serviceId", targetKey: "_id", as: "service" });
// SupportMessage.belongsTo(User, { foreignKey: "userId", targetKey: "_id", as: "customer" });
// User.hasMany(AuthEvent, { foreignKey: "userId" });
// User.hasMany(Booking, { foreignKey: "userId" });
// User.hasMany(SupportMessage, { foreignKey: "userId" });

export { Agent, AgentStats, File, AdminAlert, AuditLog, AuthEvent, AuthMethodSetting, BeautyArtist, Booking, Coupon, Payment, PaymentMethodSetting, Service, SupportMessage, User, Provider, Review, ServiceBundle, Invoice, ProviderAvailability, ProviderServiceArea, Earning, Message, ProviderLocation, Subscription, Complaint };
