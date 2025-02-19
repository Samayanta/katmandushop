import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";

function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
}) {
  return (
    <Card className="w-full h-full flex flex-col group">
      <div 
        onClick={() => handleGetProductDetails(product?._id)}
        className="flex-1 cursor-pointer"
      >
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product?.image}
            alt={product?.title}
            className="w-full h-full object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105"
          />
          {product?.totalStock === 0 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-[10px] sm:text-xs px-1.5 py-0.5">
              Out Of Stock
            </Badge>
          ) : product?.totalStock < 10 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              {`Only ${product?.totalStock} items left`}
            </Badge>
          ) : product?.salePrice > 0 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              Sale
            </Badge>
          ) : null}
        </div>
        <CardContent className="p-2 sm:p-3 md:p-4 flex-1">
          <h2 className="text-sm sm:text-base md:text-lg font-bold mb-1.5 sm:mb-2 line-clamp-2 min-h-[2.5em]">{product?.title}</h2>
          <div className="flex justify-between items-center mb-1.5 sm:mb-2 flex-wrap gap-1">
            <span className="text-xs sm:text-sm text-muted-foreground">
              {categoryOptionsMap[product?.category]}
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {brandOptionsMap[product?.brand]}
            </span>
          </div>
          <div className="flex flex-wrap justify-between items-center gap-1 sm:gap-2">
            <span
              className={`${
                product?.salePrice > 0 ? "line-through text-muted-foreground" : ""
              } text-sm sm:text-base md:text-lg font-semibold text-primary`}
            >
              रू {product?.price}
            </span>
            {product?.salePrice > 0 ? (
              <span className="text-sm sm:text-base md:text-lg font-semibold text-primary">
                रू {product?.salePrice}
              </span>
            ) : null}
          </div>
        </CardContent>
      </div>
      <CardFooter className="p-2 sm:p-3 md:p-4">
        {product?.totalStock === 0 ? (
          <Button className="w-full opacity-60 cursor-not-allowed">
            Out Of Stock
          </Button>
        ) : (
          <Button
            onClick={() => handleAddtoCart(product?._id, product?.totalStock)}
            className="w-full"
          >
            Add to cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default ShoppingProductTile;
