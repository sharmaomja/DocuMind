import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from 'pdf-parse';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll("file") as File[];

    const parser = new PDFParse({ data: await files[0].arrayBuffer() });

	const result = await parser.getText();

	console.log(result.text);

  return NextResponse.json({data: result.text});
}