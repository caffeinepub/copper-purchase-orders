import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ProductItem {
    productType: CopperProductType;
    size: string;
    quantity: bigint;
    unitOfMeasurement: string;
}
export interface PurchaseOrder {
    id: bigint;
    customerName: string;
    status: OrderStatus;
    items: Array<ProductItem>;
    email: string;
    timestamp: bigint;
    companyName: string;
    phoneNumber: string;
    requiredDeliveryDate: string;
    specialNotes: string;
    sellerReply: string | null;
    sellerAvailability: SellerAvailability | null;
    sellerReplyTimestamp: bigint | null;
}
export interface UserProfile {
    name: string;
}
export interface PurchaseOrderInput {
    customerName: string;
    items: Array<ProductItem>;
    email: string;
    companyName: string;
    phoneNumber: string;
    requiredDeliveryDate: string;
    specialNotes: string;
}
export enum CopperProductType {
    copperPipe = "copperPipe",
    copperWire = "copperWire",
    copperSheet = "copperSheet",
    copperRod = "copperRod"
}
export enum OrderStatus {
    shipped = "shipped",
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    processing = "processing"
}
export enum SellerAvailability {
    available = "available",
    unavailable = "unavailable",
    partial = "partial"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface ProductRate {
    productType: string;
    pricePerUnit: string;
    currency: string;
    unit: string;
    notes: string;
    updatedAt: bigint;
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllPurchaseOrders(): Promise<Array<PurchaseOrder>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getOrderConfirmation(orderId: bigint): Promise<PurchaseOrder | null>;
    getOrderSummary(): Promise<{
        cancelledOrders: bigint;
        totalOrders: bigint;
        pendingOrders: bigint;
        processingOrders: bigint;
        completedOrders: bigint;
        shippedOrders: bigint;
        awaitingReply: bigint;
    }>;
    getOrdersByCompany(companyName: string): Promise<Array<PurchaseOrder>>;
    getOrdersByStatus(status: OrderStatus): Promise<Array<PurchaseOrder>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitPurchaseOrder(orderInput: PurchaseOrderInput): Promise<bigint>;
    updateOrderStatus(orderId: bigint, newStatus: OrderStatus): Promise<void>;
    replyToOrder(orderId: bigint, availability: SellerAvailability, replyMessage: string): Promise<void>;
    trackOrder(orderId: bigint, email: string): Promise<PurchaseOrder | null>;
    setProductRate(productType: CopperProductType, pricePerUnit: string, currency: string, unit: string, notes: string): Promise<void>;
    getProductRates(): Promise<Array<ProductRate>>;
}
