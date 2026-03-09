import CustomInput from "@/common/FormElements/CustomInput"


type WishlistSearchProps = {
    searchTerm: string
    setSearchTerm: (term: string) => void
}

export default function WishlistSearch({ searchTerm, setSearchTerm }: WishlistSearchProps) {
    return (
        <CustomInput
            type="text"
            placeholder="Search wishlist items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 flex-1 px-3 py-[4px] rounded-md" name={""} />
    )
}

