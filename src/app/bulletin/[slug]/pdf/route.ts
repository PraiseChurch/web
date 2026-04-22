import { NextResponse } from "next/server";
import { renderToStream, type DocumentProps } from "@react-pdf/renderer";
import React from "react";
import { getPublishedBySlug } from "../../_data/bulletins";
import { resolveStoredBulletin } from "../../_data/resolve";
import { BulletinDocument } from "../../_pdf/BulletinDocument";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const stored = await getPublishedBySlug(slug);
  if (!stored) {
    return new NextResponse("Not Found", { status: 404 });
  }
  const resolved = await resolveStoredBulletin(stored);
  const stream = await renderToStream(
    React.createElement(BulletinDocument, {
      resolved,
    }) as React.ReactElement<DocumentProps>,
  );

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
      "Content-Disposition": `inline; filename="bulletin-${stored.bulletin.date}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
