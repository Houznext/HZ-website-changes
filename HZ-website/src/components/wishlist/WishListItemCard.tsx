import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Trash2, ShoppingCart, Eye } from "lucide-react"
import { WishlistItem } from "@/store/wishlist"
import { Badge } from "../ui/badge"

type WishlistItemCardProps = {
    item: WishlistItem
    onRemove: (item: WishlistItem) => void
    onAddToCart: (item: WishlistItem) => void
}

export default function WishlistItemCard({ item, onRemove, onAddToCart }: WishlistItemCardProps) {
    const itemData = item.property || item.furniture || item.homeDecors

    if (!itemData) return null

    const discountedPrice = itemData.price - itemData.price * (itemData.discount / 100)

    return (
        <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-200">
            <CardContent className="p-0 relative">
                <div className="relative h-52 md:h-56 overflow-hidden">
                    <Image
                        src={itemData.images[0] || "/placeholder.svg"}
                        alt={itemData.name}
                        fill
                        style={{ objectFit: "cover" }}
                        className="group-hover:scale-105 transition-transform duration-300"
                    />

                    {itemData.discount > 0 && (
                        <Badge className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 text-xs font-bold">
                            {itemData.discount}% OFF
                        </Badge>
                    )}

                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="absolute bottom-3 left-3">
                        <Badge variant="secondary" className="text-xs bg-white/80 backdrop-blur-sm">
                            {item.property ? "Property" : item.furniture ? "Furniture" : "Home Decor"}
                        </Badge>
                    </div>
                </div>

                <div className="p-4">
                    <h3 className="font-semibold text-base md:text-lg mb-2 line-clamp-2 group-hover:text-[#3586FF] transition-colors">
                        {itemData.name}
                    </h3>

                    <div className="flex items-center mb-3">
                        <div className="flex items-center mr-2">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-3 h-3 md:w-4 md:h-4 ${i < itemData.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                />
                            ))}
                        </div>
                        <span className="text-xs md:text-sm text-gray-500 ml-1">({itemData.reviewCount || 0})</span>
                    </div>

                    {/* Price section */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-lg md:text-xl font-bold text-gray-900">₹{discountedPrice.toLocaleString()}</span>
                            {itemData.discount > 0 && (
                                <span className="text-xs md:text-sm text-gray-500 line-through">₹{itemData.price.toLocaleString()}</span>
                            )}
                        </div>

                        {itemData.discount > 0 && (
                            <div className="text-right">
                                <span className="text-xs font-medium text-green-600 block">You save</span>
                                <span className="text-xs font-bold text-green-600">₹{(itemData.price - discountedPrice).toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-3 bg-gray-50 border-t border-gray-100">
                <div className="flex w-full gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-9 text-xs md:text-sm rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
                        onClick={() => onRemove(item)}
                    >
                        <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        Remove
                    </Button>
                    <Button
                        size="sm"
                        className="flex-1 h-9 text-xs md:text-sm rounded-md bg-[#3586FF]hover:bg-blue-700 transition-colors"
                        onClick={() => onAddToCart(item)}
                    >
                        <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        Add to Cart
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}