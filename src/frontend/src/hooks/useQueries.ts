import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CopperProductType,
  OrderStatus,
  PurchaseOrder,
  PurchaseOrderInput,
  SellerAvailability,
} from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [] as PurchaseOrder[];
      return (actor as any).getAllPurchaseOrders() as Promise<PurchaseOrder[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOrderSummary() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["orderSummary"],
    queryFn: async () => {
      if (!actor) return null;
      return (actor as any).getOrderSummary() as Promise<{
        cancelledOrders: bigint;
        totalOrders: bigint;
        pendingOrders: bigint;
        processingOrders: bigint;
        completedOrders: bigint;
        shippedOrders: bigint;
        awaitingReply: bigint;
      }>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOrderConfirmation(orderId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["orderConfirmation", orderId?.toString()],
    queryFn: async () => {
      if (!actor || orderId === null) return null;
      const result = await actor.getOrderConfirmation(orderId);
      return result as PurchaseOrder | null;
    },
    enabled: !!actor && !isFetching && orderId !== null,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: PurchaseOrderInput) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.submitPurchaseOrder(input as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orderSummary"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: { orderId: bigint; status: OrderStatus }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orderSummary"] });
    },
  });
}

export function useReplyToOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      availability,
      replyMessage,
    }: {
      orderId: bigint;
      availability: SellerAvailability;
      replyMessage: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).replyToOrder(orderId, availability, replyMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orderSummary"] });
    },
  });
}

export function useTrackOrder() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      orderId,
      email,
    }: { orderId: bigint; email: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).trackOrder(
        orderId,
        email,
      ) as Promise<PurchaseOrder | null>;
    },
  });
}

export interface ProductRate {
  productType: string;
  pricePerUnit: string;
  currency: string;
  unit: string;
  notes: string;
  updatedAt: bigint;
}

export function useGetProductRates() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["productRates"],
    queryFn: async () => {
      if (!actor) return [] as ProductRate[];
      return (actor as any).getProductRates() as Promise<ProductRate[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetProductRate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productType,
      pricePerUnit,
      currency,
      unit,
      notes,
    }: {
      productType: CopperProductType;
      pricePerUnit: string;
      currency: string;
      unit: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).setProductRate(
        productType,
        pricePerUnit,
        currency,
        unit,
        notes,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productRates"] });
    },
  });
}
