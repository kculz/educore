import type { Metadata } from 'next';

import { AdmissionWorkspace } from './admission-workspace';

export const metadata: Metadata = {
  title: 'Admission | EduCore',
  description: 'EduCore admission command center',
};

export default function AdmissionPage() {
  return <AdmissionWorkspace />;
}
