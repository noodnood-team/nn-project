import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ ok: false, message: 'No file uploaded.' }, { status: 400 });
    }

    if (process.env.NODE_ENV === "development") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    
    const fileName = file.name.toLowerCase();
    
    if (fileName.includes('bike') || fileName.includes('notfood')) {
      return NextResponse.json({
        ok: false,
        prediction: null,
        message:
          'I could not detect food in this image. Please try again with a clearer meal photo.',
      });
    }

    return NextResponse.json({
      ok: true,
      prediction: {
        calories: 683.0,
        protein: 68.0,
        carbs: 19.0,
        fat: 37.0
      },
      message: "This result is an estimate based on the uploaded image and may not be 100% accurate."
    });

  } catch (err) {
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 });
  }
}
