import Array "mo:core/Array";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type CopperProductType = {
    #copperWire;
    #copperSheet;
    #copperPipe;
    #copperRod;
  };

  // ── Legacy type kept so the old stable variable `purchaseOrders` remains
  //    upgrade-compatible.  Do NOT remove until after the migration cycle.
  type PurchaseOrderLegacy = {
    id : Nat;
    timestamp : Int;
    email : Text;
    customerName : Text;
    companyName : Text;
    phoneNumber : Text;
    productType : CopperProductType;
    quantity : Nat;
    unitOfMeasurement : Text;
    requiredDeliveryDate : Text;
    specialNotes : Text;
    status : OrderStatus;
    sellerReply : ?Text;
    sellerAvailability : ?SellerAvailability;
    sellerReplyTimestamp : ?Int;
  };

  type ProductItem = {
    productType : CopperProductType;
    size : Text;
    quantity : Nat;
    unitOfMeasurement : Text;
  };

  type OrderStatus = {
    #pending;
    #processing;
    #shipped;
    #completed;
    #cancelled;
  };

  type SellerAvailability = {
    #available;
    #unavailable;
    #partial;
  };

  type PurchaseOrderInput = {
    email : Text;
    customerName : Text;
    companyName : Text;
    phoneNumber : Text;
    items : [ProductItem];
    requiredDeliveryDate : Text;
    specialNotes : Text;
  };

  type PurchaseOrder = {
    id : Nat;
    timestamp : Int;
    email : Text;
    customerName : Text;
    companyName : Text;
    phoneNumber : Text;
    items : [ProductItem];
    requiredDeliveryDate : Text;
    specialNotes : Text;
    status : OrderStatus;
    sellerReply : ?Text;
    sellerAvailability : ?SellerAvailability;
    sellerReplyTimestamp : ?Int;
  };

  type ProductRate = {
    productType : CopperProductType;
    pricePerUnit : Text;   // e.g. "850.00"
    currency : Text;       // e.g. "USD", "INR"
    unit : Text;           // e.g. "kg", "ton"
    notes : Text;          // optional seller notes
    updatedAt : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  module PurchaseOrderModule {
    public func compareByTimestamp(a : PurchaseOrder, b : PurchaseOrder) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  // ── Stable storage ──────────────────────────────────────────────────────────
  let purchaseOrders = Map.empty<Nat, PurchaseOrderLegacy>();
  let purchaseOrdersV2 = Map.empty<Nat, PurchaseOrder>();
  let productRates = Map.empty<Text, ProductRate>();

  // ── Default rates (INR) ─────────────────────────────────────────────────────
  productRates.add("copperWire", { productType = #copperWire; pricePerUnit = "850"; currency = "INR"; unit = "kg"; notes = ""; updatedAt = 0 });
  productRates.add("copperSheet", { productType = #copperSheet; pricePerUnit = "900"; currency = "INR"; unit = "kg"; notes = ""; updatedAt = 0 });
  productRates.add("copperPipe", { productType = #copperPipe; pricePerUnit = "950"; currency = "INR"; unit = "kg"; notes = ""; updatedAt = 0 });
  productRates.add("copperRod", { productType = #copperRod; pricePerUnit = "880"; currency = "INR"; unit = "kg"; notes = ""; updatedAt = 0 });
  // ────────────────────────────────────────────────────────────────────────────

  var nextOrderId = 1;
  var migrationDone = false;
  // ────────────────────────────────────────────────────────────────────────────

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();

  // ── Migration: runs once after upgrade ──────────────────────────────────────
  system func postupgrade() {
    if (not migrationDone) {
      var maxId = 0;
      for (old in purchaseOrders.values()) {
        let item : ProductItem = {
          productType = old.productType;
          size = "";
          quantity = old.quantity;
          unitOfMeasurement = old.unitOfMeasurement;
        };
        let newOrder : PurchaseOrder = {
          id = old.id;
          timestamp = old.timestamp;
          email = old.email;
          customerName = old.customerName;
          companyName = old.companyName;
          phoneNumber = old.phoneNumber;
          items = [item];
          requiredDeliveryDate = old.requiredDeliveryDate;
          specialNotes = old.specialNotes;
          status = old.status;
          sellerReply = old.sellerReply;
          sellerAvailability = old.sellerAvailability;
          sellerReplyTimestamp = old.sellerReplyTimestamp;
        };
        purchaseOrdersV2.add(old.id, newOrder);
        if (old.id > maxId) { maxId := old.id };
      };
      if (maxId >= nextOrderId) { nextOrderId := maxId + 1 };
      migrationDone := true;
    };
  };
  // ────────────────────────────────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    userProfiles.add(caller, profile);
  };

  public shared func submitPurchaseOrder(input : PurchaseOrderInput) : async Nat {
    let orderId = nextOrderId;
    nextOrderId += 1;
    let newOrder : PurchaseOrder = {
      id = orderId;
      timestamp = Time.now();
      email = input.email;
      customerName = input.customerName;
      companyName = input.companyName;
      phoneNumber = input.phoneNumber;
      items = input.items;
      requiredDeliveryDate = input.requiredDeliveryDate;
      specialNotes = input.specialNotes;
      status = #pending;
      sellerReply = null;
      sellerAvailability = null;
      sellerReplyTimestamp = null;
    };
    purchaseOrdersV2.add(orderId, newOrder);
    orderId;
  };

  public query func trackOrder(orderId : Nat, email : Text) : async ?PurchaseOrder {
    switch (purchaseOrdersV2.get(orderId)) {
      case (null) { null };
      case (?order) {
        if (order.email == email) { ?order } else { null };
      };
    };
  };

  public query func getOrderConfirmation(orderId : Nat) : async ?PurchaseOrder {
    purchaseOrdersV2.get(orderId);
  };

  public shared ({ caller }) func replyToOrder(orderId : Nat, availability : SellerAvailability, replyMessage : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can reply to orders");
    };
    switch (purchaseOrdersV2.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updated : PurchaseOrder = {
          order with
          sellerReply = ?replyMessage;
          sellerAvailability = ?availability;
          sellerReplyTimestamp = ?Time.now();
          status = switch (availability) {
            case (#available) { #processing };
            case (#unavailable) { #cancelled };
            case (#partial) { #processing };
          };
        };
        purchaseOrdersV2.add(orderId, updated);
      };
    };
  };

  public query ({ caller }) func getAllPurchaseOrders() : async [PurchaseOrder] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    purchaseOrdersV2.values().toArray().sort(PurchaseOrderModule.compareByTimestamp);
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, newStatus : OrderStatus) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    switch (purchaseOrdersV2.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        purchaseOrdersV2.add(orderId, { order with status = newStatus });
      };
    };
  };

  public query ({ caller }) func getOrderSummary() : async {
    totalOrders : Nat;
    pendingOrders : Nat;
    processingOrders : Nat;
    shippedOrders : Nat;
    completedOrders : Nat;
    cancelledOrders : Nat;
    awaitingReply : Nat;
  } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    var pending = 0;
    var processing = 0;
    var shipped = 0;
    var completed = 0;
    var cancelled = 0;
    var awaiting = 0;
    purchaseOrdersV2.values().forEach(func(order) {
      switch (order.status) {
        case (#pending) { pending += 1 };
        case (#processing) { processing += 1 };
        case (#shipped) { shipped += 1 };
        case (#completed) { completed += 1 };
        case (#cancelled) { cancelled += 1 };
      };
      switch (order.sellerReply) {
        case (null) { awaiting += 1 };
        case (_) {};
      };
    });
    {
      totalOrders = purchaseOrdersV2.size();
      pendingOrders = pending;
      processingOrders = processing;
      shippedOrders = shipped;
      completedOrders = completed;
      cancelledOrders = cancelled;
      awaitingReply = awaiting;
    };
  };

  public query ({ caller }) func getOrdersByStatus(status : OrderStatus) : async [PurchaseOrder] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    purchaseOrdersV2.values().toArray().filter(
      func(order) { order.status == status }
    ).sort(PurchaseOrderModule.compareByTimestamp);
  };

  public query ({ caller }) func getOrdersByCompany(companyName : Text) : async [PurchaseOrder] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    purchaseOrdersV2.values().toArray().filter(
      func(order) { order.companyName == companyName }
    ).sort(PurchaseOrderModule.compareByTimestamp);
  };

  // ── Rates management ────────────────────────────────────────────────────────

  public shared func setProductRate(
    productType : CopperProductType,
    pricePerUnit : Text,
    currency : Text,
    unit : Text,
    notes : Text,
  ) : async () {
    let key = switch (productType) {
      case (#copperWire) { "copperWire" };
      case (#copperSheet) { "copperSheet" };
      case (#copperPipe) { "copperPipe" };
      case (#copperRod) { "copperRod" };
    };
    productRates.add(key, {
      productType;
      pricePerUnit;
      currency;
      unit;
      notes;
      updatedAt = Time.now();
    });
  };

  public query func getProductRates() : async [ProductRate] {
    productRates.values().toArray();
  };
};
