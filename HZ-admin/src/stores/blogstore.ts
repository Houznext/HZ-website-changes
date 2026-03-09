import { create } from "zustand";


export const useBlogsStore = create((set) => ({
    blogs: [
        {
            id: 1,
            title: "Interiors",
            previewDescription: "Explore the world of minimalist and cozy designs.",
            thumbnailImageUrl:
                "https://images.unsplash.com/photo-1501594907352-04cda38ebc29",
            CoverImageUrl:
                "https://images.unsplash.com/photo-1560448204-e42f0fb8fa4b",
            externalResourceLink: "https://interiordesign.com/article",
            blogType: "Interiors",
            blogStatus: "Featured",
            content:
                "<p>Your home is your sanctuary, and it deserves to reflect your style and comfort. Whether you love a minimalist aesthetic, bold colors, or cozy, rustic vibes, the right interior design can transform any space into your dream haven.</p>",
            createdById: null,
            updatedById: null,
            createdAt: "2024-10-21T12:24:51.880Z",
            updatedAt: "2024-10-22T03:50:01.396Z",
        },
        {
            id: 2,
            title: "Outdoor Living Spaces",
            previewDescription: "Bring the outdoors inside with these modern patios.",
            thumbnailImageUrl:
                "https://images.unsplash.com/photo-1501594907352-04cda38ebc29",
            CoverImageUrl:
                "https://images.unsplash.com/photo-1560448204-e42f0fb8fa4b",
            externalResourceLink: "https://homestyle.com/outdoor-living",
            blogType: "Outdoor",
            blogStatus: "Popular",
            content:
                "<p>Enhance your outdoor space with modern furniture and natural aesthetics that create a welcoming and stylish patio area.</p>",
            createdById: null,
            updatedById: null,
            createdAt: "2024-10-20T09:15:21.123Z",
            updatedAt: "2024-10-21T08:50:01.396Z",
        },
        {
            id: 3,
            title: "Kitchen Renovation Tips",
            previewDescription:
                "Upgrade your kitchen with simple yet effective ideas.",
            thumbnailImageUrl:
                "https://images.unsplash.com/photo-1501594907352-04cda38ebc29",
            CoverImageUrl:
                "https://images.unsplash.com/photo-1560448204-e42f0fb8fa4b",
            externalResourceLink: "https://kitchenideas.com/renovation",
            blogType: "Renovation",
            blogStatus: "New",
            content:
                "<p>A kitchen renovation can bring a fresh new look to your home, improve functionality, and increase your home's value. Discover our top tips to make your kitchen renovation a success.</p>",
            createdById: null,
            updatedById: null,
            createdAt: "2024-10-19T08:30:51.880Z",
            updatedAt: "2024-10-19T14:50:01.396Z",
        },
        {
            id: 4,
            title: "Eco-Friendly Home Ideas",
            previewDescription: "Discover sustainable ways to upgrade your home.",
            thumbnailImageUrl:
                "https://images.unsplash.com/photo-1501594907352-04cda38ebc29",
            CoverImageUrl:
                "https://images.unsplash.com/photo-1560448204-e42f0fb8fa4b",
            externalResourceLink: "https://ecohome.com/ideas",
            blogType: "Eco",
            blogStatus: "Trending",
            content:
                "<p>From solar panels to sustainable materials, these eco-friendly home ideas can help you create a greener and more efficient living space.</p>",
            createdById: null,
            updatedById: null,
            createdAt: "2024-10-18T14:24:51.880Z",
            updatedAt: "2024-10-19T03:50:01.396Z",
        },
        {
            id: 5,
            title: "Bathroom Design Trends",
            previewDescription:
                "Upgrade your bathroom with the latest design trends.",
            thumbnailImageUrl:
                "https://images.unsplash.com/photo-1501594907352-04cda38ebc29",
            CoverImageUrl:
                "https://images.unsplash.com/photo-1560448204-e42f0fb8fa4b",
            externalResourceLink: "https://homedesign.com/bathroom-trends",
            blogType: "Bathroom",
            blogStatus: "Popular",
            content:
                "<p>From modern tiles to elegant fixtures, learn about the latest trends in bathroom design to give your space a fresh new look.</p>",
            createdById: null,
            updatedById: null,
            createdAt: "2024-10-18T10:24:51.880Z",
            updatedAt: "2024-10-18T13:50:01.396Z",
        },
        {
            id: 6,
            title: "Cozy Bedroom Decor Ideas",
            previewDescription: "Create a warm and inviting bedroom.",
            thumbnailImageUrl:
                "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
            CoverImageUrl:
                "https://images.unsplash.com/photo-1533616688410-06c1b83b9d62",
            externalResourceLink: "https://bedroomdecor.com/cozy-ideas",
            blogType: "Bedroom",
            blogStatus: "Featured",
            content:
                "<p>Discover how to create a cozy bedroom with warm tones, soft textiles, and the right lighting to make it your favorite room in the house.</p>",
            createdById: null,
            updatedById: null,
            createdAt: "2024-10-17T12:24:51.880Z",
            updatedAt: "2024-10-17T17:50:01.396Z",
        },
        {
            id: 7,
            title: "Living Room Layout Tips",
            previewDescription:
                "Arrange your living room for maximum comfort and style.",
            thumbnailImageUrl:
                "https://images.unsplash.com/photo-1501594907352-04cda38ebc29",
            CoverImageUrl:
                "https://images.unsplash.com/photo-1560448204-e42f0fb8fa4b",
            externalResourceLink: "https://livingroomstyle.com/layout-tips",
            blogType: "Living Room",
            blogStatus: "New",
            content:
                "<p>A well-thought-out living room layout can make a big difference. Learn how to optimize your space for comfort and style with our expert tips.</p>",
            createdById: null,
            updatedById: null,
            createdAt: "2024-10-16T14:24:51.880Z",
            updatedAt: "2024-10-16T18:50:01.396Z",
        },
        {
            id: 8,
            title: "Home Office Essentials",
            previewDescription: "Set up a functional and stylish home office.",
            thumbnailImageUrl:
                "https://images.unsplash.com/photo-1501594907352-04cda38ebc29",
            CoverImageUrl:
                "https://images.unsplash.com/photo-1560448204-e42f0fb8fa4b",
            externalResourceLink: "https://homeofficedesign.com/essentials",
            blogType: "Office",
            blogStatus: "Popular",
            content:
                "<p>Create a productive home office with comfortable furniture, proper lighting, and organization tips that keep your workspace tidy and inspiring.</p>",
            createdById: null,
            updatedById: null,
            createdAt: "2024-10-15T09:24:51.880Z",
            updatedAt: "2024-10-15T12:50:01.396Z",
        },
        {
            id: 9,
            title: "Maximizing Small Spaces",
            previewDescription: "Make the most of limited space with clever design.",
            thumbnailImageUrl:
                "https://images.unsplash.com/photo-1501594907352-04cda38ebc29",
            CoverImageUrl:
                "https://images.unsplash.com/photo-1560448204-e42f0fb8fa4b",
            externalResourceLink: "https://smalldesign.com/maximize-space",
            blogType: "Small Spaces",
            blogStatus: "Trending",
            content:
                "<p>Discover practical solutions and stylish ideas to maximize space in small apartments and cozy homes.</p>",
            createdById: null,
            updatedById: null,
            createdAt: "2024-10-14T14:24:51.880Z",
            updatedAt: "2024-10-14T15:50:01.396Z",
        },
        {
            id: 10,
            title: "Home Automation Basics",
            previewDescription: "Make your home smarter with automation.",
            thumbnailImageUrl:
                "https://images.unsplash.com/photo-1501594907352-04cda38ebc29",
            CoverImageUrl:
                "https://images.unsplash.com/photo-1560448204-e42f0fb8fa4b",
            externalResourceLink: "https://smarthomeliving.com/basics",
            blogType: "Automation",
            blogStatus: "Featured",
            content:
                "<p>Transform your home with smart devices, automated lighting, and connected home systems to make life easier and more enjoyable.</p>",
            createdById: null,
            updatedById: null,
            createdAt: "2024-10-13T12:24:51.880Z",
            updatedAt: "2024-10-13T13:50:01.396Z",
        },
    ],
}));