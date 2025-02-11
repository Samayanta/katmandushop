import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createNewOrder, capturePayment } from "@/store/shop/order-slice";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { isLoading: orderLoading } = useSelector((state) => state.shopOrder);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymentStart] = useState(false);
  const [isKhaltiLoaded, setIsKhaltiLoaded] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Load Khalti SDK
    const script = document.createElement("script");
    script.src = "https://unpkg.com/khalti-checkout-web@2.2.0/dist/khalti-checkout.iffe.js";
    script.async = true;
    script.onload = () => {
      console.log('Khalti SDK loaded successfully');
      // Verify if KhaltiCheckout is available
      if (window.KhaltiCheckout) {
        setIsKhaltiLoaded(true);
      } else {
        console.error('KhaltiCheckout not found in window object');
        toast({
          title: "Failed to initialize payment system",
          description: "Please refresh the page or try again later",
          variant: "destructive",
        });
      }
    };
    script.onerror = (error) => {
      console.error('Error loading Khalti SDK:', error);
      toast({
        title: "Failed to load payment system",
        description: "Please refresh the page and try again",
        variant: "destructive",
      });
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [toast]);

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

  async function handleInitiateKhaltiPayment() {
    try {
      if (!isKhaltiLoaded) {
        toast({
          title: "Payment system is not ready",
          description: "Please wait a moment and try again",
          variant: "destructive",
        });
        return;
      }

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
        cartItems: cartItems.items.map((singleCartItem) => ({
          productId: singleCartItem?.productId,
          title: singleCartItem?.title,
          image: singleCartItem?.image,
          price:
            singleCartItem?.salePrice > 0
              ? singleCartItem?.salePrice
              : singleCartItem?.price,
          quantity: singleCartItem?.quantity,
        })),
        addressInfo: {
          addressId: currentSelectedAddress?._id,
          address: currentSelectedAddress?.address,
          city: currentSelectedAddress?.city,
          pincode: currentSelectedAddress?.pincode,
          phone: currentSelectedAddress?.phone,
          notes: currentSelectedAddress?.notes,
        },
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
      
      console.log('Creating order with:', orderData);
      setIsPaymentStart(true);

      try {
        const orderResponse = await dispatch(createNewOrder(orderData)).unwrap();
        console.log('Order creation response:', orderResponse);
        
        if (orderResponse?.success) {
            const config = {
              publicKey: process.env.VITE_KHALTI_PUBLIC_KEY,
              productIdentity: orderResponse.orderId,
              productName: "Ecommerce Order",
              amount: Math.round(totalCartAmount * 100),
              productUrl: window.location.origin,
              returnUrl: `${window.location.origin}/shop/payment-success`,
              websiteUrl: window.location.origin,
              merchantName: "MERN Ecommerce",
            "eventHandler": {
              async onSuccess(payload) {
                try {
                  console.log('Payment Success:', payload);
                  
                  const verificationResponse = await dispatch(capturePayment({
                    token: payload.token,
                    amount: payload.amount,
                    orderId: orderResponse.orderId
                  })).unwrap();
                  
                  if (verificationResponse?.success) {
                    navigate('/shop/payment-success');
                  } else {
                    throw new Error('Payment verification failed');
                  }
                } catch (error) {
                  console.error('Verification Error:', error);
                  toast({
                    title: "Payment verification failed",
                    description: error.message,
                    variant: "destructive",
                  });
                  setIsPaymentStart(false);
                }
              },
              onError(error) {
                console.error('Khalti Error:', error);
                toast({
                  title: "Payment failed",
                  description: error.message,
                  variant: "destructive",
                });
                setIsPaymentStart(false);
              },
              onClose() {
                console.log('Khalti widget closed');
                setIsPaymentStart(false);
              }
            }
          };

          console.log('Initializing Khalti checkout with config:', {
            ...config,
            publicKey: config.publicKey.substring(0, 10) + '...'
          });

          const checkout = new window.KhaltiCheckout(config);
          checkout.show();
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
              <span className="font-bold">${totalCartAmount}</span>
            </div>
          </div>
          <div className="mt-4 w-full">
            <Button 
              onClick={handleInitiateKhaltiPayment} 
              className="w-full"
              disabled={!isKhaltiLoaded || isPaymentStart || orderLoading}
            >
              {isPaymentStart || orderLoading
                ? "Processing Khalti Payment..."
                : !isKhaltiLoaded
                ? "Loading Payment System..."
                : "Pay with Khalti"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
