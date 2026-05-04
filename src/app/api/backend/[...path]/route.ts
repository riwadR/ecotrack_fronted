import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

function getBackendBaseUrl() {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is missing (expected e.g. http://localhost:8080)"
    );
  }
  return base.replace(/\/+$/, "");
}

async function proxy(req: NextRequest, method: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const url = new URL(req.url);
  const prefix = "/api/backend/";
  const restPath = url.pathname.startsWith(prefix)
    ? url.pathname.slice(prefix.length)
    : "";

  const upstreamUrl = new URL(
    `${getBackendBaseUrl()}/api/${restPath}${url.search}`
  );

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const bodyText =
    method === "GET" || method === "HEAD" ? undefined : await req.text();

  if (bodyText !== undefined) {
    headers.set("content-length", Buffer.byteLength(bodyText, "utf8").toString());
  } else {
    headers.delete("content-length");
  }

  const upstreamRes = await fetch(upstreamUrl, {
    method,
    headers,
    body: bodyText,
    cache: "no-store",
  });

  const resHeaders = new Headers(upstreamRes.headers);
  resHeaders.delete("transfer-encoding");
  resHeaders.delete("content-encoding");

  const body = await upstreamRes.text();

  return new NextResponse(body, {
    status: upstreamRes.status,
    headers: resHeaders,
  });
}

export async function GET(req: NextRequest) {
  return proxy(req, "GET");
}

export async function POST(req: NextRequest) {
  return proxy(req, "POST");
}

export async function PUT(req: NextRequest) {
  return proxy(req, "PUT");
}

export async function PATCH(req: NextRequest) {
  return proxy(req, "PATCH");
}

export async function DELETE(req: NextRequest) {
  return proxy(req, "DELETE");
}

