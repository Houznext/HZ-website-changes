import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type WishlistFiltersProps = {
    selectedCategory: string
    setSelectedCategory: (category: string) => void
}

export default function WishlistFilters({ selectedCategory, setSelectedCategory }: WishlistFiltersProps) {
    return (
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px] border-[1px] border-[#A1A0A0]">
                <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-white">
                <SelectItem className="cursor-pointer hover:bg-red-900 " value="All">All Categories</SelectItem>
                <SelectItem className="cursor-pointer hover:bg-red-900" value="Property">Property</SelectItem>
                <SelectItem className="cursor-pointer hover:bg-red-900" value="Furniture">Furniture</SelectItem>
                <SelectItem className="cursor-pointer hover:bg-red-900" value="Home Decors">Home Decors</SelectItem>
            </SelectContent>
        </Select>
    )
}

