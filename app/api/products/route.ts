import { NextResponse } from "next/server";
import { getProducts } from "@/lib/shopify";

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json(
      { mensaje: "No fue posible obtener los productos." },
      { status: 500 }
    );
  }
}
