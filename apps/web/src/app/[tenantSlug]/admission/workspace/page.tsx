import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AdmissionWorkspace } from '../../../admission/admission-workspace';
import { loadPublicTenantBySlug } from '@web/lib/tenant-directory';

type TenantWorkspacePageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export const dynamic = 'force-dynamic';

async function loadTenant(params: Promise<{ tenantSlug: string }>) {
  const { tenantSlug } = await params;
  const tenant = await loadPublicTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  return tenant;
}

export async function generateMetadata({ params }: TenantWorkspacePageProps): Promise<Metadata> {
  const tenant = await loadTenant(params);

  return {
    title: `${tenant.name} Admission Portal`,
    description: `Protected staff portal for ${tenant.name}, accessed through the tenant domain.`,
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
    alternates: {
      canonical: `/${tenant.slug}/admission/workspace`,
    },
  };
}

export default async function TenantWorkspacePage({ params }: TenantWorkspacePageProps) {
  const tenant = await loadTenant(params);

  return <AdmissionWorkspace preferredTenantSlug={tenant.slug} tenantName={tenant.name} />;
}
