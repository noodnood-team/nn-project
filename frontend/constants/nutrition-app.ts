export const NUTRITION_APP = {
  brand: {
    name: "Noodnood",
  },
  alt: {
    logo: "Noodnood Logo",
    foodPreview: "Food preview",
  },
  idle: {
    title: "Scan Your Meal",
    subtitle: "Take a photo to instantly calculate your strength fuel!",
    selectPhoto: "Select Photo",
  },
  validation: {
    notAnImage: "Please upload a valid image file.",
    fileTooLarge: "This image is too large. Please use a file under 12 MB.",
  },
  analyzing: {
    label: "Analyzing Fuel...",
  },
  success: {
    totalKcal: "Total Kcal",
    protein: "Protein",
    carbs: "Carbs",
    fat: "Fat",
    messageFallback: "This is an estimate based on the photo.",
    cta: "Pump Up Again",
  },
  noFood: {
    title: "No meal detected",
    messageFallback:
      "We could not find food in this image. Try a clearer photo of your meal.",
    cta: "Try another photo",
  },
  error: {
    title: "Something went wrong",
    body: "We could not complete your scan. Please try again.",
    cta: "Try Again",
  },
} as const;
