"use client"

import { useState, useEffect } from "react"
import { useWishlistStore, type WishlistItem } from "@/store/wishlist"
import WishlistFilters from "./WishlistFilters"
import WishlistSearch from "./WishListSearch"
import WishlistItemCard from "./WishListItemCard"
import { useToast } from "@/hooks/use-toast"
import Loader from "../Loader"
import { Heart, Search, Filter, ShoppingCart, AlertCircle } from "lucide-react"
import Button from "@/common/Button"

export default function WishlistComponent() {
    const { items, isLoading, isError, syncWishlistWithBackend, removeFromWishlist } = useWishlistStore()
    const [filteredItems, setFilteredItems] = useState<WishlistItem[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const { toast } = useToast();

    useEffect(() => {
        let result = items
        if (searchTerm) {
            result = result.filter(
                (item) =>
                    item.property?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.furniture?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.homeDecors?.name.toLowerCase().includes(searchTerm.toLowerCase()),
            )
        }
        if (selectedCategory !== "All") {
            result = result.filter(
                (item) =>
                    (item.property && selectedCategory === "Property") ||
                    (item.furniture && selectedCategory === "Furniture") ||
                    (item.homeDecors && selectedCategory === "Home Decors"),
            )
        }
        setFilteredItems(result)
    }, [items, searchTerm, selectedCategory])

    const handleRemoveFromWishlist = async (itemId:string) => {
        try {
            await removeFromWishlist(itemId)
            toast({
                title: "Item removed",
                description: "The item has been removed from your wishlist.",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to remove the item from your wishlist.",
                variant: "destructive",
            })
        }
    }

    const handleAddToCart = (item: WishlistItem) => {
        console.log("Adding to cart:", item)
        toast({
            title: "Added to cart",
            description: "The item has been added to your cart.",
        })
    }

    if (isLoading) return (
        <div className="w-full flex justify-center items-center min-h-[400px]">
            <Loader />
        </div>
    )

    if (isError) return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Error loading wishlist</h2>
                <p className="text-gray-600 mb-6">We encountered an issue while loading your wishlist items.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-[#3586FF]text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        </div>
    )

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex items-center gap-3 mb-2">
                <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
                <h2 className="heading-text">
                    My Wishlist
                </h2>
            </div>
            <p className="text-gray-600 label-text mb-8">Manage your saved items and preferences</p>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <Search className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-nowrap font-medium text-gray-700">Search your wishlist</span>
                    </div>
                    <WishlistSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </div>

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-500" />
                        <span className="md:text-sm text-[12px] font-medium text-gray-700">Filter by category</span>
                    </div>
                    <WishlistFilters selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
                </div>
            </div>

            {filteredItems?.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="md:text-xl  font-bold text-gray-700 mb-2">
                        {items.length === 0 ? "Your wishlist is empty" : "No matching items found"}
                    </h3>
                    <p className="text-gray-500 label-text mb-6 max-w-md mx-auto">
                        {items.length === 0
                            ? "Start exploring our collection and add items you love to your wishlist."
                            : "Try adjusting your search or filter to find what you're looking for."
                        }
                    </p>
                    <Button className="px-6 py-2 btn-text bg-[#3586FF]text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Browse Collection
                    </Button>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-700">
                            Showing <span className="font-bold">{filteredItems.length}</span> of <span className="font-bold">{items.length}</span> items
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <ShoppingCart className="w-4 h-4" />
                            <span>Ready to purchase? Add items to cart</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredItems.map((item) => (
                            <WishlistItemCard
                                key={item.id}
                                item={item}
                                onRemove={() => handleRemoveFromWishlist(item.id)}
                                onAddToCart={() => handleAddToCart(item)}
                            />
                        ))}
                    </div>

                    {filteredItems.length > 8 && (
                        <div className="mt-10 flex justify-center">
                            <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                                Load More
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}