import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createNewOrder, capturePayment } from "@/store/shop/order-slice";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, useLocation } from "react-router-dom";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { isLoading: orderLoading } = useSelector((state) => state.shopOrder);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymentStart] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  async function handlePayment() {
    try {
      console.log('Starting payment process...');
      console.log('Cart items:', cartItems);
      
      if (!cartItems?.items || cartItems.items.length === 0) {
        toast({
          title: "Your cart is empty. Please add items to proceed",
          variant: "destructive",
        });
        return;
      }
      if (currentSelectedAddress === null) {
        toast({
          title: "Please select one address to proceed.",
          variant: "destructive",
        });
        return;
      }

      const orderData = {
        userId: user?.id,
        cartId: cartItems?._id,
        cartItems: cartItems.items.map((item) => ({
          productId: item?.productId,
          title: item?.title,
          image: item?.image,
          price: item?.salePrice > 0 
            ? item?.salePrice 
            : item?.price,
          quantity: item?.quantity,
          selectedColor: item?.selectedColor,
          selectedSize: item?.selectedSize,
        })),
        addressInfo: {
          addressId: currentSelectedAddress?._id,
          name: user?.name || currentSelectedAddress?.name || 'Customer',
          address: currentSelectedAddress?.address,
          city: currentSelectedAddress?.city,
          pincode: currentSelectedAddress?.pincode,
          phone: currentSelectedAddress?.phone,
          notes: currentSelectedAddress?.notes,
        },
        email: user?.email,
        name: user?.name || currentSelectedAddress?.name || 'Customer',
        orderStatus: "pending",
        paymentMethod: "khalti",
        paymentStatus: "pending",
        totalAmount: totalCartAmount,
        orderDate: new Date(),
        orderUpdateDate: new Date(),
      };

      if (orderLoading) {
        console.log('Order creation already in progress...');
        return;
      }
      
      console.log('Creating order with:', {
        ...orderData,
        customerName: orderData.addressInfo.name
      });
      setIsPaymentStart(true);

      try {
        const orderResponse = await dispatch(createNewOrder(orderData)).unwrap();
        console.log('Order creation response:', orderResponse);
        
        if (orderResponse?.success && orderResponse?.payment_url) {
          window.location.href = orderResponse.payment_url;
        } else {
          throw new Error('Failed to create order');
        }
      } catch (error) {
        console.error('Order/Payment Error:', error);
        toast({
          title: "Failed to process order",
          description: error.message,
          variant: "destructive",
        });
        setIsPaymentStart(false);
      }
    } catch (error) {
      console.error('Checkout Error:', error);
      toast({
        title: "An unexpected error occurred",
        description: error.message,
        variant: "destructive",
      });
      setIsPaymentStart(false);
    }
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" alt="Checkout banner" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />
        <div className="flex flex-col gap-4">
          {cartItems && cartItems.items && cartItems.items.length > 0
            ? cartItems.items.map((item) => (
                <UserCartItemsContent key={item.productId} cartItem={item} />
              ))
            : null}
          <div className="mt-8 space-y-4">
            <div className="flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">रू {totalCartAmount}</span>
            </div>
          </div>
          <div className="mt-4 space-y-4 border-t pt-4">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <div className="p-2 border rounded-md bg-gray-50">
                <span>Khalti</span>
              </div>
            </div>
            <Button 
              onClick={handlePayment} 
              className="w-full"
              disabled={isPaymentStart || orderLoading}
            >
              {isPaymentStart || orderLoading
                ? "Processing Khalti Payment..."
                : "Pay with Khalti"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
