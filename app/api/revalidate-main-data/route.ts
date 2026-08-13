import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    revalidatePath("/(main)/", "page");
    return NextResponse.json({ message: "Revalidation done" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "internal Error" }, { status: 500 });
  }
}
