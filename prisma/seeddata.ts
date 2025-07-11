import { PrismaClient } from "@prisma/client";

const db = new PrismaClient({
	log: ["error", "warn"],
});

export async function seedInitData() {
	// First create restricted areas
	await db.$transaction(async (tx) => {
		// Create restricted areas
		const restrictedAreas = await Promise.all([
			tx.restrictedArea.create({
				data: {
					name: "All except West",
					description: "All areas except West region",
				},
			}),
			tx.restrictedArea.create({
				data: {
					name: "Off-Shore Island",
					description: "Off-Shore Island locations",
				},
			}),
			tx.restrictedArea.create({
				data: {
					name: "Central Business District",
					description: "Central Business District area",
				},
			}),
			tx.restrictedArea.create({
				data: {
					name: "Sentosa",
					description: "Sentosa island",
				},
			}),
			tx.restrictedArea.create({
				data: {
					name: "Jurong Island",
					description: "Jurong Island industrial area",
				},
			}),
			tx.restrictedArea.create({
				data: {
					name: "Airline Road",
					description: "Airline Road area",
				},
			}),
		]);

		// Array indices for restricted areas:
		// [0] = "All except West"
		// [1] = "Off-Shore Island" 
		// [2] = "Central Business District"
		// [3] = "Sentosa"
		// [4] = "Jurong Island"
		// [5] = "Airline Road"

		// Create caterers
		const chilliApiCaterer = await tx.caterer.create({
			data: {
				name: "Chilli Api Catering",
			},
		});

		const continentalDelightCaterer = await tx.caterer.create({
			data: {
				name: "Continental Delight Catering Services",
			},
		});

		const testVendorCaterer = await tx.caterer.create({
			data: {
				name: "TEST VENDOR",
			},
		});

		// Create Chilli Api Catering Menu 101
		const chilliApiMenu101 = await tx.catererMenu.create({
			data: {
				code: "CHILLI_API_101",
				type: "SMALL_QTY_REFRESHMENT",
				pricePerPerson: 5.0, // $5.00 in cents
				minimumOrder: 20,
				maxFriedItems: 1,
				notes:
					"Dishes are prepared using Healthier Oils and Lower Sodium Ingredients. Fresh Fruits can be selected to substitute any 1 item.",
				catererID: chilliApiCaterer.id,
				restrictedAreas: {
					connect: [
						{ id: restrictedAreas[0].id }, // All except West
					],
				},
				discounts: {
					create: [
						{
							type: "BELOW_500",
							discount: 4,
						},
					],
				},
				sections: {
					create: [
						{
							title: "Snack and Pastry",
							description: "Choose from various snacks and pastries",
							selectionLimit: 4,
							order: 1,
							items: {
								create: [
									{
										name: "Wholemeal Tea Sandwich w Chicken Ham",
										order: 1,
										vegetarian: false,
										fried: false,
									},
									{
										name: "Wholemeal Tea Sandwich w Tuna Mayo",
										order: 2,
										vegetarian: false,
										fried: false,
									},
									{
										name: "Wholemeal Vegetarian Sandwich w Cheese",
										order: 3,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Wholemeal Tea Vegetable Sandwich",
										order: 4,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Steamed Savory Yam Kueh served with Sweet Sauce",
										order: 5,
										vegetarian: false,
										fried: false,
									},
									{
										name: "Steamed Chee Cheong Fun served w Sweet Sauce & Chilli Sauce",
										order: 6,
										vegetarian: false,
										fried: false,
									},
									{
										name: "Steamed Wholemeal Shitake Mushroom Bun",
										order: 7,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Steamed Wholemeal Vegetable Bun",
										order: 8,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Steamed Wholemeal Tao Sar Bun",
										order: 9,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Pan-fried Savoury Yam Kueh served w Sweet Sauce & Chilli Sauce",
										order: 10,
										vegetarian: false,
										fried: false,
									},
									{
										name: "Steamed Chwee Kueh w Chicken Filling, Sweet Sauce & Chilli Sauce",
										order: 11,
										vegetarian: false,
										fried: false,
									},
									{
										name: "Steamed Mini Soon Kueh w Sesame, Sweet Sauce & Chilli Sauce",
										order: 12,
										vegetarian: false,
										fried: false,
									},
									{
										name: "Vegetable Spring Roll (Deep Fried)",
										order: 13,
										vegetarian: true,
										fried: true,
									},
									{
										name: "Golden Sweet Banana Fritter (Deep Fried)",
										order: 14,
										vegetarian: true,
										fried: true,
									},
									{
										name: "Golden Peanut Sesame Ball (Deep Fried)",
										order: 15,
										vegetarian: false,
										fried: true,
									},
									{
										name: "Golden Curry Puff (Deep Fried)",
										order: 16,
										vegetarian: false,
										fried: true,
									},
									{
										name: "Golden Chicken Nugget (Deep Fried)",
										order: 17,
										vegetarian: false,
										fried: true,
									},
									{
										name: "Cocktail Curry Samosa (Deep Fried)",
										order: 18,
										vegetarian: false,
										fried: true,
									},
									{
										name: "Thai Fish Finger (Deep Fried)",
										order: 19,
										vegetarian: false,
										fried: true,
									},
									{
										name: "Golden Vietnamese Spring Roll (Deep Fried)",
										order: 20,
										vegetarian: false,
										fried: true,
									},
									{
										name: "Thai Shrimp Cake (Deep Fried)",
										order: 21,
										vegetarian: false,
										fried: true,
									},
									{
										name: "Deep-fried Chicken Winglet (Deep Fried)",
										order: 22,
										vegetarian: false,
										fried: true,
									},
									{
										name: "Buttermilk Pan Cake w Gula Melaka Banana Sauce",
										order: 23,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Charcoal Chocolate Cup Cake",
										order: 24,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Pandan Chiffon Cake",
										order: 25,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Banana Sliced Cake",
										order: 26,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Red Velvet Cake",
										order: 27,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Portuguese Egg Tart",
										order: 28,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Pandan Butter Cake",
										order: 29,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Mini Chocolate Eclair",
										order: 30,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Bite Size Pandan Swiss Roll",
										order: 31,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Freshly Baked Blueberry Muffin",
										order: 32,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Marble Cake",
										order: 33,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Steamed Kueh Salat",
										order: 34,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Handrolled Kueh Dadar",
										order: 35,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Harum Manis w Banana",
										order: 36,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Sliced Baked Ubi",
										order: 37,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Kueh Koswee",
										order: 38,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Sliced Rainbow Lapis",
										order: 39,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Steamed Mini Soon Kueh w Sweet Sauce & Chilli Sauce",
										order: 40,
										vegetarian: true,
										fried: false,
									},
								],
							},
						},
						{
							title: "Beverages",
							description: "Complimentary Water will be provided",
							selectionLimit: 1,
							order: 2,
							items: {
								create: [
									{
										name: "Drinking Water",
										order: 1,
										vegetarian: true,
										fried: false,
									},
								],
							},
						},
					],
				},
			},
		});

		// Create Chilli Api Catering Menu 102
		const chilliApiMenu102 = await tx.catererMenu.create({
			data: {
				code: "CHILLI_API_102",
				type: "SMALL_QTY_REFRESHMENT",
				pricePerPerson: 7.0, // $7.00 in cents
				minimumOrder: 20,
				maxFriedItems: 1,
				notes:
					"All options are made with wholegrain. Dishes are prepared using Healthier Oils and Lower Sodium Ingredients. Fresh Fruits can be selected to substitute any 1 item.",
				catererID: chilliApiCaterer.id,
				restrictedAreas: {
					connect: [
						{ id: restrictedAreas[0].id }, // All except West
					],
				},
				discounts: {
					create: [
						{
							type: "BELOW_500",
							discount: 4,
						},
					],
				},
				sections: {
					create: [
						{
							title: "Rice and Noodle",
							description: "All options are made with wholegrain",
							selectionLimit: 1,
							order: 1,
							items: {
								create: [
									{
										name: "Thai Style Pineapple Fried Rice (Brown Rice)",
										order: 1,
										vegetarian: false,
										fried: false,
									},
									{
										name: "Butter Fried Rice w Chicken Ham & topped w Raisin (Brown Rice)",
										order: 2,
										vegetarian: false,
										fried: false,
									},
									{
										name: "Api's Seafood Mee Goreng (Wholegrain)",
										order: 3,
										vegetarian: false,
										fried: false,
									},
									{
										name: "Tom Yum Seafood Rice Vermicelli (Brown Rice)",
										order: 4,
										vegetarian: false,
										fried: false,
									},
									{
										name: "Singapore Style Fried Rice (Brown Rice)",
										order: 5,
										vegetarian: false,
										fried: false,
									},
									{
										name: "Nonya Sambal Seafood Fried Rice (Brown Rice)",
										order: 6,
										vegetarian: false,
										fried: false,
									},
									{
										name: "Thai Style Tom Yum Seafood Fried Rice (Brown Rice)",
										order: 7,
										vegetarian: false,
										fried: false,
									},
									{
										name: "Signature Kampong Fried Mee Siam (Brown Rice)",
										order: 8,
										vegetarian: false,
										fried: false,
									},
									{
										name: "Vegetarian Fried Rice w Shitake Mushroom & Edamame (Brown Rice)",
										order: 9,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Vegetarian Fried Mee Hoon (Brown Rice)",
										order: 10,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Wok-fried Mee Hoon (Brown Rice)",
										order: 11,
										vegetarian: false,
										fried: false,
									},
									{
										name: "Malaysian Style Wok-fried Mee Tai Bak (Wholegrain)",
										order: 12,
										vegetarian: false,
										fried: false,
									},
								],
							},
						},
						{
							title: "Snack and Pastry",
							description: "Choose from various snacks and pastries",
							selectionLimit: 4,
							order: 2,
							items: {
								create: [
									{
										name: "Steamed Chee Cheong Fun served w Sweet Sauce & Chilli Sauce",
										order: 1,
										vegetarian: false,
										fried: false,
									},
									{
										name: "Steamed Wholemeal Shitake Mushroom Bun",
										order: 2,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Buttermilk Pan Cake w Gula Melaka Banana Sauce",
										order: 3,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Cocktail Curry Samosa (Deep Fried)",
										order: 4,
										vegetarian: false,
										fried: true,
									},
									{
										name: "Golden Curry Puff (Deep Fried)",
										order: 5,
										vegetarian: false,
										fried: true,
									},
									{
										name: "Sliced Rainbow Lapis",
										order: 6,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Golden Chicken Nugget (Deep Fried)",
										order: 7,
										vegetarian: false,
										fried: true,
									},
									{
										name: "Thai Fish Finger (Deep Fried)",
										order: 8,
										vegetarian: false,
										fried: true,
									},
									{
										name: "Golden Vietnamese Spring Roll (Deep Fried)",
										order: 9,
										vegetarian: false,
										fried: true,
									},
									{
										name: "Deep-fried Chicken Winglet (Deep Fried)",
										order: 10,
										vegetarian: false,
										fried: true,
									},
									{
										name: "Thai Shrimp Cake (Deep Fried)",
										order: 11,
										vegetarian: false,
										fried: true,
									},
									{
										name: "Vegetable Spring Roll (Deep Fried)",
										order: 12,
										vegetarian: true,
										fried: true,
									},
									{
										name: "Golden Sweet Banana Fritter (Deep Fried)",
										order: 13,
										vegetarian: true,
										fried: true,
									},
								],
							},
						},
						{
							title: "Beverages",
							description: "Complimentary Water will be provided",
							selectionLimit: 1,
							order: 3,
							items: {
								create: [
									{
										name: "Drinking Water Can",
										order: 1,
										vegetarian: true,
										fried: false,
									},
								],
							},
						},
					],
				},
			},
		});

		// Create Continental Delight Catering Menu 101
		const continentalMenu101 = await tx.catererMenu.create({
			data: {
				code: "CONTINENTAL_101",
				type: "SMALL_QTY_REFRESHMENT",
				pricePerPerson: 5.0, // $5.00 in cents
				minimumOrder: 20,
				maxFriedItems: 1,
				notes:
					"All options are made with wholegrain. Dishes are prepared using Healthier Oils and Lower Sodium Ingredients. Fresh Fruits can be selected to substitute any 1 item.",
				catererID: continentalDelightCaterer.id,
				restrictedAreas: {
					connect: [
						{ id: restrictedAreas[1].id }, // Off-Shore Island
					],
				},
				discounts: {
					create: [
						{
							type: "BELOW_500",
							discount: 2,
						},
					],
				},
				sections: {
					create: [
						{
							title: "Rice and Noodle",
							description: "All options are made with wholegrain",
							selectionLimit: 1,
							order: 1,
							items: {
								create: [
									{
										name: "Butter Raisin Rice",
										order: 1,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Nonya Fried Mee Siam",
										order: 2,
										vegetarian: false,
										fried: false,
									},
									{
										name: "Hong Kong Noodle",
										order: 3,
										vegetarian: false,
										fried: false,
									},
									{
										name: "Sin Chow Bee Hoon",
										order: 4,
										vegetarian: false,
										fried: false,
									},
									{
										name: "Mee Goreng",
										order: 5,
										vegetarian: false,
										fried: false,
									},
									{
										name: "Tuna Mayo Sandwich",
										order: 6,
										vegetarian: false,
										fried: false,
									},
									{
										name: "Vegetarian Bee Hoon",
										order: 7,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Egg Mayo Sandwich",
										order: 8,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Yang Chow Fried Rice",
										order: 9,
										vegetarian: true,
										fried: false,
									},
								],
							},
						},
						{
							title: "Snack and Pastry",
							description: "Choose from various snacks and pastries",
							selectionLimit: 3,
							order: 2,
							items: {
								create: [
									{
										name: "Fruit Tartlet",
										order: 1,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Marble Cake",
										order: 2,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Banana Cake",
										order: 3,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Chocolate Muffin",
										order: 4,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Mini Cream Puff",
										order: 5,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Steamed Carrot Cake",
										order: 6,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Banana Muffin",
										order: 7,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Steamed Coffee Pau",
										order: 8,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Steamed Chee Cheong Fan",
										order: 9,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Steamed Yam Cake",
										order: 10,
										vegetarian: false,
										fried: false,
									},
									{
										name: "Steamed Kaya Pau",
										order: 11,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Mini Swiss Roll",
										order: 12,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Pandan Cake",
										order: 13,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Gu You Butter Cake",
										order: 14,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Steamed Soon Kueh",
										order: 15,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Steamed Crystal Dumpling",
										order: 16,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Mini Chocolate Éclair",
										order: 17,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Steamed Chicken Siew Mai",
										order: 18,
										vegetarian: false,
										fried: false,
									},
									{
										name: "Steamed Chicken Pau",
										order: 19,
										vegetarian: false,
										fried: false,
									},
									{
										name: "Steamed Red Bean Pau",
										order: 20,
										vegetarian: true,
										fried: false,
									},
									{
										name: "Sliced Fruit Cake",
										order: 21,
										vegetarian: true,
										fried: false,
									},
								],
							},
						},
						{
							title: "Beverages",
							description: "Complimentary Water will be provided",
							selectionLimit: 1,
							order: 3,
							items: {
								create: [
									{
										name: "Tetra Pack Water",
										order: 1,
										vegetarian: true,
										fried: false,
									},
								],
							},
						},
					],
				},
			},
		});

		// Create TEST VENDOR Menu 201 (Buffet)
		const testVendorMenu201 = await tx.catererMenu.create({
			data: {
				code: "TEST_VENDOR_201",
				type: "SMALL_QTY_BUFFET",
				pricePerPerson: 10.0, // $10.00 in cents
				minimumOrder: 20,
				maxFriedItems: 3,
				notes: "Test buffet menu",
				catererID: testVendorCaterer.id,
				restrictedAreas: {
					connect: [
						{ id: restrictedAreas[0].id }, // All except West
						{ id: restrictedAreas[5].id }, // Airline Road
					],
				},
				discounts: {
					create: [
						{
							type: "BELOW_500",
							discount: 2,
						},
					],
				},
			},
		});

		// Create TEST VENDOR Menu 101 (Refreshment)
		const testVendorMenu101 = await tx.catererMenu.create({
			data: {
				code: "TEST_VENDOR_101",
				type: "SMALL_QTY_REFRESHMENT",
				pricePerPerson: 5.0, // $5.00 in cents
				minimumOrder: 20,
				maxFriedItems: 1,
				notes: "Test refreshment menu",
				catererID: testVendorCaterer.id,
				restrictedAreas: {
					connect: [
						{ id: restrictedAreas[1].id }, // Off-Shore Island
						{ id: restrictedAreas[3].id }, // Sentosa
						{ id: restrictedAreas[4].id }, // Jurong Island
					],
				},
				discounts: {
					create: [
						{
							type: "BELOW_500",
							discount: 2,
						},
					],
				},
			},
		});

		return {
			caterers: [
				chilliApiCaterer,
				continentalDelightCaterer,
				testVendorCaterer,
			],
			menus: [
				chilliApiMenu101,
				chilliApiMenu102,
				continentalMenu101,
				testVendorMenu201,
				testVendorMenu101,
			],
			restrictedAreas,
		};
	});
}
