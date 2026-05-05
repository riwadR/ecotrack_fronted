import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendBaseUrl } from "@/lib/backend-url";
import { backendRefreshAndSessionUser } from "@/lib/backend-auth";
import {
  setAuthCookiesOnResponse,
} from "@/lib/auth-cookies";

function isNullBodyStatus(status: number) {
  // Per Fetch spec: null body statuses include 204, 205, 304.
  return status === 204 || status === 205 || status === 304;
}

async function proxy(req: NextRequest, method: string) {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  const url = new URL(req.url);
  const prefix = "/api/backend/";
  const restPath = url.pathname.startsWith(prefix)
    ? url.pathname.slice(prefix.length)
    : "";

  const upstreamUrl = new URL(
    `${getBackendBaseUrl()}/api/${restPath}${url.search}`
  );

  const bodyText =
    method === "GET" || method === "HEAD" ? undefined : await req.text();

  async function callUpstream(token: string | undefined) {
    const headers = new Headers(req.headers);
    headers.delete("host");
    headers.delete("connection");
    headers.delete("content-length");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    } else {
      headers.delete("authorization");
    }

    if (bodyText !== undefined) {
      headers.set(
        "content-length",
        Buffer.byteLength(bodyText, "utf8").toString()
      );
    } else {
      headers.delete("content-length");
    }

    return fetch(upstreamUrl, {
      method,
      headers,
      body: bodyText,
      cache: "no-store",
    });
  }

  let upstreamRes = await callUpstream(accessToken);

  if (upstreamRes.status === 401 && refreshToken) {
    const refreshed = await backendRefreshAndSessionUser(refreshToken);
    if (refreshed) {
      accessToken = refreshed.accessToken;
      upstreamRes = await callUpstream(accessToken);
      const resHeaders = new Headers(upstreamRes.headers);
      resHeaders.delete("transfer-encoding");
      resHeaders.delete("content-encoding");
      resHeaders.delete("content-length");

      const res = isNullBodyStatus(upstreamRes.status)
        ? new NextResponse(null, { status: upstreamRes.status, headers: resHeaders })
        : new NextResponse(await upstreamRes.text(), {
            status: upstreamRes.status,
            headers: resHeaders,
          });
      setAuthCookiesOnResponse(
        res,
        refreshed.accessToken,
        refreshed.refreshToken,
        refreshed.sessionUser
      );
      return res;
    }
  }

  const resHeaders = new Headers(upstreamRes.headers);
  resHeaders.delete("transfer-encoding");
  resHeaders.delete("content-encoding");
  resHeaders.delete("content-length");

  if (isNullBodyStatus(upstreamRes.status)) {
    return new NextResponse(null, {
      status: upstreamRes.status,
      headers: resHeaders,
    });
  }

  const body = await upstreamRes.text();
  return new NextResponse(body, { status: upstreamRes.status, headers: resHeaders });
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
