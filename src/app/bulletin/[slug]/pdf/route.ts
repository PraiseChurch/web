import { NextResponse } from "next/server";
import { renderToStream, type DocumentProps } from "@react-pdf/renderer";
import React from "react";
import { getBySlug } from "../../_data/bulletins";
import { getConfig } from "../../_data/config";
import { resolveBulletin } from "../../_data/resolve";
import { BulletinDocument } from "../../_pdf/BulletinDocument";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const bulletin = getBySlug(slug);
  if (!bulletin) {
    return new NextResponse("Not Found", { status: 404 });
  }
  const resolved = resolveBulletin(bulletin, getConfig());
  const stream = await renderToStream(
    React.createElement(BulletinDocument, {
      resolved,
    }) as React.ReactElement<DocumentProps>,
  );

  // renderToStream returns a Node Readable; convert to Web ReadableStream for NextResponse.
  const webStream = new ReadableStream({
    start(controller) {
      stream.on("data", (chunk: Buffer) =>
        controller.enqueue(new Uint8Array(chunk)),
      );
      stream.on("end", () => controller.close());
      stream.on("error", (err) => controller.error(err));
    },
  });

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="bulletin-${bulletin.date}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
