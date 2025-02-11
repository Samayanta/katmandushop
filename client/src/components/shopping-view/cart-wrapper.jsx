import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Load product data when cart is opened
    dispatch(fetchAllFilteredProducts({ filterParams: {}, sortParams: "" }));
  }, []); // Run once when component mounts

  const items = cartItems?.items || [];
  
  const totalCartAmount = items.length > 0
    ? items.reduce(
        (sum, currentItem) =>
          sum +
          (currentItem?.salePrice > 0
            ? currentItem?.salePrice
            : currentItem?.price) *
            currentItem?.quantity,
        0
      )
    : 0;

  return (
    <SheetContent className="sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Your Cart</SheetTitle>
      </SheetHeader>
      <div className="mt-8 space-y-4">
        {items.length > 0 ? (
          items.map((item) => (
            <UserCartItemsContent 
              key={`${item.productId}-${item.selectedColor}`} 
              cartItem={item} 
            />
          ))
        ) : (
          <div className="text-center text-gray-500">Your cart is empty</div>
        )}
      </div>
      <div className="mt-8 space-y-4">
        <div className="flex justify-between">
          <span className="font-bold">Total</span>
          <span className="font-bold">${totalCartAmount.toFixed(2)}</span>
        </div>
      </div>
      <Button
        onClick={() => {
          navigate("/shop/checkout");
          setOpenCartSheet(false);
        }}
        className="w-full mt-6"
        disabled={items.length === 0}
      >
        Checkout
      </Button>
    </SheetContent>
  );
}

export default UserCartWrapper;
