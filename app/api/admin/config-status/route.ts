import { NextRequest } from 'next/server';
import { requireAdminWallet } from '@/lib/adminAuth';
import { getSessionWallet } from '@/lib/session';
import { privateJson } from '@/lib/httpResponses';
import { ENV_MANIFEST, isRequiredInProduction } from '@/lib/envManifest';

// Driven by lib/envManifest.ts (issue #1327). Only reports presence — never
// return secret values.
export async function GET(req: NextRequest) {
  if (!requireAdminWallet(req)) {
    return getSessionWallet(req)
      ? privateJson({ error: 'Forbidden' }, { status: 403 })
      : privateJson({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = ENV_MANIFEST.map((v) => {
    const value = process.env[v.name];
    const present = typeof value === 'string' && value.trim().length > 0;
    return {
      name: v.name,
      required: isRequiredInProduction(v),
      secret: v.secret,
      present,
    };
  });

  return privateJson(result);
}
