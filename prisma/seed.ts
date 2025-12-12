import prisma from "@/lib/db";

async function main() {
    const products = [
        {
            title: "Classic White T-Shirt",
            slug: "classic-white-tshirt",
            description: "Soft cotton white t-shirt for daily wear.",
            price: 49900, // ₹499.00 → stored in paise
            images: [
                "https://images.pexels.com/photos/26755185/pexels-photo-26755185.jpeg",
                "https://images.pexels.com/photos/26755185/pexels-photo-26755185.jpeg"
            ],
            stock: 50,
        },
        {
            title: "Blue Denim Jeans",
            slug: "blue-denim-jeans",
            description: "Comfort-fit denim jeans with stretch.",
            price: 129900, // ₹1299.00
            images: [
                "https://images.pexels.com/photos/26755185/pexels-photo-26755185.jpeg",
            ],
            stock: 30,
        },
        {
            title: "Running Shoes",
            slug: "running-shoes",
            description: "Lightweight shoes suitable for running and training.",
            price: 249900, // ₹2499.00
            images: [
                "https://images.pexels.com/photos/26755185/pexels-photo-26755185.jpeg",
                "https://images.pexels.com/photos/26755185/pexels-photo-26755185.jpeg"
            ],
            stock: 20,
        }
    ];

    for (const product of products) {
        await prisma.product.create({ data: product });
    }

    console.log("Seed data success");
}

main()
.catch((e) => {
    console.error(e);
    process.exit(1);
})
.finally(async () => {
    await prisma.$disconnect();
});
