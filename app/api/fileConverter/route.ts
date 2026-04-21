// import { NextRequest, NextResponse } from "next/server";
// import { PDFParse } from 'pdf-parse';

// export async function POST(req: NextRequest) {
//   const formData = await req.formData();
//   const files = formData.getAll("file") as File[];

//     const parser = new PDFParse({ data: await files[0].arrayBuffer() });

// 	const result = await parser.getText();

// 	console.log(result.text);

//   return NextResponse.json({data: result.text});
// }


import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";

export const runtime = "nodejs"; // VERY important for Vercel

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const file = files[0];

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse PDF
    const data = await pdf(buffer);

    return NextResponse.json({
      data: data.text,
    });
  } catch (error) {
    console.error("PDF parsing error:", error);

    return NextResponse.json(
      { error: "Failed to process PDF" },
      { status: 500 }
    );
  }
}