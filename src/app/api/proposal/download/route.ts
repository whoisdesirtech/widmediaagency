import { NextRequest, NextResponse } from "next/server";
import { generateProposal, ProposalData } from "@/lib/proposal-generator";
import JSZip from "jszip";

export async function POST(request: NextRequest) {
  try {
    const data: ProposalData = await request.json();

    if (!data.clientName || !data.eventTitle) {
      return NextResponse.json(
        { error: "Missing required fields: clientName and eventTitle are required." },
        { status: 400 }
      );
    }

    // 1. Generate the proposal assets
    const compiled = generateProposal(data);

    // 2. Initialize JSZip
    const zip = new JSZip();

    // 3. Populate zip folder structures
    zip.file("index.html", compiled.html);
    zip.file("styles.css", compiled.css);
    zip.file("script.js", compiled.js);
    zip.file("README.md", compiled.readme);
    
    // Create an empty photos directory (creates folder placeholder)
    zip.folder("photos");

    // 4. Compress to standard Uint8Array
    const binaryBuffer = await zip.generateAsync({ type: "uint8array" });

    // 5. Construct attachment filename
    const safeClientName = data.clientName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const filename = `proposal-${safeClientName}.zip`;

    // 6. Return response with binary content headers
    return new NextResponse(binaryBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": binaryBuffer.length.toString(),
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error: any) {
    console.error("Failed to generate ZIP download:", error);
    return NextResponse.json(
      { error: `Compilation error: ${error.message}` },
      { status: 500 }
    );
  }
}
