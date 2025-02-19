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
    <SheetContent className="flex flex-col h-full p-0 sm:max-w-md">
      <SheetHeader className="p-4 sm:p-6">
        <SheetTitle>Your Cart</SheetTitle>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto px-4 sm:px-6">
        <div className="space-y-4">
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
      </div>
      <div className="border-t bg-background mt-auto p-4 sm:p-6">
        <div className="flex justify-between mb-4">
          <span className="text-base sm:text-lg font-bold">Total</span>
          <span className="text-base sm:text-lg font-bold">रू {totalCartAmount.toFixed(2)}</span>
        </div>
        <Button
          onClick={() => {
            navigate("/shop/checkout");
            setOpenCartSheet(false);
          }}
          className="w-full"
          disabled={items.length === 0}
          size="lg"
        >
          Checkout
        </Button>
      </div>
    </SheetContent>
  );
}

export default UserCartWrapper;
